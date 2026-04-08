import * as cheerio from 'cheerio'

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

/** Decode HTML entities and strip tags */
function cleanHtml(html: string): string {
  const decoded = cheerio.load(`<p>${html}</p>`, { xml: false }).text()
  return decoded
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export type ProductPageData = {
  description: string | null
  imageUrl: string | null
}

/**
 * Fetch a product page and extract description and full-res image.
 */
export async function fetchProductPage(url: string): Promise<ProductPageData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': randomUA(),
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      console.warn(`[product] HTTP ${response.status} for ${url}`)
      return { description: null, imageUrl: null }
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // --- Description ---
    let description: string | null = null

    const tastingNote = $('meta[property="bc:tastingnote"]').attr('content')
    if (tastingNote) {
      description = cleanHtml(tastingNote)
    } else {
      const ogDescription = $('meta[property="og:description"]').attr('content')
      if (ogDescription && ogDescription.length > 30) {
        description = cleanHtml(ogDescription)
      } else {
        const shortDesc = $('meta[property="bc:shortDescription"]').attr('content')
        if (shortDesc) {
          description = cleanHtml(shortDesc)
        } else {
          const metaDesc = $('meta[name="description"]').attr('content')
          if (metaDesc && metaDesc.length > 30) {
            description = cleanHtml(metaDesc)
          } else {
            const productDesc = $('.product-description').text().trim()
            if (productDesc && productDesc.length > 30) {
              description = productDesc.slice(0, 500)
            }
          }
        }
      }
    }

    // --- Image ---
    let imageUrl: string | null = null

    // Try og:image first (usually highest quality)
    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage) {
      imageUrl = ogImage.split('?')[0]
    }

    // Fallback: main product image on detail page
    if (!imageUrl) {
      const mainImg = $('img.product-image-photo').first().attr('src')
        ?? $('img.product-image-photo').first().attr('data-src')
        ?? $('.gallery-placeholder img').first().attr('src')
        ?? $('[data-gallery-role="gallery"] img').first().attr('src')
      if (mainImg && !mainImg.includes('placeholder')) {
        imageUrl = mainImg.split('?')[0]
      }
    }

    return { description, imageUrl }
  } catch (err) {
    console.warn(`[product] Error fetching ${url}:`, err)
    return { description: null, imageUrl: null }
  }
}
