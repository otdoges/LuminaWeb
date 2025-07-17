import { useState, useRef, ChangeEvent } from 'react';
import SafeHTML from './SafeHTML';
import { generateWithGroq, improveWebsiteWithKimi, GROQ_MODELS } from '../lib/groq';

// Mock data for demonstration purposes (kept for reference)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOCK_ANALYSIS_RESULT: ApiAnalysisResult = {
  meta: {
    title: 'Sample Website',
    description: 'A modern website with clean design and user-friendly interface'
  },
  colorPalette: ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'],
  layoutInfo: {
    width: 1200,
    height: 800,
    hasHeader: true,
    hasFooter: true,
    layoutType: 'modern',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter'
  },
  navigationItems: [
    { text: 'Home', href: '/' },
    { text: 'About', href: '/about' },
    { text: 'Services', href: '/services' },
    { text: 'Contact', href: '/contact' }
  ],
  fontInfo: {
    dominantFont: 'Inter',
    dominantSize: '16px',
    fontVariety: 3
  },
  stylePreference: 'minimalist',
  recommendations: {
    colorAdjustments: 'Consider using a more consistent color palette with better contrast ratios',
    layoutImprovements: 'Improve spacing and alignment for better visual hierarchy',
    typographyChanges: 'Use a more consistent font sizing system and improve readability'
  }
};

// Mock responses removed - using real Groq integration

interface ApiAnalysisResult {
  meta?: {
    title: string;
    description: string;
  };
  colorPalette: string[];
  layoutInfo: {
    width: number;
    height: number;
    hasHeader: boolean;
    hasFooter: boolean;
    layoutType: string;
    backgroundColor: string;
    fontFamily: string;
  };
  navigationItems: {
    text: string;
    href: string;
  }[];
  fontInfo: {
    dominantFont: string;
    dominantSize: string;
    fontVariety: number;
  };
  stylePreference: string;
  recommendations: {
    colorAdjustments: string;
    layoutImprovements: string;
    typographyChanges: string;
  };
}

interface AnalysisResult {
  analysis: string;
  thinking?: string;
  recommendation?: string;
  improvements?: string;
  apiResult?: ApiAnalysisResult | null;
}

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
  });
};

const ImageAnalysisPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [error, setError] = useState('');
  const [showThinking, setShowThinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'file' | 'url'>('file');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Create image preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Clear previous results
    setError('');
    setResult(null);
    setAnalysisMode('file');
  };

  const handleUrlInput = (e: ChangeEvent<HTMLInputElement>) => {
    setWebsiteUrl(e.target.value);
    setAnalysisMode('url');
    setResult(null);
  };

  const handleAnalyze = async () => {
    // Validate input based on mode
    if (analysisMode === 'file' && (!fileInputRef.current?.files?.length)) {
      setError('Please select an image to analyze');
      return;
    }

    if (analysisMode === 'url' && !websiteUrl) {
      setError('Please enter a website URL to analyze');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (analysisMode === 'file') {
        await analyzeWithFile();
      } else {
        await analyzeWithUrl();
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeWithFile = async () => {
    if (!fileInputRef.current?.files?.length) return;
    
    const file = fileInputRef.current.files[0];
    
    try {
      // Convert file to base64 for analysis (ready for future vision model integration)
      await fileToBase64(file);
      
      // Create analysis prompt
      const analysisPrompt = `
        Analyze this website screenshot and provide a comprehensive analysis including:
        
        1. Visual Design Assessment
        - Overall design quality and modern appeal
        - Color scheme effectiveness
        - Typography choices and readability
        - Layout and spacing
        
        2. User Experience Evaluation
        - Navigation clarity
        - Content hierarchy
        - Call-to-action visibility
        - Mobile responsiveness indicators
        
        3. Conversion Optimization
        - Trust signals present
        - Value proposition clarity
        - Form and button design
        - Overall conversion potential
        
        4. Technical Observations
        - Performance indicators
        - Accessibility considerations
        - SEO-friendly elements visible
        
        Provide specific, actionable recommendations for improvements in each area.
        Format your response in markdown with clear sections.
      `;
      
      // Generate analysis using Groq
      const analysis = await generateWithGroq(
        analysisPrompt,
        GROQ_MODELS.LLAMA_33_70B,
        {
          system: "You are an expert web developer and UX designer who analyzes websites and provides detailed, actionable feedback for improvements.",
          temperature: 0.7
        }
      );
      
      // Get improvement suggestions using Kimi K2
      const improvements = await improveWebsiteWithKimi(analysis);
      
      setResult({
        analysis: analysis,
        improvements: improvements,
        apiResult: null // We don't need the mock structure anymore
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  };

  const analyzeWithUrl = async () => {
    // Validate URL format
    if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
      throw new Error('Please enter a valid URL starting with http:// or https://');
    }
    
    try {
      // Create analysis prompt for URL-based analysis
      const analysisPrompt = `
        Analyze the website at ${websiteUrl} and provide a comprehensive analysis including:
        
        1. First Impressions & Brand Perception
        - Overall visual appeal and professional appearance
        - Brand consistency and messaging clarity
        - Credibility and trust indicators
        
        2. User Experience Assessment
        - Navigation structure and usability
        - Content organization and readability
        - Mobile responsiveness considerations
        - Page load performance indicators
        
        3. Conversion & Marketing Effectiveness
        - Call-to-action placement and clarity
        - Value proposition communication
        - Lead generation and conversion opportunities
        - SEO and content marketing potential
        
        4. Technical & Modern Standards
        - Design trends alignment
        - Accessibility considerations
        - Security and performance indicators
        
        5. Competitive Analysis Context
        - Industry standard comparisons
        - Differentiation opportunities
        - Modern web design best practices
        
        Provide specific, actionable recommendations for improvements in each area.
        Focus on high-impact changes that would improve user engagement and conversions.
        Format your response in markdown with clear sections and prioritized recommendations.
      `;
      
      // Generate analysis using Groq
      const analysis = await generateWithGroq(
        analysisPrompt,
        GROQ_MODELS.LLAMA_33_70B,
        {
          system: "You are an expert web developer, UX designer, and digital marketing strategist who analyzes websites and provides detailed, actionable feedback for improvements. Focus on modern web standards, user experience, and conversion optimization.",
          temperature: 0.7
        }
      );
      
      // Get improvement suggestions using Kimi K2
      const improvements = await improveWebsiteWithKimi(
        analysis,
        `Website URL: ${websiteUrl} - Focus on specific implementation steps and modern design trends.`
      );
      
      setResult({
        analysis: analysis,
        improvements: improvements,
        apiResult: null
      });
      
    } catch (error) {
      console.error('URL Analysis error:', error);
      throw error;
    }
  };

  // Helper function for formatting API results (kept for future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatApiResultToText = (apiResult: ApiAnalysisResult): string => {
    return `
# Website Analysis

## Overview
${apiResult.meta?.title ? `Title: ${apiResult.meta.title}` : ''}
${apiResult.meta?.description ? `\nDescription: ${apiResult.meta.description}` : ''}

## Style Analysis
Detected Style: **${apiResult.stylePreference}**

### Color Palette
${apiResult.colorPalette.map(color => `- ${color}`).join('\n')}

### Layout Information
- Type: ${apiResult.layoutInfo.layoutType}
- Has Header: ${apiResult.layoutInfo.hasHeader ? 'Yes' : 'No'}
- Has Footer: ${apiResult.layoutInfo.hasFooter ? 'Yes' : 'No'}
- Background Color: ${apiResult.layoutInfo.backgroundColor}

### Typography
- Dominant Font: ${apiResult.fontInfo.dominantFont}
- Dominant Size: ${apiResult.fontInfo.dominantSize}
- Font Variety: ${apiResult.fontInfo.fontVariety} different fonts detected

## Navigation
${apiResult.navigationItems.length > 0 ? apiResult.navigationItems.map(item => `- ${item.text} (${item.href})`).join('\n') : '- No navigation items detected'}

## Recommendations
1. COLORS: ${apiResult.recommendations.colorAdjustments}
2. LAYOUT: ${apiResult.recommendations.layoutImprovements}
3. TYPOGRAPHY: ${apiResult.recommendations.typographyChanges}
`;
  };

  const formatAnalysis = (text: string) => {
    // First format the text with HTML
    return text
      .replace(/(^|\n)#\s+(.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-6 mb-3 text-purple-300">$2</h2>')
      .replace(/(^|\n)##\s+(.*?)(\n|$)/g, '<h3 class="text-lg font-bold mt-4 mb-2 text-purple-200">$2</h3>')
      .replace(/(^|\n)###\s+(.*?)(\n|$)/g, '<h4 class="text-md font-bold mt-3 mb-2 text-purple-100">$2</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>')
      .replace(/- (.*?)(?=\n|$)/g, '<li class="ml-4 mb-1">$1</li>')
      .split('\n\n')
      .map(paragraph => `<p class="mb-3">${paragraph}</p>`)
      .join('');
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold font-display mb-6">AI Website Analysis</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Website URL
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
          placeholder="https://example.com"
          value={websiteUrl}
          onChange={handleUrlInput}
          aria-label="Website URL"
        />
        <p className="mt-1 text-sm text-gray-400">Enter URL to analyze directly, or upload a screenshot below</p>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload Website Screenshot (Optional)
        </label>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600/30 file:text-purple-300 hover:file:bg-purple-600/40"
          onChange={handleFileChange}
          aria-label="Upload website screenshot"
        />
      </div>
      
      {imagePreview && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-300 mb-2">Preview:</p>
          <div className="relative w-full h-64 bg-gray-800/50 rounded-xl overflow-hidden border border-white/5">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <button
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2 justify-center disabled:opacity-50 disabled:hover:shadow-none"
          onClick={handleAnalyze}
          disabled={isLoading || (analysisMode === 'file' && !fileInputRef.current?.files?.length) || (analysisMode === 'url' && !websiteUrl)}
          aria-label="Analyze website"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : analysisMode === 'url' ? 'Analyze Website' : 'Analyze Screenshot'}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 text-red-300 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-8">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-xl font-bold font-display">Analysis Results</h3>
            {result.thinking && (
              <button
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                onClick={() => setShowThinking(!showThinking)}
                aria-label={showThinking ? "Hide AI thinking process" : "Show AI thinking process"}
              >
                {showThinking ? 'Hide AI Thinking Process' : 'Show AI Thinking Process'}
              </button>
            )}
          </div>
          
          {showThinking && result.thinking && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-white/5">
              <h4 className="text-md font-semibold mb-2 text-purple-300">AI Thinking Process:</h4>
              <div className="text-sm text-gray-300 whitespace-pre-line">
                {result.thinking}
              </div>
              
              {result.recommendation && (
                <>
                  <h4 className="text-md font-semibold mt-4 mb-2 text-purple-300">Initial Recommendations:</h4>
                  <div className="text-sm text-gray-300 whitespace-pre-line">
                    {result.recommendation}
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="space-y-6">
            {/* Main Analysis */}
            <div className="p-5 bg-gray-800/30 border border-white/5 rounded-xl">
              <h4 className="text-lg font-semibold mb-3 text-purple-300">Website Analysis</h4>
              <SafeHTML 
                html={formatAnalysis(result.analysis)}
                className="prose prose-invert max-w-none text-gray-300"
              />
            </div>

            {/* Improvements Section */}
            {result.improvements && (
              <div className="p-5 bg-gradient-to-r from-purple-800/20 to-indigo-800/20 border border-purple-500/20 rounded-xl">
                <h4 className="text-lg font-semibold mb-3 text-purple-300 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  Kimi K2 Improvement Recommendations
                </h4>
                <SafeHTML 
                  html={formatAnalysis(result.improvements)}
                  className="prose prose-invert max-w-none text-gray-300"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysisPanel; 