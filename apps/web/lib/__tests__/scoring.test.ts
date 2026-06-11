import { describe, it, expect } from 'vitest'
import { scoreWine } from '@/lib/scoring'
import { SCORING_WEIGHTS } from '@/lib/constants'
import type { WineProfileData } from '@/lib/types'

const MAX_SCORE = 100

// A fully-populated profile that prefers Merlot, French reds, fruity/oaky, mid-range price
const fullProfile: WineProfileData = {
  wineTypes: ['red'],
  grapes: ['Merlot'],
  flavors: ['fruity', 'oaky'],
  countries: ['france'],
  priceMin: 10,
  priceMax: 30,
}

// A wine that matches all profile dimensions
const perfectWine: Record<string, unknown> = {
  id: 'wine-perfect',
  grape: 'Merlot',
  grapes: [],
  country: 'france',
  wineType: 'red',
  bestPrice: 20,
  vivinoScore: 4.2,
}

// A wine that mismatches on every dimension
const mismatchWine: Record<string, unknown> = {
  id: 'wine-mismatch',
  grape: 'Riesling',
  grapes: [],
  country: 'germany',
  wineType: 'white',
  bestPrice: 80,
  vivinoScore: 2.5,
}

describe('scoreWine – perfect match', () => {
  it('returns high matchPercentage for a perfect match', () => {
    const result = scoreWine(fullProfile, perfectWine)
    // Perfect match: full grape + region + type + flavor (2/2 matched) + price + rating
    expect(result.matchPercentage).toBeGreaterThanOrEqual(80)
  })

  it('gives full grape score for exact grape match', () => {
    const result = scoreWine(fullProfile, perfectWine)
    expect(result.grapeScore).toBe(SCORING_WEIGHTS.grape)
  })

  it('gives full region score for country match', () => {
    const result = scoreWine(fullProfile, perfectWine)
    expect(result.regionScore).toBe(SCORING_WEIGHTS.region)
  })

  it('gives full type score for wine type match', () => {
    const result = scoreWine(fullProfile, perfectWine)
    expect(result.typeScore).toBe(SCORING_WEIGHTS.type)
  })

  it('gives full price score when price is inside range', () => {
    const result = scoreWine(fullProfile, perfectWine)
    expect(result.priceScore).toBe(SCORING_WEIGHTS.price)
  })

  it('gives full rating score for vivinoScore >= 4.0', () => {
    const result = scoreWine(fullProfile, perfectWine)
    expect(result.ratingScore).toBe(SCORING_WEIGHTS.rating)
  })
})

describe('scoreWine – mismatch', () => {
  it('returns low matchPercentage for a full mismatch', () => {
    const result = scoreWine(fullProfile, mismatchWine)
    expect(result.matchPercentage).toBeLessThan(50)
  })

  it('gives zero grape score for unrelated grape without flavor overlap', () => {
    // Riesling flavors (floral, mineral, fruity) vs Merlot flavors (fruity, oaky, dry)
    // They share 'fruity', so not zero — but it should be partial, not full
    const result = scoreWine(fullProfile, mismatchWine)
    expect(result.grapeScore).toBeLessThan(SCORING_WEIGHTS.grape)
  })

  it('gives zero region score for wrong country', () => {
    const result = scoreWine(fullProfile, mismatchWine)
    expect(result.regionScore).toBe(0)
  })

  it('gives zero type score for wrong wine type', () => {
    const result = scoreWine(fullProfile, mismatchWine)
    expect(result.typeScore).toBe(0)
  })
})

describe('scoreWine – matchPercentage bounds', () => {
  it('is always between 0 and 100 for a perfect match', () => {
    const result = scoreWine(fullProfile, perfectWine)
    expect(result.matchPercentage).toBeGreaterThanOrEqual(0)
    expect(result.matchPercentage).toBeLessThanOrEqual(100)
  })

  it('is always between 0 and 100 for a mismatch', () => {
    const result = scoreWine(fullProfile, mismatchWine)
    expect(result.matchPercentage).toBeGreaterThanOrEqual(0)
    expect(result.matchPercentage).toBeLessThanOrEqual(100)
  })

  it('totalScore never exceeds MAX_SCORE (100)', () => {
    const result = scoreWine(fullProfile, perfectWine)
    expect(result.totalScore).toBeLessThanOrEqual(MAX_SCORE)
  })
})

describe('scoreWine – empty profile fields', () => {
  const emptyProfile: WineProfileData = {
    wineTypes: [],
    grapes: [],
    flavors: [],
    countries: [],
    priceMin: 0,
    priceMax: 1000,
  }

  it('does not throw with an empty profile', () => {
    expect(() => scoreWine(emptyProfile, perfectWine)).not.toThrow()
  })

  it('returns neutral matchPercentage (non-zero) for empty profile', () => {
    const result = scoreWine(emptyProfile, perfectWine)
    // All dimensions return half credit → total = 15+10+7+7+5+5 = ~49+
    expect(result.matchPercentage).toBeGreaterThan(0)
  })
})

describe('scoreWine – wine without price or vivinoScore', () => {
  const bareWine: Record<string, unknown> = {
    id: 'wine-bare',
    grape: 'Merlot',
    grapes: [],
    country: 'france',
    wineType: 'red',
    // no bestPrice, no vivinoScore
  }

  it('does not throw when wine has no price', () => {
    expect(() => scoreWine(fullProfile, bareWine)).not.toThrow()
  })

  it('does not throw when wine has no vivinoScore', () => {
    expect(() => scoreWine(fullProfile, bareWine)).not.toThrow()
  })

  it('gives neutral price score when bestPrice is absent', () => {
    const result = scoreWine(fullProfile, bareWine)
    expect(result.priceScore).toBe(SCORING_WEIGHTS.price / 2)
  })

  it('gives neutral rating score when vivinoScore is absent', () => {
    const result = scoreWine(fullProfile, bareWine)
    expect(result.ratingScore).toBe(SCORING_WEIGHTS.rating / 2)
  })
})

describe('scoreWine – price range edge cases', () => {
  it('deducts when price is above range', () => {
    const result = scoreWine(fullProfile, { ...perfectWine, id: 'w1', bestPrice: 50 })
    // diff = 50 - 30 = 20 → score = max(0, 10 - round(20/5)) = max(0, 10-4) = 6
    expect(result.priceScore).toBe(6)
  })

  it('deducts less when price is below range', () => {
    const result = scoreWine(fullProfile, { ...perfectWine, id: 'w2', bestPrice: 5 })
    // diff = 10 - 5 = 5 → score = max(0, 10 - round(5/2)) = max(0, 10-3) = 7
    expect(result.priceScore).toBe(7)
  })
})

describe('scoreWine – rating tiers', () => {
  it('gives 70% rating score for vivinoScore 3.5–3.99', () => {
    const result = scoreWine(fullProfile, { ...perfectWine, id: 'w3', vivinoScore: 3.7 })
    expect(result.ratingScore).toBe(Math.round(SCORING_WEIGHTS.rating * 0.7))
  })

  it('gives 40% rating score for vivinoScore 3.0–3.49', () => {
    const result = scoreWine(fullProfile, { ...perfectWine, id: 'w4', vivinoScore: 3.2 })
    expect(result.ratingScore).toBe(Math.round(SCORING_WEIGHTS.rating * 0.4))
  })

  it('gives 1 point for vivinoScore below 3.0', () => {
    const result = scoreWine(fullProfile, { ...perfectWine, id: 'w5', vivinoScore: 2.8 })
    expect(result.ratingScore).toBe(1)
  })
})
