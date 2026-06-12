import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callSommelier, findWines, findPersonalWines } from "@/lib/sommelier";
import { getServerAuthSession } from "@/lib/auth";
import { hashIp, checkQuota, recordQuestion } from "@/lib/sommelier-quota";
import type { WineProfileData } from "@/lib/types";

// ---------------------------------------------------------------------------
// Rate limiting: simple in-memory sliding window (burst guard, 10/5min per IP)
// ---------------------------------------------------------------------------

type RateEntry = { timestamps: number[] };
const rateMap = new Map<string, RateEntry>();
const RATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip) ?? { timestamps: [] };

  // Prune old entries
  entry.timestamps = entry.timestamps.filter((t) => now - t < RATE_WINDOW_MS);

  if (entry.timestamps.length >= RATE_MAX) {
    rateMap.set(ip, entry);
    return true;
  }

  entry.timestamps.push(now);
  rateMap.set(ip, entry);
  return false;
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  wineTypes: z.array(z.string()),
  grapes: z.array(z.string()),
  flavors: z.array(z.string()),
  countries: z.array(z.string()),
  priceMin: z.number(),
  priceMax: z.number(),
}).passthrough();

const bodySchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "Stel een vraag van minimaal 3 tekens.")
    .max(300, "Stel een vraag van maximaal 300 tekens."),
  profile: profileSchema.nullable().optional(),
});

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // Guard: API key must be present
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "De sommelier is tijdelijk niet beschikbaar." },
      { status: 503 }
    );
  }

  // Burst rate limit by IP (keeps existing 10/5min guard)
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0] : null)?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Even rustig aan, probeer het over een paar minuten weer." },
      { status: 429 }
    );
  }

  // Resolve authenticated user (may be null for anonymous visitors)
  const session = await getServerAuthSession();
  const userId = session?.user?.id ?? null;

  // Compute stable, privacy-safe IP fingerprint
  const ipHash = hashIp(ip);

  // Daily quota check — before we touch the LLM
  const quota = await checkQuota({ userId, ipHash });
  if (!quota.allowed) {
    if (userId) {
      return NextResponse.json(
        {
          error: "quota",
          message:
            "Je hebt je 20 vragen voor vandaag gebruikt. Morgen kun je weer verder proeven!",
          loginCta: false,
        },
        { status: 429 }
      );
    } else {
      return NextResponse.json(
        {
          error: "quota",
          message:
            "Je hebt je 3 gratis vragen voor vandaag gebruikt. Maak een gratis account of log in en stel tot 20 vragen per dag.",
          loginCta: true,
        },
        { status: 429 }
      );
    }
  }

  // Parse and validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Ongeldige invoer.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { question, profile } = parsed.data;

  // Call the sommelier
  let advice;
  try {
    advice = await callSommelier(question, profile as WineProfileData | null | undefined);
  } catch (err) {
    console.error("[sommelier] Anthropic call failed:", err);
    return NextResponse.json(
      { error: "Er ging iets mis bij de sommelier. Probeer het zo nog eens." },
      { status: 502 }
    );
  }

  // Off-topic: do NOT consume quota
  if (advice.off_topic) {
    return NextResponse.json({
      offTopic: true,
      message:
        "Daar kan ik je als sommelier helaas niet mee helpen. Stel me een vraag over wijn, of wat er lekker past bij je eten!",
    });
  }

  // Record the question now that we know the LLM gave a real answer
  await recordQuestion({ userId, ipHash, question });

  // remaining after this question
  const remaining = Math.max(0, quota.remaining - 1);

  const trad = advice.traditional!;

  // Fetch traditional wines
  const traditionalWines = await findWines(
    {
      wine_types: trad.wine_types,
      grapes: trad.grapes,
      countries: trad.countries,
      price_max: trad.price_max,
    },
    4
  );

  // Fetch personal wines (only when a valid profile and personal advice exist)
  let personalResult = null;
  if (profile && advice.personal) {
    const pers = advice.personal;
    const personalWines = await findPersonalWines(
      {
        wine_types: pers.wine_types.length > 0 ? pers.wine_types : trad.wine_types,
        grapes: pers.grapes,
        countries: pers.countries,
      },
      profile as WineProfileData,
      4
    );
    personalResult = { text: pers.text, wines: personalWines };
  }

  return NextResponse.json({
    traditional: { text: trad.text, wines: traditionalWines },
    personal: personalResult,
    remaining,
  });
}
