import { describe, it, expect } from 'vitest'
import { classifyWineType, extractVintage, normalizeWineName } from '@/scrapers/normalize'

// ---------------------------------------------------------------------------
// classifyWineType
// ---------------------------------------------------------------------------

describe('classifyWineType – sparkling detection', () => {
  it('"Prosecco Spumante Extra Dry" → sparkling', () => {
    expect(classifyWineType('Prosecco Spumante Extra Dry')).toBe('sparkling')
  })

  it('"Champagne Brut" → sparkling', () => {
    expect(classifyWineType('Champagne Brut')).toBe('sparkling')
  })

  it('"Cava Brut Nature" → sparkling', () => {
    expect(classifyWineType('Cava Brut Nature')).toBe('sparkling')
  })
})

describe('classifyWineType – sparkling rosé stays rose', () => {
  it('"Prosecco Rosé" → rose', () => {
    expect(classifyWineType('Prosecco Rosé')).toBe('rose')
  })

  it('"Champagne Rosé Brut" → rose', () => {
    expect(classifyWineType('Champagne Rosé Brut')).toBe('rose')
  })
})

describe('classifyWineType – non-wine guard (grappa)', () => {
  it('"Grappa Regadin Prosecco" → not sparkling, returns hint', () => {
    // Grappa matches NON_WINE_RE → returns hint unchanged
    const result = classifyWineType('Grappa Regadin Prosecco', 'red')
    expect(result).toBe('red')
  })

  it('"Grappa Regadin Prosecco" without hint → returns null', () => {
    const result = classifyWineType('Grappa Regadin Prosecco')
    expect(result).toBeNull()
  })
})

describe('classifyWineType – dessert wines', () => {
  it('"Vintage Port" → dessert', () => {
    expect(classifyWineType('Vintage Port')).toBe('dessert')
  })

  it('"Tio Pepe Sherry Fino" → dessert', () => {
    expect(classifyWineType('Tio Pepe Sherry Fino')).toBe('dessert')
  })

  it('"Gonzalez Byass Pedro Ximenez" → dessert', () => {
    expect(classifyWineType('Gonzalez Byass Pedro Ximenez')).toBe('dessert')
  })

  it('"Sauternes Château d\'Yquem" → dessert', () => {
    expect(classifyWineType("Sauternes Château d'Yquem")).toBe('dessert')
  })
})

describe('classifyWineType – regular red with hint', () => {
  it('"Rioja Crianza" with hint "red" → red', () => {
    expect(classifyWineType('Rioja Crianza', 'red')).toBe('red')
  })
})

describe('classifyWineType – hint passthrough', () => {
  it('passes through hint for unknown wine names', () => {
    expect(classifyWineType('Mystery Blend', 'white')).toBe('white')
  })

  it('returns null when no hint and no match', () => {
    expect(classifyWineType('Mystery Blend')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// extractVintage
// ---------------------------------------------------------------------------

describe('extractVintage', () => {
  it('"Rioja 2019" → 2019', () => {
    expect(extractVintage('Rioja 2019')).toBe(2019)
  })

  it('"Château Margaux 1982" → 1982', () => {
    expect(extractVintage('Château Margaux 1982')).toBe(1982)
  })

  it('"Pinot Noir 75cl" → undefined (no vintage)', () => {
    expect(extractVintage('Pinot Noir 75cl')).toBeUndefined()
  })

  it('"Bordeaux" → undefined', () => {
    expect(extractVintage('Bordeaux')).toBeUndefined()
  })

  it('a 4-digit number that is not a plausible year → undefined', () => {
    // 1234 is before 1900
    expect(extractVintage('Wine 1234')).toBeUndefined()
  })

  it('current year is a valid vintage', () => {
    const year = new Date().getFullYear()
    expect(extractVintage(`Rosé ${year}`)).toBe(year)
  })
})

// ---------------------------------------------------------------------------
// normalizeWineName
// ---------------------------------------------------------------------------

describe('normalizeWineName', () => {
  it('extracts vintage from name', () => {
    const result = normalizeWineName('Rioja Crianza 2019')
    expect(result.vintage).toBe(2019)
  })

  it('splits on comma to derive producer', () => {
    const result = normalizeWineName('Château Margaux, Grand Cru 2018')
    expect(result.producer).toBe('Château Margaux')
    expect(result.vintage).toBe(2018)
  })

  it('removes filler words from searchName', () => {
    const result = normalizeWineName('Rioja Reserva 75cl 2020')
    // "reserva" and "75cl" are fillers
    expect(result.searchName).not.toContain('reserva')
    expect(result.searchName).not.toContain('75cl')
  })

  it('lowercases and strips accents in searchName', () => {
    const result = normalizeWineName('Château Pétrus 2015')
    // accents stripped: chateau petrus
    expect(result.searchName).toContain('chateau')
    expect(result.searchName).toContain('petrus')
  })

  it('falls back to raw name when no comma split', () => {
    const result = normalizeWineName('Barolo')
    // producer empty, name is 'Barolo'
    expect(result.name).toBe('Barolo')
    expect(result.producer).toBe('')
  })

  it('"75cl" alone produces no vintage', () => {
    const result = normalizeWineName('Pinot Noir 75cl')
    expect(result.vintage).toBeUndefined()
  })
})
