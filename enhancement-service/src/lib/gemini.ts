import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { 
  WEBSITE_ANALYSIS_SYSTEM_PROMPT, 
  ENHANCEMENT_GENERATION_PROMPT,
  buildAnalysisPrompt,
  buildEnhancementPrompt
} from './systemPrompt';
import type { EnhancementOptions, WebsiteAnalysis } from '@/types';

// Initialize Gemini model
const gemini = google('gemini-2.0-flash-exp', {
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Analysis response schema
const AnalysisSchema = z.object({
  analysis: z.object({
    performance: z.object({
      score: z.number().min(0).max(100),
      issues: z.array(z.string()),
      recommendations: z.array(z.string())
    }),
    accessibility: z.object({
      score: z.number().min(0).max(100),
      issues: z.array(z.string()),
      recommendations: z.array(z.string())
    }),
    seo: z.object({
      score: z.number().min(0).max(100),
      issues: z.array(z.string()),
      recommendations: z.array(z.string())
    }),
    design: z.object({
      score: z.number().min(0).max(100),
      issues: z.array(z.string()),
      recommendations: z.array(z.string())
    }),
    mobile: z.object({
      score: z.number().min(0).max(100),
      issues: z.array(z.string()),
      recommendations: z.array(z.string())
    })
  }),
  overallAssessment: z.string(),
  priorityActions: z.array(z.string()),
  enhancementSuggestions: z.object({
    html: z.array(z.string()),
    css: z.array(z.string()),
    performance: z.array(z.string()),
    accessibility: z.array(z.string()),
    seo: z.array(z.string())
  })
});

// Enhancement response schema
const EnhancementSchema = z.object({
  enhancedHtml: z.string(),
  enhancedCss: z.string(),
  improvements: z.array(z.string()),
  performanceGains: z.object({
    estimated_load_time_improvement: z.string(),
    accessibility_score_increase: z.number(),
    seo_score_increase: z.number(),
    mobile_score_increase: z.number()
  }),
  implementation_notes: z.array(z.string())
});

export class GeminiAnalyzer {
  private static instance: GeminiAnalyzer;

  public static getInstance(): GeminiAnalyzer {
    if (!GeminiAnalyzer.instance) {
      GeminiAnalyzer.instance = new GeminiAnalyzer();
    }
    return GeminiAnalyzer.instance;
  }

  async analyzeWebsite(
    url: string, 
    html: string, 
    options: EnhancementOptions
  ): Promise<any> {
    try {
      console.log(`Starting Gemini analysis for: ${url}`);
      
      const prompt = buildAnalysisPrompt(url, html, options);
      
      const result = await generateObject({
        model: gemini,
        system: WEBSITE_ANALYSIS_SYSTEM_PROMPT,
        prompt: prompt,
        schema: AnalysisSchema,
        temperature: 0.3,
      });

      console.log(`Analysis completed for: ${url}`);
      return result.object;
    } catch (error) {
      console.error('Gemini analysis error:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateEnhancements(
    analysis: any,
    html: string,
    options: EnhancementOptions
  ): Promise<any> {
    try {
      console.log('Starting Gemini enhancement generation');
      
      const prompt = buildEnhancementPrompt(analysis, html, options);
      
      const result = await generateObject({
        model: gemini,
        system: ENHANCEMENT_GENERATION_PROMPT,
        prompt: prompt,
        schema: EnhancementSchema,
        temperature: 0.2,
      });

      console.log('Enhancement generation completed');
      return result.object;
    } catch (error) {
      console.error('Gemini enhancement error:', error);
      throw new Error(`Enhancement generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async quickAnalysis(url: string, html: string): Promise<string> {
    try {
      const result = await generateText({
        model: gemini,
        system: 'You are a website optimization expert. Provide a brief, actionable summary of the main issues and opportunities for improvement.',
        prompt: `Analyze this website: ${url}\n\nHTML content (first 5000 chars):\n${html.slice(0, 5000)}\n\nProvide 3-5 key improvement recommendations.`,
        temperature: 0.4,
        maxTokens: 500,
      });

      return result.text;
    } catch (error) {
      console.error('Quick analysis error:', error);
      throw new Error(`Quick analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const geminiAnalyzer = GeminiAnalyzer.getInstance();