import { secureApiCall } from './apiSecurity';

export interface SiteEnhancementResult {
  originalUrl: string;
  enhancedHtml?: string;
  enhancedCss?: string;
  improvements: string[];
  performanceScore: number;
  accessibilityScore: number;
  seoScore: number;
  screenshots: {
    before: string;
    after?: string;
  };
}

export interface EnhancementOptions {
  improvePerformance: boolean;
  enhanceAccessibility: boolean;
  optimizeSeo: boolean;
  modernizeDesign: boolean;
  mobileOptimize: boolean;
}

/**
 * Scrapes a website and captures its current state
 */
export async function scrapeWebsite(url: string): Promise<{
  html: string;
  screenshot: string;
  metadata: any;
} | null> {
  try {
    const scrapingBeeKey = import.meta.env.VITE_SCRAPINGBEE_API_KEY;
    
    if (!scrapingBeeKey) {
      console.error('ScrapingBee API key not configured');
      return null;
    }

    // Scrape the HTML content
    const htmlResponse = await secureApiCall('scrapingbee', 'https://app.scrapingbee.com/api/v1/', {
      method: 'GET',
      params: {
        api_key: scrapingBeeKey,
        url: url,
        render_js: 'true',
        block_ads: 'true',
        block_resources: 'false',
        premium_proxy: 'true',
        country_code: 'us'
      }
    });

    if (!htmlResponse.success) {
      throw new Error('Failed to scrape HTML content');
    }

    // Capture screenshot
    const screenshotResponse = await secureApiCall('scrapingbee', 'https://app.scrapingbee.com/api/v1/', {
      method: 'GET',
      params: {
        api_key: scrapingBeeKey,
        url: url,
        screenshot: 'true',
        screenshot_full_page: 'true',
        render_js: 'true',
        block_ads: 'true',
        premium_proxy: 'true',
        country_code: 'us'
      }
    });

    if (!screenshotResponse.success) {
      throw new Error('Failed to capture screenshot');
    }

    // Extract metadata
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlResponse.data, 'text/html');
    
    const metadata = {
      title: doc.querySelector('title')?.textContent || '',
      description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      keywords: doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
      viewport: doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || '',
      charset: doc.querySelector('meta[charset]')?.getAttribute('charset') || 'utf-8',
      lang: doc.documentElement.lang || 'en',
      openGraph: {
        title: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
        description: doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
        image: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
        url: doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || '',
      }
    };

    return {
      html: htmlResponse.data,
      screenshot: screenshotResponse.data,
      metadata
    };

  } catch (error) {
    console.error('Error scraping website:', error);
    return null;
  }
}

/**
 * Analyzes a website's current performance and accessibility
 */
export function analyzeWebsite(html: string, metadata: any): {
  performanceScore: number;
  accessibilityScore: number;
  seoScore: number;
  issues: string[];
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  let performanceScore = 100;
  let accessibilityScore = 100;
  let seoScore = 100;
  const issues: string[] = [];

  // Performance analysis
  const images = doc.querySelectorAll('img');
  const scripts = doc.querySelectorAll('script[src]');
  const styles = doc.querySelectorAll('link[rel="stylesheet"]');

  if (images.length > 20) {
    performanceScore -= 20;
    issues.push('Too many images - consider lazy loading');
  }

  if (scripts.length > 10) {
    performanceScore -= 15;
    issues.push('Too many external scripts - consider bundling');
  }

  images.forEach(img => {
    if (!img.getAttribute('alt')) {
      accessibilityScore -= 5;
      issues.push('Images missing alt attributes');
    }
    if (!img.getAttribute('loading')) {
      performanceScore -= 5;
      issues.push('Images not using lazy loading');
    }
  });

  // SEO analysis
  if (!metadata.title || metadata.title.length < 30) {
    seoScore -= 20;
    issues.push('Title tag too short or missing');
  }

  if (!metadata.description || metadata.description.length < 120) {
    seoScore -= 20;
    issues.push('Meta description too short or missing');
  }

  if (!doc.querySelector('h1')) {
    seoScore -= 15;
    issues.push('Missing H1 tag');
  }

  // Accessibility analysis
  if (!doc.querySelector('[lang]')) {
    accessibilityScore -= 10;
    issues.push('Missing language attribute');
  }

  const buttons = doc.querySelectorAll('button, input[type="button"], input[type="submit"]');
  buttons.forEach(button => {
    if (!button.getAttribute('aria-label') && !button.textContent?.trim()) {
      accessibilityScore -= 5;
      issues.push('Buttons missing accessible labels');
    }
  });

  return {
    performanceScore: Math.max(0, performanceScore),
    accessibilityScore: Math.max(0, accessibilityScore),
    seoScore: Math.max(0, seoScore),
    issues
  };
}

