import type { WineProfileData, RecommendationScore } from '@/lib/types'
import { scoreWine } from '@/lib/scoring'

export type ScoredWine = {
  wine: Record<string, unknown>
  score: RecommendationScore
  matchPercentage: number
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
    const { matchPercentage, ...score } = scoreWine(profile, wine)
    return {
      wine,
      score,
      matchPercentage,
    }
  })

  return scored.sort((a, b) => b.score.totalScore - a.score.totalScore)
}
