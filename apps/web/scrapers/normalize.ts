/**
 * Wine name normalization utilities.
 * Strips accents, removes filler words, extracts vintage and producer hints.
 */

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
function extractVintage(str: string): number | undefined {
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
