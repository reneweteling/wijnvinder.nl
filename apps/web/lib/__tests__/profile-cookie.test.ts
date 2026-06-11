/**
 * Tests for profile-cookie.ts.
 * Needs a DOM environment so document.cookie is available.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest'

// We import the module after resetting module state in beforeEach
// by re-importing fresh each time — but because vitest caches modules
// we instead reset the module-level cache by clearing and re-reading.
// The easiest approach: just import once and rely on cookie changes triggering
// a new parse (the module caches per cookie string).

import { getProfileSnapshot } from '@/lib/profile-cookie'
import type { WineProfileData } from '@/lib/types'

function clearCookies() {
  // Remove all cookies visible to jsdom
  document.cookie.split(';').forEach((c) => {
    const key = c.split('=')[0].trim()
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  })
}

function setProfileCookie(profile: WineProfileData) {
  const encoded = encodeURIComponent(JSON.stringify(profile))
  document.cookie = `wine-profile=${encoded}`
}

const validProfile: WineProfileData = {
  wineTypes: ['red'],
  grapes: ['Merlot'],
  flavors: ['fruity'],
  countries: ['france'],
  priceMin: 10,
  priceMax: 50,
}

beforeEach(() => {
  clearCookies()
})

describe('getProfileSnapshot – malformed JSON', () => {
  it('returns null without throwing for malformed JSON', () => {
    document.cookie = 'wine-profile=%7Bbroken'
    expect(() => getProfileSnapshot()).not.toThrow()
    expect(getProfileSnapshot()).toBeNull()
  })

  it('returns null without throwing for completely invalid value', () => {
    document.cookie = 'wine-profile=not-json-at-all'
    expect(() => getProfileSnapshot()).not.toThrow()
    expect(getProfileSnapshot()).toBeNull()
  })
})

describe('getProfileSnapshot – no cookie', () => {
  it('returns null when no wine-profile cookie is set', () => {
    expect(getProfileSnapshot()).toBeNull()
  })
})

describe('getProfileSnapshot – valid cookie', () => {
  it('parses and returns the profile', () => {
    setProfileCookie(validProfile)
    const result = getProfileSnapshot()
    expect(result).not.toBeNull()
    expect(result?.wineTypes).toEqual(['red'])
    expect(result?.grapes).toEqual(['Merlot'])
    expect(result?.countries).toEqual(['france'])
  })
})

describe('getProfileSnapshot – cache guarantee (same reference)', () => {
  it('returns the same object reference when the cookie string does not change', () => {
    setProfileCookie(validProfile)
    const first = getProfileSnapshot()
    const second = getProfileSnapshot()
    // Object.is check: same reference → cache hit
    expect(Object.is(first, second)).toBe(true)
  })
})

describe('getProfileSnapshot – cookie change triggers re-parse', () => {
  it('returns updated value after cookie changes', () => {
    setProfileCookie(validProfile)
    const first = getProfileSnapshot()
    expect(first?.wineTypes).toEqual(['red'])

    const updatedProfile: WineProfileData = {
      ...validProfile,
      wineTypes: ['white'],
    }
    setProfileCookie(updatedProfile)
    const second = getProfileSnapshot()
    expect(second?.wineTypes).toEqual(['white'])
    // Must be a different reference
    expect(Object.is(first, second)).toBe(false)
  })
})
