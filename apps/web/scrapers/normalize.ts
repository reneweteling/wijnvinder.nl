/**
 * Wine name normalization utilities.
 * Strips accents, removes filler words, extracts vintage and producer hints.
 */

// ---------------------------------------------------------------------------
// Wine type classification
// ---------------------------------------------------------------------------

/**
 * Keywords that, when present in a wine name, indicate a sparkling wine.
 * Subset of common sparkling wine styles and terms.
 */
const SPARKLING_KEYWORDS = [
  'prosecco',
  'cava',
  'champagne',
  'spumante',
  'crémant',
  'cremant',
  'sekt',
  'sparkling',
  'mousserend',
  'mousserende',
  'bubbel',
  'bubbles',
  'pétillant',
  'petillant',
]

/**
 * Keywords that indicate a dessert/fortified wine.
 * Checked after sparkling so "sparkling port" would still match sparkling.
 */
const DESSERT_KEYWORDS = [
  'port', 'porto', 'sherry', 'jerez', 'dessert',
  'sauternes', 'pedro ximenez', 'pedro ximénez',
]

/**
 * Matches a standalone rosé/rosado/rosato word in the wine name.
 *
 * \b doesn't work reliably with non-ASCII chars (é is char 233), so we use
 * lookbehind/lookahead instead of word boundaries.
 */
const ROSE_WORD_RE = /(?<![a-zA-Z])(ros[eé]|roz[eé]|rosado|rosato)(?![a-zA-Z])/i

/**
 * Matches names that are spirits, not wines.
 * "Nonino" produces a grappa that contains "Prosecco" in the name (grape variety),
 * so we must skip it to avoid false sparkling classification.
 */
const NON_WINE_RE = /\bgrappa\b|\bnonino\b/i

/**
 * Classify a wine's type from its name and an optional category/type hint
 * provided by the scraper.
 *
 * Rules (applied in order):
 * 1. If the name matches a non-wine pattern (grappa, Nonino), return the hint as-is.
 * 2. Sparkling keyword AND no standalone rosé → 'sparkling'.
 *    Sparkling keyword AND standalone rosé → 'rose' (sparkling rosé).
 * 3. Standalone rosé word → 'rose'.
 * 4. Dessert keyword → 'dessert'.
 * 5. Red keyword in name → 'red'; white keyword → 'white'.
 * 6. Otherwise return the hint unchanged (may be null/undefined).
 *
 * This is the canonical correction layer. It prevents sparkling wines from
 * being misclassified as 'rose' or 'white' when the scraper's category signal
 * is wrong (e.g. a shop puts "Prosecco Rosé" in the rosé category, or a
 * scraper checks rosé keywords before sparkling keywords).
 */
export function classifyWineType(
  name: string,
  hint?: string | null,
): string | null {
  if (NON_WINE_RE.test(name)) return hint ?? null

  const lower = name.toLowerCase()
  const hasSparkling = SPARKLING_KEYWORDS.some((kw) => lower.includes(kw))

  if (hasSparkling) {
    // Sparkling rosé: keep as 'rose' so it shows up in both sparkling and rosé filters.
    // Non-rosé sparkling: override to 'sparkling' regardless of the hint.
    return ROSE_WORD_RE.test(name) ? 'rose' : 'sparkling'
  }

  // No sparkling keyword — trust the hint (or apply a rosé name override).
  if (ROSE_WORD_RE.test(name)) return 'rose'

  // Keyword fallbacks — only applied when the scraper provides no hint.
  // This avoids overriding a shop's explicit category (e.g. white port typed as 'white').
  if (!hint) {
    if (DESSERT_KEYWORDS.some((kw) => lower.includes(kw))) return 'dessert'
    if (/\b(rood|rouge|red|tinto|rosso|nero|noir)\b/.test(lower)) return 'red'
    if (/\b(wit|blanc|white|bianco|blanco|weiss|chardonnay|sauvignon|riesling|viognier|pinot gris|pinot grigio)\b/.test(lower)) return 'white'
  }

  return hint ?? null
}

// ---------------------------------------------------------------------------

export type NormalizedWine = {
  producer: string
  name: string
  vintage: number | undefined
  searchName: string
}

// Filler words/phrases that don't help identify the wine
const FILLER_WORDS = [
  'wijn', 'wine', 'rouge', 'blanc', 'rosé', 'rose', 'bianco', 'rosso',
  'tinto', 'branco', 'vinho', 'vino', 'rojo', 'secco', 'sec', 'dry',
  'halbtrocken', 'lieblich', 'demi-sec', 'doux', 'sweet',
  'cuvée', 'cuvee', 'reserve', 'reserva', 'riserva', 'gran reserva',
  'superiore', 'classico', 'superieur',
  'magnum', '75cl', '75 cl', '1.5l', '1,5l',
  'fles', 'bottle', 'btl',
  'nl', 'bio', 'organic', 'biologisch',
]

/**
 * Strip unicode accent characters, converting e.g. é -> e.
 */
function stripAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Extract a 4-digit vintage year (1900–2099) from the name.
 * Returns the year if found, or undefined.
 */
export function extractVintage(str: string): number | undefined {
  const match = str.match(/\b(19\d{2}|20\d{2})\b/)
  if (!match) return undefined
  const year = parseInt(match[1], 10)
  const currentYear = new Date().getFullYear()
  // Sanity check: must be a plausible wine vintage
  if (year >= 1900 && year <= currentYear + 1) return year
  return undefined
}

/**
 * Normalize a raw wine name into structured parts.
 * Returns { producer, name, vintage, searchName }
 *
 * The heuristic: the first word(s) before a comma or obvious break
 * are often the producer. The rest is the wine name.
 */
export function normalizeWineName(raw: string): NormalizedWine {
  // Step 1: extract vintage before modifying string
  const vintage = extractVintage(raw)

  // Step 2: strip vintage from string for further processing
  const cleaned = raw.replace(/\b(19\d{2}|20\d{2})\b/, '').trim()

  // Step 3: split on comma to find producer hint
  // e.g. "Château Margaux, Grand Cru" -> producer=Château Margaux, name=Grand Cru
  let producer = ''
  let name = cleaned

  const commaIdx = cleaned.indexOf(',')
  if (commaIdx > 0 && commaIdx < cleaned.length - 1) {
    producer = cleaned.substring(0, commaIdx).trim()
    name = cleaned.substring(commaIdx + 1).trim()
  }

  // Step 4: normalize to lowercase, strip accents, remove fillers
  let searchBase = stripAccents(cleaned.toLowerCase())

  // Remove filler words (whole word only)
  for (const filler of FILLER_WORDS) {
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    searchBase = searchBase.replace(new RegExp(`\\b${escaped}\\b`, 'g'), ' ')
  }

  // Remove non-alphanumeric except spaces
  searchBase = searchBase.replace(/[^a-z0-9 ]/g, ' ')

  // Collapse whitespace
  searchBase = searchBase.replace(/\s+/g, ' ').trim()

  // Step 5: build searchName (lowercase, no accents, no fillers)
  const searchName = searchBase

  // Step 6: normalize producer/name display versions
  producer = producer.trim()
  name = name.trim()

  // Don't guess producer from the name — let the scraper provide it explicitly
  // Guessing splits multi-word names wrong (e.g., "La Bestia" → "La")

  return {
    producer: producer.trim(),
    name: name.trim() || raw.trim(),
    vintage,
    searchName,
  }
}
