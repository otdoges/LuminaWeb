// ScrapingBee API integration for web scraping
// This replaces Playwright and other browser automation tools

const SCRAPINGBEE_API_KEY = import.meta.env.VITE_SCRAPINGBEE_API_KEY
const SCRAPINGBEE_BASE_URL = 'https://app.scrapingbee.com/api/v1'

interface ScrapingBeeOptions {
  url: string
  renderJs?: boolean
  screenshot?: boolean
  screenshot_full_page?: boolean
  wait?: number
  wait_browser?: string
  premium_proxy?: boolean
  country_code?: string
}

interface ScrapingBeeResponse {
  body: string
  screenshot?: string
  status_code: number
  url: string
}

export class ScrapingBeeClient {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || SCRAPINGBEE_API_KEY
    if (!this.apiKey) {
      throw new Error('ScrapingBee API key is required. Set VITE_SCRAPINGBEE_API_KEY in your environment.')
    }
  }

  /**
   * Scrape a website and return the HTML content
   */
  async scrapeWebsite(options: ScrapingBeeOptions): Promise<ScrapingBeeResponse> {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      url: options.url,
      render_js: options.renderJs ? 'true' : 'false',
      screenshot: options.screenshot ? 'true' : 'false',
      screenshot_full_page: options.screenshot_full_page ? 'true' : 'false',
      premium_proxy: options.premium_proxy ? 'true' : 'false',
      ...(options.wait && { wait: options.wait.toString() }),
      ...(options.wait_browser && { wait_browser: options.wait_browser }),
      ...(options.country_code && { country_code: options.country_code }),
    })

    try {
      const response = await fetch(`${SCRAPINGBEE_BASE_URL}?${params}`)
      
      if (!response.ok) {
        throw new Error(`ScrapingBee API error: ${response.status} ${response.statusText}`)
      }

      const body = await response.text()
      
      return {
        body,
        screenshot: response.headers.get('spb-screenshot') || undefined,
        status_code: response.status,
        url: options.url
      }
    } catch (error) {
      console.error('ScrapingBee scraping error:', error)
      throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Take a screenshot of a website
   */
  async takeScreenshot(url: string, fullPage = true): Promise<string> {
    const result = await this.scrapeWebsite({
      url,
      screenshot: true,
      screenshot_full_page: fullPage,
      renderJs: true,
      wait: 3000, // Wait 3 seconds for page to load
      premium_proxy: true // Use premium proxy for better reliability
    })

    if (!result.screenshot) {
      throw new Error('No screenshot returned from ScrapingBee')
    }

    return result.screenshot
  }

  /**
   * Extract text content from a website
   */
  async extractContent(url: string): Promise<{ html: string; title: string; description: string }> {
    const result = await this.scrapeWebsite({
      url,
      renderJs: true,
      wait: 2000,
      premium_proxy: true
    })

    // Basic HTML parsing to extract title and meta description
    const titleMatch = result.body.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descriptionMatch = result.body.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)

    return {
      html: result.body,
      title: titleMatch ? titleMatch[1].trim() : '',
      description: descriptionMatch ? descriptionMatch[1].trim() : ''
    }
  }

  /**
   * Analyze website performance and structure
   */
  async analyzeWebsite(url: string) {
    const result = await this.extractContent(url)
    
    // Basic analysis of the HTML structure
    const analysis = {
      title: result.title,
      description: result.description,
      hasTitle: !!result.title,
      hasDescription: !!result.description,
      htmlSize: result.html.length,
      // Check for common elements
      hasNavigation: result.html.includes('<nav') || result.html.includes('navigation'),
      hasHeader: result.html.includes('<header'),
      hasFooter: result.html.includes('<footer'),
      hasForm: result.html.includes('<form'),
      // Count images
      imageCount: (result.html.match(/<img/g) || []).length,
      // Count links
      linkCount: (result.html.match(/<a/g) || []).length,
      // Check for responsive design indicators
      hasViewportMeta: result.html.includes('viewport'),
      hasBootstrap: result.html.includes('bootstrap'),
      hasTailwind: result.html.includes('tailwind'),
      // Check for analytics
      hasGoogleAnalytics: result.html.includes('google-analytics') || result.html.includes('gtag'),
      // Social media meta tags
      hasOpenGraph: result.html.includes('og:'),
      hasTwitterCard: result.html.includes('twitter:'),
    }

    return {
      url,
      analysis,
      extractedAt: new Date().toISOString()
    }
  }
}

// Export a default instance
export const scrapingBee = new ScrapingBeeClient()

// Helper functions for common use cases
export const takeWebsiteScreenshot = (url: string, fullPage = true) => 
  scrapingBee.takeScreenshot(url, fullPage)

export const analyzeWebsiteStructure = (url: string) => 
  scrapingBee.analyzeWebsite(url)

export const extractWebsiteContent = (url: string) => 
  scrapingBee.extractContent(url)

export default scrapingBee 