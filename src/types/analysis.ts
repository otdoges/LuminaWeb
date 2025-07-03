export interface WebsiteAnalysis {
  timestamp: any;
  id: string;
  url: string;
  name: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  createdAt: Date;
  completedAt?: Date;
  metrics: AnalysisMetrics;
  settings: AnalysisSettings;
}

export interface AnalysisMetrics {
  seo: SEOMetrics;
  performance: PerformanceMetrics;
  engagement: EngagementMetrics;
  security: SecurityMetrics;
  mobile: MobileMetrics;
  content: ContentMetrics;
}

export interface SEOMetrics {
  score: number;
  title: string;
  description: string;
  keywords: string[];
  metaTags: number;
  headingStructure: number;
  internalLinks: number;
  externalLinks: number;
  imageAlt: number;
  sitemap: boolean;
  robotsTxt: boolean;
}

export interface PerformanceMetrics {
  score: number;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  totalBlockingTime: number;
  speedIndex: number;
  timeToInteractive: number;
}

export interface EngagementMetrics {
  monthlyVisitors: number;
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: string;
  pageViews: number;
  uniqueVisitors: number;
  returnVisitors: number;
  topPages: TopPage[];
  trafficSources: TrafficSource[];
  demographics: Demographics;
}

export interface SecurityMetrics {
  score: number;
  httpsEnabled: boolean;
  sslCertificate: boolean;
  securityHeaders: number;
  vulnerabilities: Vulnerability[];
  malwareDetected: boolean;
  privacyPolicy: boolean;
  cookiePolicy: boolean;
}

export interface MobileMetrics {
  score: number;
  responsive: boolean;
  mobileSpeed: number;
  touchTargets: number;
  viewportConfig: boolean;
  mobileUsability: number;
}

export interface ContentMetrics {
  score: number;
  readabilityScore: number;
  wordCount: number;
  duplicateContent: number;
  brokenLinks: number;
  imageOptimization: number;
  contentFreshness: number;
}

export interface TopPage {
  url: string;
  title: string;
  views: number;
  bounceRate: number;
  avgTime: string;
}

export interface TrafficSource {
  source: string;
  percentage: number;
  visitors: number;
}

export interface Demographics {
  ageGroups: { range: string; percentage: number }[];
  gender: { male: number; female: number; other: number };
  locations: { country: string; percentage: number }[];
  devices: { desktop: number; mobile: number; tablet: number };
}

export interface Vulnerability {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

export interface AnalysisSettings {
  parameters: AnalysisParameter[];
  trafficSources: string[];
  conversionTracking: boolean;
  customerJourney: boolean;
  heatmapVisualization: boolean;
  abTesting: boolean;
  customKPIs: string[];
  reportFormat: 'pdf' | 'excel' | 'json';
  scheduledReports: boolean;
  reportFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface AnalysisParameter {
  id: string;
  name: string;
  enabled: boolean;
  weight: number;
}

export interface AnalysisTemplate {
  id: string;
  name: string;
  description: string;
  settings: AnalysisSettings;
  createdAt: Date;
  isDefault: boolean;
}

export interface CompetitorData {
  url: string;
  name: string;
  metrics: Partial<AnalysisMetrics>;
}