import { NextRequest } from 'next/server';
import { z } from 'zod';
import { validateApiKey, validateOrigin, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { websiteScraper } from '@/lib/scraper';
import { geminiAnalyzer } from '@/lib/gemini';

// Request validation schema
const QuickAnalysisRequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
  clientName: z.string().optional()
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
      requestData = QuickAnalysisRequestSchema.parse(body);
    } catch (error) {
      return createErrorResponse('Invalid request format', 400);
    }

    const { url, clientName } = requestData;
    
    console.log(`Starting quick analysis for: ${url} (client: ${clientName || 'unknown'})`);

    // Step 1: Scrape the website (faster, no screenshot)
    let scrapedData;
    try {
      scrapedData = await websiteScraper.scrapeWebsite(url, false);
    } catch (error) {
      console.error('Scraping failed, trying fallback:', error);
      try {
        scrapedData = await websiteScraper.scrapeWebsiteFallback(url);
      } catch (fallbackError) {
        return createErrorResponse(`Failed to scrape website: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`, 500);
      }
    }

    // Step 2: Quick analysis with Gemini
    let quickAnalysis;
    try {
      quickAnalysis = await geminiAnalyzer.quickAnalysis(url, scrapedData.html);
    } catch (error) {
      console.error('Quick analysis failed:', error);
      return createErrorResponse(`Quick analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }

    // Combine data
    const result = {
      url,
      title: scrapedData.title,
      description: scrapedData.description,
      quickAnalysis,
      timestamp: new Date().toISOString(),
      clientName
    };

    console.log(`Quick analysis completed for: ${url}`);
    
    return createSuccessResponse(result, 'Quick analysis completed successfully');

  } catch (error) {
    console.error('Quick analysis endpoint error:', error);
    return createErrorResponse(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
  }
}

export async function GET(request: NextRequest) {
  return createErrorResponse('Method not allowed. Use POST for quick analysis.', 405);
}