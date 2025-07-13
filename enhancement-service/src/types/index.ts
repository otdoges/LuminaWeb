export interface EnhancementOptions {
  improvePerformance: boolean;
  enhanceAccessibility: boolean;
  optimizeSeo: boolean;
  modernizeDesign: boolean;
  mobileOptimize: boolean;
}

export interface WebsiteAnalysis {
  url: string;
  title: string;
  description: string;
  html: string;
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
  performance: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  accessibility: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  seo: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  design: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  mobile: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

export interface EnhancementResult {
  originalUrl: string;
  analysis: WebsiteAnalysis;
  enhancedHtml: string;
  enhancedCss: string;
  improvements: string[];
  overallScore: {
    before: number;
    after: number;
    improvement: number;
  };
  categoryScores: {
    performance: { before: number; after: number };
    accessibility: { before: number; after: number };
    seo: { before: number; after: number };
    design: { before: number; after: number };
    mobile: { before: number; after: number };
  };
}

export interface AnalysisRequest {
  url: string;
  options: EnhancementOptions;
  clientName?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}