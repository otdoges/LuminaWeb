interface ScrapingBeeOptions {
  url: string;
  screenshot?: boolean;
  screenshot_full_page?: boolean;
  window_width?: number;
  window_height?: number;
  device?: 'desktop' | 'mobile' | 'tablet';
  wait?: number;
  wait_for?: string;
}

interface ScrapingBeeResponse {
  screenshot?: string; // Base64 encoded image
  html?: string;
  url: string;
  status: number;
}

export class ScrapingBeeService {
  private apiKey: string;
  private baseUrl = 'https://app.scrapingbee.com/api/v1/';

  constructor() {
    this.apiKey = import.meta.env.VITE_SCRAPINGBEE_API_KEY;
    if (!this.apiKey) {
      throw new Error('ScrapingBee API key is required');
    }
  }

  async takeScreenshot(url: string, options: Partial<ScrapingBeeOptions> = {}): Promise<string> {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      url: url,
      screenshot: 'true',
      screenshot_full_page: options.screenshot_full_page ? 'true' : 'false',
      window_width: (options.window_width || 1920).toString(),
      window_height: (options.window_height || 1080).toString(),
      wait: (options.wait || 3000).toString(),
      ...(options.wait_for && { wait_for: options.wait_for }),
      ...(options.device && { device: options.device })
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`ScrapingBee API error: ${response.status} ${response.statusText}`);
      }

      // ScrapingBee returns the screenshot as binary data when screenshot=true
      const arrayBuffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      console.error('ScrapingBee screenshot error:', error);
      throw new Error('Failed to capture screenshot');
    }
  }

  async scrapeContent(url: string, options: Partial<ScrapingBeeOptions> = {}): Promise<ScrapingBeeResponse> {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      url: url,
      render_js: 'true',
      wait: (options.wait || 3000).toString(),
      ...(options.wait_for && { wait_for: options.wait_for })
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`ScrapingBee API error: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      
      return {
        html,
        url,
        status: response.status
      };
    } catch (error) {
      console.error('ScrapingBee scraping error:', error);
      throw new Error('Failed to scrape content');
    }
  }

  async analyzeWebsite(url: string): Promise<{
    screenshot: string;
    html: string;
    metrics: {
      loadTime: number;
      pageSize: number;
      imageCount: number;
      linkCount: number;
    };
  }> {
    const startTime = Date.now();
    
    try {
      // Take screenshot and scrape content in parallel
      const [screenshot, content] = await Promise.all([
        this.takeScreenshot(url, { screenshot_full_page: true }),
        this.scrapeContent(url, { wait: 5000 })
      ]);

      const loadTime = Date.now() - startTime;
      
      // Basic HTML analysis
      const parser = new DOMParser();
      const doc = parser.parseFromString(content.html || '', 'text/html');
      
      const metrics = {
        loadTime,
        pageSize: new Blob([content.html || '']).size,
        imageCount: doc.querySelectorAll('img').length,
        linkCount: doc.querySelectorAll('a').length
      };

      return {
        screenshot,
        html: content.html || '',
        metrics
      };
    } catch (error) {
      console.error('Website analysis error:', error);
      throw new Error('Failed to analyze website');
    }
  }
}

export const scrapingBee = new ScrapingBeeService();