/**
 * Datafix and regression check for wine type classification.
 *
 * Logic:
 * - Match names containing sparkling keywords (case-insensitive)
 * - Skip if name also contains "rosé", "rose", or "roze" — those are sparkling rosés,
 *   and keeping them as "rose" is defensible
 * - Skip if wineType is already "sparkling"
 *
 * Usage:
 *   node --import tsx apps/web/scripts/fix-wine-types.ts            # dry-run (default)
 *   node --import tsx apps/web/scripts/fix-wine-types.ts --apply    # write to DB
 *   node --import tsx apps/web/scripts/fix-wine-types.ts --check    # verify classifier vs DB
 */

import { db } from "../lib/db/client";
import { classifyWineType } from "../scrapers/normalize";

const SPARKLING_KEYWORDS = [
  "prosecco",
  "cava",
  "champagne",
  "spumante",
  "crémant",
  "cremant",
  "sekt",
  "sparkling",
  "mousserend",
  "mousserende",
  "bubbel",
  "bubbles",
  "pétillant",
  "petillant",
];

// If the name contains any of these (as whole words) alongside a sparkling keyword,
// leave the wine alone — it's a sparkling rosé and "rose" is a valid type for it.
//
// \b doesn't work with non-ASCII chars like é (char 233), so we use
// lookbehind/lookahead instead of word boundaries.
const ROSE_WORD_PATTERN = /(?<![a-zA-Z])(ros[eé]|roz[eé]|rosado|rosato)(?![a-zA-Z])/i;

// Names containing these terms are NOT wines — skip them entirely.
// "grappa" is a spirit made from grape pomace, not a sparkling wine.
// "Nonino" is a known Italian grappa producer; their "Prosecco Barrique" is a grappa,
// not a sparkling wine, even though the name includes "Prosecco" (the grape variety).
const NON_WINE_PATTERN = /\bgrappa\b|\bnonino\b/i;

function isSparklingKeywordMatch(name: string): boolean {
  const lower = name.toLowerCase();
  return SPARKLING_KEYWORDS.some((kw) => lower.includes(kw));
}

function hasRoseMarker(name: string): boolean {
  return ROSE_WORD_PATTERN.test(name);
}

function isNonWine(name: string): boolean {
  return NON_WINE_PATTERN.test(name);
}

async function checkClassifier() {
  console.log("=== CHECK MODE: classifier regression check ===");
  console.log("");
  console.log("Checks that classifyWineType() does not re-introduce misclassifications");
  console.log("that the datafix already corrected. Specifically:");
  console.log("  - non-sparkling wines with sparkling keywords → would become 'sparkling'");
  console.log("    (those are regressions if they exist in DB as rose/white/red)");
  console.log("");

  // Only look at wines that HAVE a non-sparkling type set — these were either correct
  // before, or were fixed by this script. If the classifier disagrees with the DB here,
  // it means it would re-introduce the misclassification on next scrape.
  const wines = await db.canonicalWine.findMany({
    where: { wineType: { not: null } },
    select: { id: true, name: true, wineType: true },
    orderBy: { name: "asc" },
  });

  console.log(`Total canonical wines with a type set: ${wines.length}`);

  // The problematic case: DB says some non-sparkling type, but the classifier would
  // return 'sparkling'. This means a re-scrape would create a duplicate canonical wine
  // with the wrong type fixed by the classifier.
  //
  // Sparkling rosés (DB = sparkling, classifier = rose) are intentional: the classifier
  // returns 'rose' for sparkling rosés, which is the agreed-upon fallback.
  // We don't count those as regressions.
  type Mismatch = { name: string; dbType: string | null; classified: string | null };
  const regressions: Mismatch[] = [];
  const informational: Mismatch[] = [];

  for (const wine of wines) {
    const classified = classifyWineType(wine.name, wine.wineType);
    if (classified === wine.wineType) continue;

    // Check if this is the known sparkling-rosé case (db=sparkling, classifier=rose)
    const isSparklingRose =
      wine.wineType === "sparkling" && classified === "rose";
    if (isSparklingRose) {
      informational.push({ name: wine.name, dbType: wine.wineType, classified });
    } else {
      regressions.push({ name: wine.name, dbType: wine.wineType, classified });
    }
  }

  if (regressions.length === 0) {
    console.log("OK — 0 regressions detected.");
  } else {
    console.log(`REGRESSIONS (${regressions.length} wine(s) would be misclassified on next scrape):`);
    for (const m of regressions) {
      console.log(`  [db: ${m.dbType ?? "null"}] → [classifier: ${m.classified ?? "null"}]  ${m.name}`);
    }
  }

  if (informational.length > 0) {
    console.log("");
    console.log(`INFO — ${informational.length} sparkling rosé(s) (db=sparkling, classifier=rose — expected, not a regression):`);
    for (const m of informational) {
      console.log(`  ${m.name}`);
    }
  }

  process.exit(regressions.length > 0 ? 1 : 0);
}

async function main() {
  if (process.argv.includes("--check")) {
    await checkClassifier();
    return;
  }

  const apply = process.argv.includes("--apply");

  console.log(`Mode: ${apply ? "APPLY (writing to DB)" : "DRY-RUN (no writes)"}`);
  console.log("");

  // Fetch all canonical wines that are not already sparkling
  const wines = await db.canonicalWine.findMany({
    where: { wineType: { not: "sparkling" } },
    select: { id: true, name: true, wineType: true },
    orderBy: { name: "asc" },
  });

  console.log(`Total non-sparkling canonical wines: ${wines.length}`);
  console.log("");

  const toFix: typeof wines = [];
  const skippedRose: typeof wines = [];
  const skippedNonWine: typeof wines = [];

  for (const wine of wines) {
    if (!isSparklingKeywordMatch(wine.name)) continue;

    if (isNonWine(wine.name)) {
      skippedNonWine.push(wine);
    } else if (hasRoseMarker(wine.name)) {
      skippedRose.push(wine);
    } else {
      toFix.push(wine);
    }
  }

  // --- Analysis output ---
  console.log("=== WILL FIX (sparkling keyword, no rosé marker) ===");
  if (toFix.length === 0) {
    console.log("  (none)");
  } else {
    for (const w of toFix) {
      console.log(`  [${w.wineType ?? "null"}]  ${w.name}`);
    }
  }

  console.log("");
  console.log("=== SKIPPED — sparkling rosé (kept as rose/null) ===");
  if (skippedRose.length === 0) {
    console.log("  (none)");
  } else {
    for (const w of skippedRose) {
      console.log(`  [${w.wineType ?? "null"}]  ${w.name}`);
    }
  }

  console.log("");
  console.log("=== SKIPPED — not a wine (grappa, etc.) ===");
  if (skippedNonWine.length === 0) {
    console.log("  (none)");
  } else {
    for (const w of skippedNonWine) {
      console.log(`  [${w.wineType ?? "null"}]  ${w.name}`);
    }
  }

  console.log("");
  console.log(`Summary: ${toFix.length} to fix, ${skippedRose.length} skipped (sparkling rosé), ${skippedNonWine.length} skipped (non-wine)`);

  if (!apply) {
    console.log("");
    console.log("Dry-run complete. Pass --apply to write changes.");
    process.exit(0);
  }

  // --- Apply fixes ---
  console.log("");
  console.log("Applying fixes...");

  let fixed = 0;
  for (const wine of toFix) {
    await db.canonicalWine.update({
      where: { id: wine.id },
      data: { wineType: "sparkling" },
    });
    fixed++;
  }

  console.log(`Done. Updated ${fixed} wines to wineType = 'sparkling'.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
