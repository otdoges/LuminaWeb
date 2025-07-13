import { NextRequest } from 'next/server';
import { z } from 'zod';
import { validateApiKey, validateOrigin, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { websiteScraper } from '@/lib/scraper';
import { geminiAnalyzer } from '@/lib/gemini';
import type { AnalysisRequest, EnhancementOptions } from '@/types';

// Request validation schema
const AnalysisRequestSchema = z.object({
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
    let requestData: AnalysisRequest;
    try {
      const body = await request.json();
      requestData = AnalysisRequestSchema.parse(body);
    } catch (error) {
      return createErrorResponse('Invalid request format', 400);
    }

    const { url, options, clientName, includeScreenshot } = requestData;
    
    console.log(`Starting analysis for: ${url} (client: ${clientName || 'unknown'})`);

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

    // Step 3: Get performance metrics
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

    // Combine all data
    const result = {
      url,
      title: scrapedData.title,
      description: scrapedData.description,
      metadata: scrapedData.metadata,
      analysis,
      performanceMetrics,
      screenshot: scrapedData.screenshot,
      timestamp: new Date().toISOString(),
      clientName
    };

    console.log(`Analysis completed for: ${url}`);
    
    return createSuccessResponse(result, 'Website analysis completed successfully');

  } catch (error) {
    console.error('Analysis endpoint error:', error);
    return createErrorResponse(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
  }
}

export async function GET(request: NextRequest) {
  return createErrorResponse('Method not allowed. Use POST to analyze websites.', 405);
}