export type WineType = 'red' | 'white' | 'rose' | 'sparkling'

export type FlavorProfile = 'fruity' | 'dry' | 'tannic' | 'oaky' | 'mineral' | 'spicy' | 'floral' | 'earthy'

export type WineProfileData = {
  wineTypes: WineType[]
  grapes: string[]
  flavors: FlavorProfile[]
  countries: string[]
  priceMin: number
  priceMax: number
}

export type RecommendationScore = {
  wineId: string
  totalScore: number
  grapeScore: number
  regionScore: number
  typeScore: number
  flavorScore: number
  priceScore: number
  ratingScore: number
}

export type ShopConfig = {
  slug: string
  name: string
  baseUrl: string
  enabled: boolean
}

export type ScrapedWine = {
  name: string
  producer?: string
  grape?: string
  country?: string
  region?: string
  type?: WineType
  vintage?: number
  price: number
  originalPrice?: number
  url: string
  imageUrl?: string
  /** Tasting panel score on a 0–5 scale (converted from percentage). */
  rating?: number
  /** Short wine description from the shop. */
  description?: string
}

export type VivinoWineRating = {
  wineName: string
  vintage?: number
  rating: number
  grape?: string
  country?: string
  region?: string
  wineType?: string
  imageUrl?: string
}