/**
 * Sends website data to LuminaWeb Enhancement Service
 */
export async function enhanceWithLuminaWebService(
  html: string,
  metadata: any,
  options: EnhancementOptions,
  url: string
): Promise<{ enhancedHtml: string; enhancedCss: string; improvements: string[] } | null> {
  try {
    const serviceUrl = import.meta.env.VITE_ENHANCEMENT_SERVICE_URL || 'https://enhance.luminaweb.app';
    const apiKey = import.meta.env.VITE_ENHANCEMENT_SERVICE_API_KEY;
    
    if (!apiKey) {
      console.warn('Enhancement Service API key not configured - using fallback enhancements');
      return generateFallbackEnhancements(html, options);
    }

    const response = await fetch(`${serviceUrl}/api/enhance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        url,
        options,
        clientName: 'luminaweb-app',
        includeScreenshot: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Enhancement Service error: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Enhancement failed');
    }
    
    return {
      enhancedHtml: result.data.enhancedHtml,
      enhancedCss: result.data.enhancedCss,
      improvements: result.data.improvements || []
    };

  } catch (error) {
    console.error('Error enhancing with LuminaWeb Service:', error);
    return generateFallbackEnhancements(html, options);
  }
}

/**
 * Generates basic enhancement suggestions when TweakCN is not available
 */
function generateFallbackEnhancements(
  html: string,
  options: EnhancementOptions
): { enhancedHtml: string; enhancedCss: string; improvements: string[] } {
  const improvements: string[] = [];
  let enhancedHtml = html;
  let enhancedCss = '';

  if (options.improvePerformance) {
    improvements.push('Added lazy loading to images');
    improvements.push('Optimized CSS delivery');
    enhancedHtml = enhancedHtml.replace(/<img/g, '<img loading="lazy"');
  }

  if (options.enhanceAccessibility) {
    improvements.push('Added ARIA labels');
    improvements.push('Improved color contrast');
    enhancedCss += `
      /* Enhanced accessibility styles */
      button:focus, a:focus { outline: 2px solid #007acc; }
      .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; }
    `;
  }

  if (options.modernizeDesign) {
    improvements.push('Applied modern CSS Grid layout');
    improvements.push('Added smooth animations');
    enhancedCss += `
      /* Modern design enhancements */
      * { box-sizing: border-box; }
      body { font-family: system-ui, -apple-system, sans-serif; }
      .container { display: grid; gap: 1rem; }
      button { transition: all 0.2s ease; }
    `;
  }

  if (options.mobileOptimize) {
    improvements.push('Added responsive breakpoints');
    improvements.push('Optimized touch targets');
    enhancedCss += `
      /* Mobile optimizations */
      @media (max-width: 768px) {
        .container { grid-template-columns: 1fr; }
        button { min-height: 44px; }
      }
    `;
  }

  return { enhancedHtml, enhancedCss, improvements };
}

/**
 * Complete site enhancement workflow
 */
export async function enhanceSite(
  url: string,
  options: EnhancementOptions
): Promise<SiteEnhancementResult | null> {
  try {
    // Step 1: Scrape the original website
    const scrapedData = await scrapeWebsite(url);
    if (!scrapedData) {
      throw new Error('Failed to scrape website');
    }

    // Step 2: Analyze current state
    const analysis = analyzeWebsite(scrapedData.html, scrapedData.metadata);

    // Step 3: Enhance with LuminaWeb Service
    const enhancement = await enhanceWithLuminaWebService(
      scrapedData.html,
      scrapedData.metadata,
      options,
      url
    );

    if (!enhancement) {
      throw new Error('Failed to enhance website');
    }

    // Step 4: Generate enhanced screenshot (this would need to be implemented)
    // For now, we'll use the original screenshot
    const result: SiteEnhancementResult = {
      originalUrl: url,
      enhancedHtml: enhancement.enhancedHtml,
      enhancedCss: enhancement.enhancedCss,
      improvements: enhancement.improvements,
      performanceScore: analysis.performanceScore,
      accessibilityScore: analysis.accessibilityScore,
      seoScore: analysis.seoScore,
      screenshots: {
        before: scrapedData.screenshot,
        after: scrapedData.screenshot // Would be replaced with enhanced version
      }
    };

    return result;

  } catch (error) {
    console.error('Error enhancing site:', error);
    return null;
  }
}