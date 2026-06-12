import { describe, it, expect } from 'vitest'
import { buildAffiliateUrl } from '@/lib/affiliate-link'

const TOPDRINKS_TEMPLATE =
  'https://www.topdrinks.nl/drinks/?tt=35131_12_508390_{ref}&r={path}'

describe('buildAffiliateUrl – Topdrinks template', () => {
  it('produces the correct deeplink for a known listing', () => {
    const result = buildAffiliateUrl(
      TOPDRINKS_TEMPLATE,
      'https://www.topdrinks.nl/l-51-054-00',
      'cmnq681iy0212zfitf2umesnq'
    )
    expect(result).toBe(
      'https://www.topdrinks.nl/drinks/?tt=35131_12_508390_cmnq681iy0212zfitf2umesnq&r=%2Fl-51-054-00'
    )
  })

  it('encodes pathname + search when destination has a query string', () => {
    const result = buildAffiliateUrl(
      TOPDRINKS_TEMPLATE,
      'https://www.topdrinks.nl/wijn/rood?page=2',
      'ref123'
    )
    // path = /wijn/rood?page=2  -> encodeURIComponent -> %2Fwijn%2Frood%3Fpage%3D2
    expect(result).toBe(
      'https://www.topdrinks.nl/drinks/?tt=35131_12_508390_ref123&r=%2Fwijn%2Frood%3Fpage%3D2'
    )
  })
})

describe('buildAffiliateUrl – {url} placeholder', () => {
  it('encodes the full destination URL when template uses {url}', () => {
    const template = 'https://tracker.example.com/go?u={url}'
    const destination = 'https://www.topdrinks.nl/wijn/rood'
    const result = buildAffiliateUrl(template, destination, 'r1')
    expect(result).toBe(
      'https://tracker.example.com/go?u=' +
        encodeURIComponent('https://www.topdrinks.nl/wijn/rood')
    )
  })
})

describe('buildAffiliateUrl – empty/omitted reference', () => {
  it('omitted reference leaves the token ending with _ before &r=', () => {
    const result = buildAffiliateUrl(
      TOPDRINKS_TEMPLATE,
      'https://www.topdrinks.nl/l-51-054-00'
    )
    // {ref} replaced with "" -> tt param ends in _
    expect(result).toBe(
      'https://www.topdrinks.nl/drinks/?tt=35131_12_508390_&r=%2Fl-51-054-00'
    )
  })

  it('empty string reference produces the same result', () => {
    const result = buildAffiliateUrl(
      TOPDRINKS_TEMPLATE,
      'https://www.topdrinks.nl/l-51-054-00',
      ''
    )
    expect(result).toBe(
      'https://www.topdrinks.nl/drinks/?tt=35131_12_508390_&r=%2Fl-51-054-00'
    )
  })
})

describe('buildAffiliateUrl – invalid inputs', () => {
  it('returns null for an unparseable destination URL', () => {
    expect(buildAffiliateUrl(TOPDRINKS_TEMPLATE, 'not a url', 'ref')).toBeNull()
  })

  it('returns null when the resulting URL is not https', () => {
    const httpTemplate = 'http://www.topdrinks.nl/drinks/?r={path}'
    expect(
      buildAffiliateUrl(httpTemplate, 'https://www.topdrinks.nl/wijn', 'ref')
    ).toBeNull()
  })
})
