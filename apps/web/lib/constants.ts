import type { WineType, FlavorProfile, ShopConfig } from './types'

export const WINE_TYPES: { value: WineType; label: string }[] = [
  { value: 'red', label: 'Rood' },
  { value: 'white', label: 'Wit' },
  { value: 'rose', label: 'Ros\u00e9' },
  { value: 'sparkling', label: 'Mousserende' },
]

export const GRAPES = [
  'Cabernet Sauvignon',
  'Merlot',
  'Pinot Noir',
  'Syrah/Shiraz',
  'Tempranillo',
  'Sangiovese',
  'Nebbiolo',
  'Malbec',
  'Zinfandel',
  'Grenache/Garnacha',
  'Mourvèdre',
  'Barbera',
  'Carménère',
  'Pinotage',
  'Primitivo',
  'Petit Verdot',
  'Cabernet Franc',
  'Gamay',
  'Touriga Nacional',
  'Montepulciano',
  'Chardonnay',
  'Sauvignon Blanc',
  'Riesling',
  'Pinot Grigio/Pinot Gris',
  'Gewürztraminer',
  'Viognier',
  'Chenin Blanc',
  'Sémillon',
  'Muscat/Moscato',
  'Grüner Veltliner',
  'Albariño',
  'Verdejo',
  'Torrontés',
  'Vermentino',
  'Trebbiano',
  'Garganega',
  'Fiano',
  'Assyrtiko',
  'Godello',
  'Marsanne',
  'Roussanne',
  'Melon de Bourgogne',
] as const

export const FLAVORS: { value: FlavorProfile; label: string }[] = [
  { value: 'fruity', label: 'Fruitig' },
  { value: 'dry', label: 'Droog' },
  { value: 'tannic', label: 'Tannine-rijk' },
  { value: 'oaky', label: 'Eikenhout' },
  { value: 'mineral', label: 'Mineraal' },
  { value: 'spicy', label: 'Kruidig' },
  { value: 'floral', label: 'Bloemig' },
  { value: 'earthy', label: 'Aards' },
]

export const COUNTRIES = [
  { value: 'france', label: 'Frankrijk' },
  { value: 'italy', label: 'Italië' },
  { value: 'spain', label: 'Spanje' },
  { value: 'portugal', label: 'Portugal' },
  { value: 'germany', label: 'Duitsland' },
  { value: 'austria', label: 'Oostenrijk' },
  { value: 'greece', label: 'Griekenland' },
  { value: 'usa', label: 'Verenigde Staten' },
  { value: 'argentina', label: 'Argentinië' },
  { value: 'chile', label: 'Chili' },
  { value: 'australia', label: 'Australië' },
  { value: 'new-zealand', label: 'Nieuw-Zeeland' },
  { value: 'south-africa', label: 'Zuid-Afrika' },
  { value: 'hungary', label: 'Hongarije' },
  { value: 'romania', label: 'Roemenië' },
] as const

export const SHOP_CONFIGS: ShopConfig[] = [
  {
    slug: 'wijnvoordeel',
    name: 'Wijnvoordeel',
    baseUrl: 'https://www.wijnvoordeel.nl',
    enabled: true,
  },
  {
    slug: 'wijnbeurs',
    name: 'Wijnbeurs',
    baseUrl: 'https://www.wijnbeurs.nl',
    enabled: true,
  },
  {
    slug: 'gall',
    name: 'Gall & Gall',
    baseUrl: 'https://www.gall.nl',
    enabled: true,
  },
]

export const SCORING_WEIGHTS = {
  grape: 30,
  region: 20,
  type: 15,
  flavor: 15,
  price: 10,
  rating: 10,
} as const
