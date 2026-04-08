/** Shared Dutch → normalized country name mapping for all scrapers */
export const COUNTRY_MAP: Record<string, string> = {
  'spanje': 'Spanje',
  'frankrijk': 'Frankrijk',
  'italië': 'Italië',
  'italie': 'Italië',
  'portugal': 'Portugal',
  'duitsland': 'Duitsland',
  'oostenrijk': 'Oostenrijk',
  'griekenland': 'Griekenland',
  'verenigde staten': 'Verenigde Staten',
  'usa': 'Verenigde Staten',
  'argentinië': 'Argentinië',
  'argentinie': 'Argentinië',
  'argentina': 'Argentinië',
  'chili': 'Chili',
  'australië': 'Australië',
  'australie': 'Australië',
  'nieuw-zeeland': 'Nieuw-Zeeland',
  'nieuw zeeland': 'Nieuw-Zeeland',
  'zuid-afrika': 'Zuid-Afrika',
  'hongarije': 'Hongarije',
  'roemenië': 'Roemenië',
  'libanon': 'Libanon',
  'turkije': 'Turkije',
  'georgië': 'Georgië',
  'israël': 'Israël',
  'kroatië': 'Kroatië',
  'slovenië': 'Slovenië',
  'zwitserland': 'Zwitserland',
  'engeland': 'Engeland',
  'moldavië': 'Moldavië',
}

export function normalizeCountry(text: string): string | undefined {
  return COUNTRY_MAP[text.toLowerCase().trim()]
}
