import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { VivinoWineRating } from "@/lib/types";

function extractUsername(input: string): string {
  // Handle full URLs like https://www.vivino.com/users/reneweteling
  const urlMatch = input.match(/vivino\.com\/users\/([^/?#]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  // Otherwise treat as direct username
  return input.trim();
}

async function scrapeVivinoProfile(
  username: string,
): Promise<{ ratings: VivinoWineRating[]; mock: boolean }> {
  const url = `https://www.vivino.com/users/${username}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Profiel niet gevonden. Controleer de gebruikersnaam.");
    }
    if (response.status === 403) {
      throw new Error(
        "Dit profiel is privé of niet toegankelijk. Zorg dat je profiel openbaar is op Vivino.",
      );
    }
    throw new Error(
      `Kon Vivino profiel niet ophalen (status ${response.status}).`,
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const ratings: VivinoWineRating[] = [];

  // Try to parse wine ratings from Vivino profile page
  // Vivino uses React/JS rendering so we may need to parse JSON from script tags
  $("script").each((_, el) => {
    const content = $(el).html() || "";

    // Look for wine data in next.js or embedded JSON payloads
    if (content.includes("wine_ratings") || content.includes("wineRatings")) {
      try {
        const match = content.match(/"wine_ratings"\s*:\s*(\[[\s\S]*?\])/);
        if (match) {
          const parsed = JSON.parse(match[1]);
          for (const item of parsed) {
            ratings.push({
              wineName: item.wine?.name || item.name || "Onbekend",
              vintage: item.vintage?.year || item.year || undefined,
              rating: item.rating || item.user_rating || 3,
              grape: item.wine?.grape?.name || item.grape || undefined,
              country:
                item.wine?.region?.country?.name ||
                item.country ||
                undefined,
              region: item.wine?.region?.name || item.region || undefined,
              wineType: item.wine?.type?.name || item.type || undefined,
              imageUrl: item.wine?.image?.location || item.imageUrl || undefined,
            });
          }
        }
      } catch {
        // Failed to parse JSON from script tag
      }
    }
  });

  // Fallback: try to parse from HTML elements (older Vivino page structure)
  if (ratings.length === 0) {
    $('[class*="wine-card"], [class*="winecard"], .activity-item').each(
      (_, el) => {
        const name =
          $(el).find('[class*="wine-card__name"], h3, .wine-name').first().text().trim();
        const ratingText = $(el)
          .find('[class*="rating"], .user-rating')
          .first()
          .text()
          .trim();
        const grape = $(el)
          .find('[class*="grape"], .grape-name')
          .first()
          .text()
          .trim();
        const region = $(el)
          .find('[class*="region"], .wine-region')
          .first()
          .text()
          .trim();
        const imageUrl =
          $(el).find("img").first().attr("src") ||
          $(el).find("img").first().attr("data-src");

        if (name) {
          const rating = parseFloat(ratingText) || 3.5;
          ratings.push({
            wineName: name,
            rating: Math.min(5, Math.max(1, rating)),
            grape: grape || undefined,
            region: region || undefined,
            imageUrl: imageUrl || undefined,
          });
        }
      },
    );
  }

  // TODO: Vivino's website is heavily JavaScript-rendered (React SPA).
  // The HTML scraping approach above may not work reliably.
  // For a production implementation, consider:
  // 1. Using Vivino's unofficial API endpoints (e.g., /api/users/{id}/ratings)
  // 2. Using a headless browser (Playwright/Puppeteer) via a queue job
  // 3. Asking users to export their Vivino data and upload it
  //
  // For now, returning mock data if no ratings were parsed.
  if (ratings.length === 0) {
    return { ratings: getMockRatings(username), mock: true };
  }

  return { ratings, mock: false };
}

// Placeholder/mock data for when scraping fails (common for JS-heavy pages)
function getMockRatings(username: string): VivinoWineRating[] {
  return [
    {
      wineName: `Voorbeeld: Profiel van @${username} geladen`,
      rating: 4.0,
      grape: "Cabernet Sauvignon",
      country: "france",
      region: "Bordeaux",
      wineType: "red",
    },
    {
      wineName: "Château Margaux 2018",
      vintage: 2018,
      rating: 4.5,
      grape: "Cabernet Sauvignon",
      country: "france",
      region: "Bordeaux",
      wineType: "red",
    },
    {
      wineName: "Barolo Bussia 2019",
      vintage: 2019,
      rating: 4.2,
      grape: "Nebbiolo",
      country: "italy",
      region: "Piemonte",
      wineType: "red",
    },
    {
      wineName: "Sancerre Blanc 2021",
      vintage: 2021,
      rating: 3.8,
      grape: "Sauvignon Blanc",
      country: "france",
      region: "Loire",
      wineType: "white",
    },
  ];
}

export async function POST(request: Request) {
  let body: { username: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  if (!body.username?.trim()) {
    return NextResponse.json(
      { error: "Voer een Vivino gebruikersnaam in" },
      { status: 400 },
    );
  }

  const username = extractUsername(body.username);

  if (!username || username.length < 2) {
    return NextResponse.json(
      { error: "Ongeldige gebruikersnaam" },
      { status: 400 },
    );
  }

  try {
    const { ratings, mock } = await scrapeVivinoProfile(username);
    return NextResponse.json({ username, ratings, mock });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Er is een fout opgetreden";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
