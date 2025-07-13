import { NextRequest } from 'next/server';
import { z } from 'zod';
import { validateApiKey, validateOrigin, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { websiteScraper } from '@/lib/scraper';
import { geminiAnalyzer } from '@/lib/gemini';
import type { EnhancementOptions } from '@/types';

// Request validation schema
const EnhanceRequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
  options: z.object({
    improvePerformance: z.boolean().default(true),
    enhanceAccessibility: z.boolean().default(true),
    optimizeSeo: z.boolean().default(true),
    modernizeDesign: z.boolean().default(true),
    mobileOptimize: z.boolean().default(true)
  }),
  clientName: z.string().optional(),
  includeScreenshot: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
  try {
    // Validate API key and origin
    if (!validateApiKey(request)) {
      return createErrorResponse('Invalid API key', 401);
    }
    
    if (!validateOrigin(request)) {
      return createErrorResponse('Origin not allowed', 403);
    }

    // Parse and validate request body
    let requestData;
    try {
      const body = await request.json();
      requestData = EnhanceRequestSchema.parse(body);
    } catch (error) {
      return createErrorResponse('Invalid request format', 400);
    }

    const { url, options, clientName, includeScreenshot } = requestData;
    
    console.log(`Starting enhancement for: ${url} (client: ${clientName || 'unknown'})`);

    // Step 1: Scrape the website
    let scrapedData;
    try {
      scrapedData = await websiteScraper.scrapeWebsite(url, includeScreenshot);
    } catch (error) {
      console.error('Scraping failed, trying fallback:', error);
      try {
        scrapedData = await websiteScraper.scrapeWebsiteFallback(url);
      } catch (fallbackError) {
        return createErrorResponse(`Failed to scrape website: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`, 500);
      }
    }

    // Step 2: Analyze with Gemini
    let analysis;
    try {
      analysis = await geminiAnalyzer.analyzeWebsite(url, scrapedData.html, options);
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      return createErrorResponse(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }

    // Step 3: Generate enhancements
    let enhancements;
    try {
      enhancements = await geminiAnalyzer.generateEnhancements(analysis, scrapedData.html, options);
    } catch (error) {
      console.error('Enhancement generation failed:', error);
      return createErrorResponse(`Enhancement generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }

    // Step 4: Get performance metrics
    let performanceMetrics;
    try {
      performanceMetrics = await websiteScraper.getPagePerformanceMetrics(url);
    } catch (error) {
      console.warn('Performance metrics failed:', error);
      performanceMetrics = {
        loadTime: 0,
        resourceCount: 0,
        totalSize: 0
      };
    }

    // Calculate improvement scores
    const calculateOverallScore = (analysis: any) => {
      const scores = [
        analysis.performance?.score || 0,
        analysis.accessibility?.score || 0,
        analysis.seo?.score || 0,
        analysis.design?.score || 0,
        analysis.mobile?.score || 0
      ];
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    };

    const beforeScore = calculateOverallScore(analysis.analysis);
    const afterScore = Math.min(100, beforeScore + (enhancements.performanceGains?.accessibility_score_increase || 0) + 
                                             (enhancements.performanceGains?.seo_score_increase || 0) + 
                                             (enhancements.performanceGains?.mobile_score_increase || 0));

    // Combine all data
    const result = {
      originalUrl: url,
      analysis: {
        url,
        title: scrapedData.title,
        description: scrapedData.description,
        metadata: scrapedData.metadata,
        ...analysis.analysis
      },
      enhancedHtml: enhancements.enhancedHtml,
      enhancedCss: enhancements.enhancedCss,
      improvements: enhancements.improvements,
      overallScore: {
        before: beforeScore,
        after: afterScore,
        improvement: afterScore - beforeScore
      },
      categoryScores: {
        performance: { 
          before: analysis.analysis.performance?.score || 0, 
          after: Math.min(100, (analysis.analysis.performance?.score || 0) + 15) 
        },
        accessibility: { 
          before: analysis.analysis.accessibility?.score || 0, 
          after: Math.min(100, (analysis.analysis.accessibility?.score || 0) + (enhancements.performanceGains?.accessibility_score_increase || 10)) 
        },
        seo: { 
          before: analysis.analysis.seo?.score || 0, 
          after: Math.min(100, (analysis.analysis.seo?.score || 0) + (enhancements.performanceGains?.seo_score_increase || 8)) 
        },
        design: { 
          before: analysis.analysis.design?.score || 0, 
          after: Math.min(100, (analysis.analysis.design?.score || 0) + 12) 
        },
        mobile: { 
          before: analysis.analysis.mobile?.score || 0, 
          after: Math.min(100, (analysis.analysis.mobile?.score || 0) + (enhancements.performanceGains?.mobile_score_increase || 10)) 
        }
      },
      performanceMetrics,
      screenshot: scrapedData.screenshot,
      implementationNotes: enhancements.implementation_notes,
      timestamp: new Date().toISOString(),
      clientName
    };

    console.log(`Enhancement completed for: ${url}`);
    
    return createSuccessResponse(result, 'Website enhancement completed successfully');

  } catch (error) {
    console.error('Enhancement endpoint error:', error);
    return createErrorResponse(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
  }
}

export async function GET(request: NextRequest) {
  return createErrorResponse('Method not allowed. Use POST to enhance websites.', 405);
}