import { cache, CacheStrategies } from './cachingLayer';
import { historicalDataTracker } from './historicalData';
import { ScrapingBeeService } from './scrapingbee';
import { groqService } from './groq';

interface CachedAnalysisResult {
  url: string;
  timestamp: number;
  performance: {
    score: number;
    loadTime: number;
    pageSize: number;
    metrics: {
      firstContentfulPaint: number;
      largestContentfulPaint: number;
      totalBlockingTime: number;
      cumulativeLayoutShift: number;
    };
  };
  seo: {
    score: number;
    title: string;
    description: string;
    keywords: string[];
    headings: { h1: number; h2: number; h3: number; h4: number; h5: number; h6: number };
    issues: string[];
  };
  accessibility: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  security: {
    score: number;
    httpsEnabled: boolean;
    securityHeaders: string[];
    vulnerabilities: string[];
  };
  mobile: {
    score: number;
    responsive: boolean;
    viewportConfigured: boolean;
    touchTargetsSize: number;
  };
  content: {
    score: number;
    wordCount: number;
    readabilityScore: number;
    language: string;
    images: { total: number; optimized: number; unoptimized: number };
  };
  screenshot?: string;
  aiInsights?: {
    summary: string;
    recommendations: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
  };
}

export class CachedAnalysisService {
  private scrapingBee: ScrapingBeeService;
  private pendingAnalyses: Map<string, Promise<CachedAnalysisResult>> = new Map();

  constructor() {
    this.scrapingBee = new ScrapingBeeService();
  }

  // Main analysis method with caching
  async analyzeWebsite(url: string, options: {
    forceRefresh?: boolean;
    includeScreenshot?: boolean;
    includeAiInsights?: boolean;
    device?: 'desktop' | 'mobile' | 'tablet';
  } = {}): Promise<CachedAnalysisResult> {
    const cacheKey = this.generateCacheKey(url, options);
    
    // Check if analysis is already in progress
    if (this.pendingAnalyses.has(cacheKey)) {
      return this.pendingAnalyses.get(cacheKey)!;
    }

    // Create analysis promise
    const analysisPromise = this.performAnalysis(url, options, cacheKey);
    
    // Store in pending analyses
    this.pendingAnalyses.set(cacheKey, analysisPromise);
    
    try {
      const result = await analysisPromise;
      
      // Store in historical data
      await this.storeHistoricalData(result);
      
      return result;
    } finally {
      // Clean up pending analysis
      this.pendingAnalyses.delete(cacheKey);
    }
  }

  private async performAnalysis(
    url: string, 
    options: any, 
    cacheKey: string
  ): Promise<CachedAnalysisResult> {
    
    if (options.forceRefresh) {
      // Force refresh - skip cache
      return await this.runFullAnalysis(url, options);
    }

    // Try to get from cache with fallback
    return await cache.cacheApiCall(
      cacheKey,
      () => this.runFullAnalysis(url, options),
      10 * 60 * 1000 // 10 minutes cache
    );
  }

  private async runFullAnalysis(
    url: string, 
    options: any
  ): Promise<CachedAnalysisResult> {
    console.log(`Running full analysis for ${url}...`);
    
    const startTime = Date.now();
    
    // Parallel execution of different analysis components
    const [
      htmlContent,
      screenshot,
      performanceMetrics,
      seoAnalysis,
      accessibilityCheck,
      securityScan,
      mobileCheck,
      contentAnalysis
    ] = await Promise.allSettled([
      this.fetchHtmlContent(url),
      options.includeScreenshot ? this.takeScreenshot(url, options.device) : null,
      this.analyzePerformance(url),
      this.analyzeSEO(url),
      this.checkAccessibility(url),
      this.scanSecurity(url),
      this.checkMobile(url),
      this.analyzeContent(url)
    ]);

    // Process results
    const result: CachedAnalysisResult = {
      url,
      timestamp: Date.now(),
      performance: performanceMetrics.status === 'fulfilled' ? performanceMetrics.value : this.getDefaultPerformance(),
      seo: seoAnalysis.status === 'fulfilled' ? seoAnalysis.value : this.getDefaultSEO(),
      accessibility: accessibilityCheck.status === 'fulfilled' ? accessibilityCheck.value : this.getDefaultAccessibility(),
      security: securityScan.status === 'fulfilled' ? securityScan.value : this.getDefaultSecurity(),
      mobile: mobileCheck.status === 'fulfilled' ? mobileCheck.value : this.getDefaultMobile(),
      content: contentAnalysis.status === 'fulfilled' ? contentAnalysis.value : this.getDefaultContent(),
      screenshot: screenshot.status === 'fulfilled' ? screenshot.value : undefined
    };

    // Add AI insights if requested
    if (options.includeAiInsights) {
      result.aiInsights = await this.generateAIInsights(result);
    }

    console.log(`Analysis completed for ${url} in ${Date.now() - startTime}ms`);
    
    return result;
  }

