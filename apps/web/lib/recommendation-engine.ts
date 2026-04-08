import type { WineProfileData, RecommendationScore, FlavorProfile } from '@/lib/types'
import { SCORING_WEIGHTS } from '@/lib/constants'

export type ScoredWine = {
  wine: Record<string, unknown>
  score: RecommendationScore
  matchPercentage: number
}

// Grape to flavor profile mapping
const GRAPE_FLAVOR_MAP: Record<string, FlavorProfile[]> = {
  'Cabernet Sauvignon': ['tannic', 'oaky', 'dry', 'earthy'],
  'Merlot': ['fruity', 'oaky', 'dry'],
  'Pinot Noir': ['fruity', 'earthy', 'spicy'],
  'Syrah/Shiraz': ['spicy', 'tannic', 'fruity', 'earthy'],
  'Tempranillo': ['tannic', 'dry', 'earthy', 'spicy'],
  'Sangiovese': ['tannic', 'dry', 'earthy', 'spicy'],
  'Nebbiolo': ['tannic', 'dry', 'earthy', 'spicy'],
  'Malbec': ['fruity', 'tannic', 'oaky'],
  'Zinfandel': ['fruity', 'spicy', 'oaky'],
  'Grenache/Garnacha': ['fruity', 'spicy', 'dry'],
  'Mourvèdre': ['tannic', 'earthy', 'spicy'],
  'Barbera': ['fruity', 'dry', 'tannic'],
  'Carménère': ['spicy', 'earthy', 'tannic'],
  'Pinotage': ['fruity', 'earthy', 'spicy'],
  'Primitivo': ['fruity', 'spicy', 'oaky'],
  'Petit Verdot': ['tannic', 'spicy', 'dry'],
  'Cabernet Franc': ['earthy', 'spicy', 'dry'],
  'Gamay': ['fruity', 'floral'],
  'Touriga Nacional': ['tannic', 'fruity', 'spicy'],
  'Montepulciano': ['fruity', 'tannic', 'dry'],
  'Chardonnay': ['oaky', 'fruity', 'mineral'],
  'Sauvignon Blanc': ['mineral', 'floral', 'dry'],
  'Riesling': ['floral', 'mineral', 'fruity'],
  'Pinot Grigio/Pinot Gris': ['mineral', 'dry', 'floral'],
  'Gewürztraminer': ['floral', 'spicy', 'fruity'],
  'Viognier': ['floral', 'fruity', 'oaky'],
  'Chenin Blanc': ['fruity', 'mineral', 'floral'],
  'Sémillon': ['oaky', 'fruity', 'mineral'],
  'Muscat/Moscato': ['floral', 'fruity'],
  'Grüner Veltliner': ['mineral', 'spicy', 'dry'],
  'Albariño': ['mineral', 'floral', 'fruity'],
  'Verdejo': ['mineral', 'dry', 'floral'],
  'Torrontés': ['floral', 'fruity'],
  'Vermentino': ['mineral', 'floral', 'dry'],
  'Trebbiano': ['mineral', 'dry'],
  'Garganega': ['mineral', 'floral'],
  'Fiano': ['floral', 'mineral', 'fruity'],
  'Assyrtiko': ['mineral', 'dry'],
  'Godello': ['mineral', 'floral'],
  'Marsanne': ['oaky', 'fruity', 'mineral'],
  'Roussanne': ['floral', 'oaky', 'mineral'],
  'Melon de Bourgogne': ['mineral', 'dry'],
}

const MAX_SCORE = 100

/**
 * Score a single wine against a user profile.
 * Returns a RecommendationScore with individual category scores.
 */
