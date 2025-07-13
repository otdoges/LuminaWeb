export interface ScrapedWebsite {
  url: string;
  html: string;
  title: string;
  description: string;
  metadata: {
    charset: string;
    viewport: string;
    lang: string;
    openGraph: {
      title: string;
      description: string;
      image: string;
      url: string;
    };
    structuredData: any[];
  };
  screenshot?: string;
  performanceMetrics?: {
    loadTime: number;
    resourceCount: number;
    totalSize: number;
  };
}

export class WebsiteScraper {
  private static instance: WebsiteScraper;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SCRAPINGBEE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('ScrapingBee API key not found. Scraping functionality will be limited.');
    }
  }

  public static getInstance(): WebsiteScraper {
    if (!WebsiteScraper.instance) {
      WebsiteScraper.instance = new WebsiteScraper();
    }
    return WebsiteScraper.instance;
  }

  private async makeScrapingBeeRequest(url: string, params: Record<string, string> = {}): Promise<string> {
    if (!this.apiKey) {
      throw new Error('ScrapingBee API key is required');
    }

    const baseParams = {
      api_key: this.apiKey,
      url: url,
      render_js: 'true',
      block_ads: 'true',
      premium_proxy: 'true',
      country_code: 'us',
      wait: '2000',
      ...params
    };

    const queryParams = new URLSearchParams(baseParams);
    const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/?${queryParams.toString()}`;

    console.log(`Making ScrapingBee request for: ${url}`);
    
    const response = await fetch(scrapingBeeUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ScrapingBee API error (${response.status}): ${errorText}`);
    }

    return await response.text();
  }

  async scrapeWebsite(url: string, takeScreenshot: boolean = false): Promise<ScrapedWebsite> {
    try {
      console.log(`Starting to scrape: ${url}`);
      
      // Get HTML content
      const html = await this.makeScrapingBeeRequest(url);
      
      // Parse HTML to extract metadata
      const metadata = this.extractMetadata(html);
      
      let screenshot: string | undefined;
      if (takeScreenshot) {
        screenshot = await this.takeScreenshot(url);
      }

      console.log(`Successfully scraped: ${url}`);
      
      return {
        url,
        html,
        title: metadata.title,
        description: metadata.description,
        metadata: metadata.metadata,
        screenshot
      };

    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async takeScreenshot(url: string): Promise<string> {
    try {
      const screenshot = await this.makeScrapingBeeRequest(url, {
        screenshot: 'true',
        screenshot_full_page: 'true',
        screenshot_selector: 'body'
      });
      
      return screenshot; // ScrapingBee returns base64 encoded image
    } catch (error) {
      console.error(`Error taking screenshot for ${url}:`, error);
      throw new Error(`Failed to take screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractMetadata(html: string): {
    title: string;
    description: string;
    metadata: ScrapedWebsite['metadata'];
  } {
    // Simple HTML parsing using regex (for server environment)
    // In a more robust implementation, you might want to use a proper HTML parser
    
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    const description = descMatch ? descMatch[1] : '';
    
    const charsetMatch = html.match(/<meta\s+charset=["']([^"']*)["']/i);
    const charset = charsetMatch ? charsetMatch[1] : 'utf-8';
    
    const viewportMatch = html.match(/<meta\s+name=["']viewport["']\s+content=["']([^"']*)["']/i);
    const viewport = viewportMatch ? viewportMatch[1] : '';
    
    const langMatch = html.match(/<html[^>]+lang=["']([^"']*)["']/i);
    const lang = langMatch ? langMatch[1] : 'en';
    
    // Extract Open Graph data
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i);
    const ogTitle = ogTitleMatch ? ogTitleMatch[1] : '';
    
    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i);
    const ogDescription = ogDescMatch ? ogDescMatch[1] : '';
    
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i);
    const ogImage = ogImageMatch ? ogImageMatch[1] : '';
    
    const ogUrlMatch = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']*)["']/i);
    const ogUrl = ogUrlMatch ? ogUrlMatch[1] : '';
    
    // Extract structured data
    const structuredData: any[] = [];
    const ldJsonRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([^<]*)<\/script>/gi;
    let match;
    
    while ((match = ldJsonRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        structuredData.push(data);
      } catch (e) {
        // Ignore invalid JSON
      }
    }

    return {
      title,
      description,
      metadata: {
        charset,
        viewport,
        lang,
        openGraph: {
          title: ogTitle,
          description: ogDescription,
          image: ogImage,
          url: ogUrl
        },
        structuredData
      }
    };
  }

  async getPagePerformanceMetrics(url: string): Promise<any> {
    try {
      // Use ScrapingBee's performance monitoring features
      const html = await this.makeScrapingBeeRequest(url, {
        return_page_source: 'true',
        wait_for: 'networkidle',
        timeout: '30000'
      });

      // Basic performance metrics based on content analysis
      const resourceCount = (html.match(/<(img|script|link|style)/gi) || []).length;
      const totalSize = new Blob([html]).size;
      const estimatedLoadTime = Math.min(3000 + (totalSize / 1000), 10000); // Simple estimation

      return {
        loadTime: estimatedLoadTime,
        resourceCount,
        totalSize,
        htmlSize: totalSize
      };

    } catch (error) {
      console.error(`Error getting performance metrics for ${url}:`, error);
      throw error;
    }
  }

  // Fallback method for when ScrapingBee is not available
  async scrapeWebsiteFallback(url: string): Promise<ScrapedWebsite> {
    try {
      console.log(`Using fallback scraping for: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const metadata = this.extractMetadata(html);

      console.log(`Fallback scraping completed for: ${url}`);
      
      return {
        url,
        html,
        title: metadata.title,
        description: metadata.description,
        metadata: metadata.metadata
      };

    } catch (error) {
      console.error(`Fallback scraping failed for ${url}:`, error);
      throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const websiteScraper = WebsiteScraper.getInstance();