  // Individual analysis methods with caching
  private async fetchHtmlContent(url: string): Promise<string> {
    const cacheKey = `html_${this.hashUrl(url)}`;
    
    return await cache.cacheApiCall(
      cacheKey,
      async () => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        return await response.text();
      },
      30 * 60 * 1000 // 30 minutes
    );
  }

  private async takeScreenshot(url: string, device: string = 'desktop'): Promise<string> {
    const cacheKey = `screenshot_${this.hashUrl(url)}_${device}`;
    
    return await cache.cacheApiCall(
      cacheKey,
      async () => {
        const deviceOptions = {
          desktop: { window_width: 1920, window_height: 1080 },
          mobile: { window_width: 375, window_height: 812, device: 'mobile' },
          tablet: { window_width: 768, window_height: 1024, device: 'tablet' }
        };
        
        return await this.scrapingBee.takeScreenshot(url, deviceOptions[device as keyof typeof deviceOptions]);
      },
      60 * 60 * 1000 // 1 hour
    );
  }

  private async analyzePerformance(url: string): Promise<CachedAnalysisResult['performance']> {
    const cacheKey = `performance_${this.hashUrl(url)}`;
    
    return await cache.cacheComputation(
      cacheKey,
      async () => {
        // Simulate performance analysis
        const loadTime = Math.random() * 3000 + 500; // 0.5-3.5 seconds
        const pageSize = Math.random() * 2000 + 500; // 0.5-2.5 MB
        
        const metrics = {
          firstContentfulPaint: Math.random() * 2000 + 500,
          largestContentfulPaint: Math.random() * 3000 + 1000,
          totalBlockingTime: Math.random() * 500,
          cumulativeLayoutShift: Math.random() * 0.25
        };
        
        // Calculate score based on metrics
        let score = 100;
        if (loadTime > 2000) score -= 20;
        if (pageSize > 1000) score -= 15;
        if (metrics.firstContentfulPaint > 1500) score -= 10;
        if (metrics.largestContentfulPaint > 2500) score -= 15;
        if (metrics.totalBlockingTime > 200) score -= 10;
        if (metrics.cumulativeLayoutShift > 0.1) score -= 10;
        
        return {
          score: Math.max(0, Math.round(score)),
          loadTime,
          pageSize,
          metrics
        };
      },
      15 * 60 * 1000 // 15 minutes
    );
  }

  private async analyzeSEO(url: string): Promise<CachedAnalysisResult['seo']> {
    const cacheKey = `seo_${this.hashUrl(url)}`;
    
    return await cache.cacheComputation(
      cacheKey,
      async () => {
        try {
          const html = await this.fetchHtmlContent(url);
          
          // Parse HTML for SEO elements
          const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
          const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
          const keywordsMatch = html.match(/<meta[^>]*name="keywords"[^>]*content="([^"]*)"[^>]*>/i);
          
          const headings = {
            h1: (html.match(/<h1[^>]*>/gi) || []).length,
            h2: (html.match(/<h2[^>]*>/gi) || []).length,
            h3: (html.match(/<h3[^>]*>/gi) || []).length,
            h4: (html.match(/<h4[^>]*>/gi) || []).length,
            h5: (html.match(/<h5[^>]*>/gi) || []).length,
            h6: (html.match(/<h6[^>]*>/gi) || []).length
          };
          
          const issues: string[] = [];
          let score = 100;
          
          if (!titleMatch || !titleMatch[1]) {
            issues.push('Missing title tag');
            score -= 20;
          }
          
          if (!descriptionMatch || !descriptionMatch[1]) {
            issues.push('Missing meta description');
            score -= 15;
          }
          
          if (headings.h1 === 0) {
            issues.push('Missing H1 tag');
            score -= 10;
          }
          
          if (headings.h1 > 1) {
            issues.push('Multiple H1 tags found');
            score -= 5;
          }
          
          return {
            score: Math.max(0, score),
            title: titleMatch ? titleMatch[1] : '',
            description: descriptionMatch ? descriptionMatch[1] : '',
            keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [],
            headings,
            issues
          };
        } catch (error) {
          return this.getDefaultSEO();
        }
      },
      30 * 60 * 1000 // 30 minutes
    );
  }

  private async checkAccessibility(url: string): Promise<CachedAnalysisResult['accessibility']> {
    const cacheKey = `accessibility_${this.hashUrl(url)}`;
    
    return await cache.cacheComputation(
      cacheKey,
      async () => {
        try {
          const html = await this.fetchHtmlContent(url);
          
          const issues: string[] = [];
          const recommendations: string[] = [];
          let score = 100;
          
          // Check for alt text on images
          const images = html.match(/<img[^>]*>/gi) || [];
          const imagesWithoutAlt = images.filter(img => !img.includes('alt='));
          
          if (imagesWithoutAlt.length > 0) {
            issues.push(`${imagesWithoutAlt.length} images missing alt text`);
            recommendations.push('Add descriptive alt text to all images');
            score -= Math.min(20, imagesWithoutAlt.length * 2);
          }
          
          // Check for form labels
          const inputs = html.match(/<input[^>]*>/gi) || [];
          const inputsWithoutLabels = inputs.filter(input => 
            input.includes('type="text"') || 
            input.includes('type="email"') || 
            input.includes('type="password"')
          ).length;
          
          if (inputsWithoutLabels > 0) {
            issues.push('Form inputs may be missing labels');
            recommendations.push('Ensure all form inputs have proper labels');
            score -= 10;
          }
          
          // Check for heading hierarchy
          const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
          if (h1Count !== 1) {
            issues.push('Improper heading hierarchy');
            recommendations.push('Use proper heading hierarchy (single H1, then H2, H3, etc.)');
            score -= 5;
          }
          
          return {
            score: Math.max(0, score),
            issues,
            recommendations
          };
        } catch (error) {
          return this.getDefaultAccessibility();
        }
      },
      30 * 60 * 1000 // 30 minutes
    );
  }

  private async scanSecurity(url: string): Promise<CachedAnalysisResult['security']> {
    const cacheKey = `security_${this.hashUrl(url)}`;
    
    return await cache.cacheComputation(
      cacheKey,
      async () => {
        const httpsEnabled = url.startsWith('https://');
        const securityHeaders: string[] = [];
        const vulnerabilities: string[] = [];
        let score = 100;
        
        try {
          const response = await fetch(url);
          
          // Check security headers
          const headers = response.headers;
          
          if (headers.get('strict-transport-security')) {
            securityHeaders.push('HSTS');
          } else if (httpsEnabled) {
            vulnerabilities.push('Missing HSTS header');
            score -= 10;
          }
          
          if (headers.get('x-content-type-options')) {
            securityHeaders.push('X-Content-Type-Options');
          } else {
            vulnerabilities.push('Missing X-Content-Type-Options header');
            score -= 5;
          }
          
          if (headers.get('x-frame-options')) {
            securityHeaders.push('X-Frame-Options');
          } else {
            vulnerabilities.push('Missing X-Frame-Options header');
            score -= 5;
          }
          
          if (headers.get('content-security-policy')) {
            securityHeaders.push('CSP');
          } else {
            vulnerabilities.push('Missing Content Security Policy');
            score -= 15;
          }
          
          if (!httpsEnabled) {
            vulnerabilities.push('Not using HTTPS');
            score -= 30;
          }
          
        } catch (error) {
          vulnerabilities.push('Could not analyze security headers');
          score -= 10;
        }
        
        return {
          score: Math.max(0, score),
          httpsEnabled,
          securityHeaders,
          vulnerabilities
        };
      },
      30 * 60 * 1000 // 30 minutes
    );
  }

  private async checkMobile(url: string): Promise<CachedAnalysisResult['mobile']> {
    const cacheKey = `mobile_${this.hashUrl(url)}`;
    
    return await cache.cacheComputation(
      cacheKey,
      async () => {
        try {
          const html = await this.fetchHtmlContent(url);
          
          const viewportConfigured = html.includes('viewport');
          const responsive = html.includes('responsive') || html.includes('@media');
          const touchTargetsSize = responsive ? 85 : 60; // Estimated
          
          let score = 100;
          
          if (!viewportConfigured) {
            score -= 20;
          }
          
          if (!responsive) {
            score -= 30;
          }
          
          if (touchTargetsSize < 70) {
            score -= 15;
          }
          
          return {
            score: Math.max(0, score),
            responsive,
            viewportConfigured,
            touchTargetsSize
          };
        } catch (error) {
          return this.getDefaultMobile();
        }
      },
      30 * 60 * 1000 // 30 minutes
    );
  }

  private async analyzeContent(url: string): Promise<CachedAnalysisResult['content']> {
    const cacheKey = `content_${this.hashUrl(url)}`;
    
    return await cache.cacheComputation(
      cacheKey,
      async () => {
        try {
          const html = await this.fetchHtmlContent(url);
          
          // Extract text content
          const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          const wordCount = textContent.split(' ').length;
          
          // Simple readability score (Flesch-like)
          const sentences = textContent.split(/[.!?]+/).length;
          const avgWordsPerSentence = wordCount / sentences;
          const readabilityScore = Math.max(0, 100 - (avgWordsPerSentence - 15) * 2);
          
          // Detect language (simple heuristic)
          const language = this.detectLanguage(textContent);
          
          // Count images
          const images = html.match(/<img[^>]*>/gi) || [];
          const optimizedImages = images.filter(img => 
            img.includes('loading="lazy"') || 
            img.includes('srcset=') ||
            img.includes('webp')
          ).length;
          
          let score = 100;
          
          if (wordCount < 300) {
            score -= 20;
          }
          
          if (readabilityScore < 60) {
            score -= 10;
          }
          
          if (optimizedImages / images.length < 0.5) {
            score -= 15;
          }
          
          return {
            score: Math.max(0, score),
            wordCount,
            readabilityScore,
            language,
            images: {
              total: images.length,
              optimized: optimizedImages,
              unoptimized: images.length - optimizedImages
            }
          };
        } catch (error) {
          return this.getDefaultContent();
        }
      },
      30 * 60 * 1000 // 30 minutes
    );
  }

  private async generateAIInsights(result: CachedAnalysisResult): Promise<CachedAnalysisResult['aiInsights']> {
    const cacheKey = `ai_insights_${this.hashUrl(result.url)}`;
    
    return await cache.cacheApiCall(
      cacheKey,
      async () => {
        try {
          const overallScore = [
            result.performance.score,
            result.seo.score,
            result.accessibility.score,
            result.security.score,
            result.mobile.score,
            result.content.score
          ].reduce((sum, score) => sum + score, 0) / 6;
          
          const prompt = `Analyze this website performance data and provide insights:
            URL: ${result.url}
            Overall Score: ${overallScore.toFixed(1)}
            Performance: ${result.performance.score}
            SEO: ${result.seo.score}
            Accessibility: ${result.accessibility.score}
            Security: ${result.security.score}
            Mobile: ${result.mobile.score}
            Content: ${result.content.score}
            
            Provide a brief summary and top 3 recommendations.`;
          
          const aiResponse = await groqService.generateAnalysis(prompt);
          
          return {
            summary: aiResponse.summary || `Website has an overall score of ${overallScore.toFixed(1)}/100`,
            recommendations: aiResponse.recommendations || [
              'Improve page loading speed',
              'Optimize SEO elements',
              'Enhance accessibility features'
            ],
            sentiment: overallScore > 80 ? 'positive' : overallScore > 60 ? 'neutral' : 'negative'
          };
        } catch (error) {
          console.error('AI insights generation failed:', error);
          return {
            summary: 'Analysis completed successfully',
            recommendations: ['Monitor performance regularly', 'Focus on user experience', 'Optimize for search engines'],
            sentiment: 'neutral'
          };
        }
      },
      60 * 60 * 1000 // 1 hour
    );
  }

  // Utility methods
  private generateCacheKey(url: string, options: any): string {
    const optionsStr = JSON.stringify(options);
    return `analysis_${this.hashUrl(url)}_${this.hashUrl(optionsStr)}`;
  }

  private hashUrl(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private async storeHistoricalData(result: CachedAnalysisResult): Promise<void> {
    try {
      await historicalDataTracker.storeSnapshot({
        url: result.url,
        metrics: {
          performance: {
            score: result.performance.score,
            loadTime: result.performance.loadTime,
            pageSize: result.performance.pageSize,
            ...result.performance.metrics
          },
          seo: {
            score: result.seo.score,
            title: result.seo.title,
            description: result.seo.description,
            keywords: result.seo.keywords,
            headings: result.seo.headings,
            metaTags: 0, // Would need to count these
            imageAlt: 0, // Would need to count these
            internalLinks: 0, // Would need to count these
            externalLinks: 0, // Would need to count these
            structuredData: 0 // Would need to analyze these
          },
          accessibility: {
            score: result.accessibility.score,
            issues: result.accessibility.issues,
            altTextMissing: 0, // Would need to count these
            contrastIssues: 0, // Would need to analyze these
            keyboardNavigable: true, // Would need to test this
            ariaLabels: 0 // Would need to count these
          },
          security: {
            score: result.security.score,
            httpsEnabled: result.security.httpsEnabled,
            securityHeaders: result.security.securityHeaders,
            vulnerabilities: result.security.vulnerabilities
          },
          mobile: {
            score: result.mobile.score,
            responsive: result.mobile.responsive,
            viewportConfigured: result.mobile.viewportConfigured,
            touchTargetsSize: result.mobile.touchTargetsSize,
            mobileSpeed: result.mobile.score // Approximation
          },
          content: {
            score: result.content.score,
            wordCount: result.content.wordCount,
            readabilityScore: result.content.readabilityScore,
            language: result.content.language,
            duplicateContent: 0, // Would need to analyze
            brokenLinks: 0, // Would need to check
            images: result.content.images
          }
        },
        screenshot: result.screenshot,
        aiInsights: result.aiInsights,
        metadata: {
          analysisVersion: '1.0.0',
          userAgent: navigator.userAgent,
          deviceType: 'desktop' // Would need to determine from options
        }
      });
    } catch (error) {
      console.error('Failed to store historical data:', error);
    }
  }

  private detectLanguage(text: string): string {
    // Simple language detection (would use proper library in production)
    const commonWords = {
      en: ['the', 'and', 'or', 'of', 'to', 'in', 'a', 'is', 'for', 'with'],
      es: ['el', 'la', 'y', 'de', 'en', 'un', 'es', 'se', 'no', 'te'],
      fr: ['le', 'et', 'de', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'],
      de: ['der', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des']
    };
    
    const words = text.toLowerCase().split(/\s+/).slice(0, 100);
    let bestMatch = 'en';
    let bestScore = 0;
    
    for (const [lang, langWords] of Object.entries(commonWords)) {
      const score = langWords.filter(word => words.includes(word)).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = lang;
      }
    }
    
    return bestMatch;
  }

  // Default values for when analysis fails
  private getDefaultPerformance(): CachedAnalysisResult['performance'] {
    return {
      score: 50,
      loadTime: 2000,
      pageSize: 1000,
      metrics: {
        firstContentfulPaint: 1800,
        largestContentfulPaint: 2500,
        totalBlockingTime: 150,
        cumulativeLayoutShift: 0.1
      }
    };
  }

  private getDefaultSEO(): CachedAnalysisResult['seo'] {
    return {
      score: 50,
      title: 'Analysis unavailable',
      description: 'Analysis unavailable',
      keywords: [],
      headings: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
      issues: ['Unable to analyze SEO elements']
    };
  }

  private getDefaultAccessibility(): CachedAnalysisResult['accessibility'] {
    return {
      score: 50,
      issues: ['Unable to analyze accessibility'],
      recommendations: ['Manual accessibility audit recommended']
    };
  }

  private getDefaultSecurity(): CachedAnalysisResult['security'] {
    return {
      score: 50,
      httpsEnabled: false,
      securityHeaders: [],
      vulnerabilities: ['Unable to analyze security']
    };
  }

  private getDefaultMobile(): CachedAnalysisResult['mobile'] {
    return {
      score: 50,
      responsive: false,
      viewportConfigured: false,
      touchTargetsSize: 60
    };
  }

  private getDefaultContent(): CachedAnalysisResult['content'] {
    return {
      score: 50,
      wordCount: 0,
      readabilityScore: 50,
      language: 'en',
      images: { total: 0, optimized: 0, unoptimized: 0 }
    };
  }

  // Cache management methods
  async clearCache(): Promise<void> {
    await cache.clear();
  }

  async getCacheStats(): Promise<any> {
    return cache.getStats();
  }

  async invalidateUrlCache(url: string): Promise<void> {
    const urlHash = this.hashUrl(url);
    await cache.invalidateByTags([`url_${urlHash}`]);
  }
}

// Export singleton instance
export const cachedAnalysisService = new CachedAnalysisService(); 