export interface Website {
  id: string;
  url: string;
  name: string;
  screenshot?: string;
  lastAnalyzed: Date;
  performanceScore: number;
  accessibilityScore: number;
  seoScore: number;
  bestPracticesScore: number;
}

export interface PerformanceMetric {
  id: string;
  websiteId: string;
  timestamp: Date;
  loadTime: number;
  performanceScore: number;
  accessibilityScore: number;
  seoScore: number;
  bestPracticesScore: number;
}

export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  accent: string;
  background: string;
  surface: string;
}

export interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  currentTheme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
  availableThemes: ColorTheme[];
}