function scoreWine(profile: WineProfileData, wine: Record<string, unknown>): RecommendationScore {
  const wineId = wine.id as string

  // --- Grape score (30 pts) ---
  let grapeScore = 0
  const wineGrape = wine.grape as string | undefined
  const wineGrapes = (wine.grapes as string[] | undefined) ?? []
  const allWineGrapes = [
    ...(wineGrape ? [wineGrape] : []),
    ...wineGrapes,
  ]

  if (profile.grapes.length > 0) {
    const exactMatch = allWineGrapes.some((g) =>
      profile.grapes.some(
        (pg) => pg.toLowerCase() === g.toLowerCase()
      )
    )
    if (exactMatch) {
      grapeScore = SCORING_WEIGHTS.grape
    } else {
      // Partial: flavor overlap via grape mapping
      const wineImpliedFlavors = new Set<FlavorProfile>()
      for (const g of allWineGrapes) {
        const mapped = GRAPE_FLAVOR_MAP[g] ?? []
        mapped.forEach((f) => wineImpliedFlavors.add(f))
      }
      const profileGrapeFlavors = new Set<FlavorProfile>()
      for (const g of profile.grapes) {
        const mapped = GRAPE_FLAVOR_MAP[g] ?? []
        mapped.forEach((f) => profileGrapeFlavors.add(f))
      }
      const overlap = [...wineImpliedFlavors].filter((f) =>
        profileGrapeFlavors.has(f)
      ).length
      const union = new Set([...wineImpliedFlavors, ...profileGrapeFlavors]).size
      grapeScore = union > 0 ? Math.round((overlap / union) * (SCORING_WEIGHTS.grape / 2)) : 0
    }
  } else {
    // No grape preference: give partial credit
    grapeScore = SCORING_WEIGHTS.grape / 2
  }

  // --- Region/Country score (20 pts) ---
  let regionScore = 0
  const wineCountry = (wine.country as string | undefined)?.toLowerCase()

  if (profile.countries.length > 0 && wineCountry) {
    const countryMatch = profile.countries.some(
      (c) => c.toLowerCase() === wineCountry
    )
    regionScore = countryMatch ? SCORING_WEIGHTS.region : 0
  } else {
    regionScore = SCORING_WEIGHTS.region / 2 // neutral
  }

  // --- Wine type score (15 pts) ---
  let typeScore = 0
  const wineType = (wine.wineType as string | undefined)?.toLowerCase()

  if (profile.wineTypes.length > 0 && wineType) {
    const typeMatch = profile.wineTypes.some(
      (t) => t.toLowerCase() === wineType
    )
    typeScore = typeMatch ? SCORING_WEIGHTS.type : 0
  } else {
    typeScore = Math.round(SCORING_WEIGHTS.type / 2) // neutral
  }

  // --- Flavor score (15 pts) ---
  let flavorScore = 0
  if (profile.flavors.length > 0) {
    const wineImpliedFlavors = new Set<FlavorProfile>()
    for (const g of allWineGrapes) {
      const mapped = GRAPE_FLAVOR_MAP[g] ?? []
      mapped.forEach((f) => wineImpliedFlavors.add(f))
    }
    const matches = profile.flavors.filter((f) =>
      wineImpliedFlavors.has(f as FlavorProfile)
    ).length
    flavorScore = Math.round((matches / profile.flavors.length) * SCORING_WEIGHTS.flavor)
  } else {
    flavorScore = Math.round(SCORING_WEIGHTS.flavor / 2) // neutral
  }

  // --- Price score (10 pts) ---
  let priceScore = 0
  const winePrice = wine.bestPrice as number | undefined

  if (winePrice != null) {
    if (winePrice >= profile.priceMin && winePrice <= profile.priceMax) {
      priceScore = SCORING_WEIGHTS.price
    } else if (winePrice < profile.priceMin) {
      // Cheaper is still ok but less preferred
      const diff = profile.priceMin - winePrice
      priceScore = Math.max(0, SCORING_WEIGHTS.price - Math.round(diff / 2))
    } else {
      // More expensive
      const diff = winePrice - profile.priceMax
      priceScore = Math.max(0, SCORING_WEIGHTS.price - Math.round(diff / 5))
    }
  } else {
    priceScore = SCORING_WEIGHTS.price / 2 // neutral when no price data
  }

  // --- Vivino rating score (10 pts) ---
  let ratingScore = 0
  const vivinoScore = wine.vivinoScore as number | undefined
  if (vivinoScore != null) {
    // Vivino scores range 1-5; 3.5+ is good, 4.0+ is great
    if (vivinoScore >= 4.0) {
      ratingScore = SCORING_WEIGHTS.rating
    } else if (vivinoScore >= 3.5) {
      ratingScore = Math.round(SCORING_WEIGHTS.rating * 0.7)
    } else if (vivinoScore >= 3.0) {
      ratingScore = Math.round(SCORING_WEIGHTS.rating * 0.4)
    } else {
      ratingScore = 1
    }
  } else {
    ratingScore = SCORING_WEIGHTS.rating / 2 // neutral
  }

  const totalScore = grapeScore + regionScore + typeScore + flavorScore + priceScore + ratingScore

  return {
    wineId,
    totalScore,
    grapeScore,
    regionScore,
    typeScore,
    flavorScore,
    priceScore,
    ratingScore,
  }
}

/**
 * Score a list of wines against a user profile.
 * Returns wines sorted by total score descending with match percentage.
 */
export function scoreWines(
  profile: WineProfileData,
  wines: Record<string, unknown>[]
): ScoredWine[] {
  const scored = wines.map((wine) => {
    const score = scoreWine(profile, wine)
    return {
      wine,
      score,
      matchPercentage: Math.round((score.totalScore / MAX_SCORE) * 100),
    }
  })

  return scored.sort((a, b) => b.score.totalScore - a.score.totalScore)
}
