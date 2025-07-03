import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight, Target, Zap, Shield, Search, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { scrapingBee } from '../../lib/scrapingbee';
import { groqService } from '../../lib/groq';
import { useNotifications } from '../ui/notification';

interface CompetitorData {
  url: string;
  name: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  seoScore: number;
  performanceScore: number;
  contentScore: number;
  uniqueFeatures: string[];
  marketPosition: string;
  targetAudience: string;
  analysis?: any;
}

interface CompetitorComparisonProps {
  primaryWebsite: {
    url: string;
    name: string;
    metrics: any;
  };
  onAnalysisComplete?: (results: CompetitorData[]) => void;
}

export function CompetitorComparison({ primaryWebsite, onAnalysisComplete }: CompetitorComparisonProps) {
  const [competitors, setCompetitors] = useState<string[]>(['']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<CompetitorData[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<string>('');
  const { addNotification } = useNotifications();

  const addCompetitor = () => {
    setCompetitors([...competitors, '']);
  };

  const updateCompetitor = (index: number, url: string) => {
    const updated = [...competitors];
    updated[index] = url;
    setCompetitors(updated);
  };

  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const analyzeCompetitor = async (url: string): Promise<CompetitorData> => {
    try {
      setCurrentAnalysis(url);
      
      // Get comprehensive analysis using enhanced ScrapingBee AI
      const [analysis, competitiveInsights] = await Promise.all([
        scrapingBee.comprehensiveAnalysisWithAI(url),
        scrapingBee.extractCompetitiveInsights(url)
      ]);

      // Get additional AI insights using Groq
      const groqAnalysis = await groqService.analyzeContentIntelligence({
        url,
        analysisType: ['content', 'seo', 'competitive', 'ux'],
        websiteData: {
          html: analysis.html,
          screenshot: analysis.screenshot,
          metrics: analysis.metrics
        },
        customPrompt: `Analyze this competitor website focusing on competitive advantages, market positioning, and unique value propositions. Compare content strategy, user experience, and business approach.`
      });

      // Calculate scores based on analysis
      const seoScore = calculateSEOScore(analysis.metrics.seo);
      const performanceScore = calculatePerformanceScore(analysis.metrics.performance);
      const contentScore = groqAnalysis.contentQuality.score;
      const overallScore = Math.round((seoScore + performanceScore + contentScore) / 3);

      return {
        url,
        name: extractDomainName(url),
        overallScore,
        seoScore,
        performanceScore,
        contentScore,
        strengths: competitiveInsights?.competitiveAdvantages || groqAnalysis.competitiveAdvantage.strengths || [],
        weaknesses: competitiveInsights?.competitiveWeaknesses || groqAnalysis.competitiveAdvantage.weaknesses || [],
        uniqueFeatures: competitiveInsights?.uniqueValueProposition ? [competitiveInsights.uniqueValueProposition] : [],
        marketPosition: competitiveInsights?.marketPositioning || 'Standard market positioning',
        targetAudience: competitiveInsights?.targetAudience || 'General audience',
        analysis: {
          technical: (analysis.aiInsights as any)?.technicalInsights,
          content: groqAnalysis,
          competitive: competitiveInsights
        }
      };
    } catch (error) {
      console.error(`Failed to analyze competitor ${url}:`, error);
      throw error;
    }
  };

  const runCompetitiveAnalysis = async () => {
    const validCompetitors = competitors.filter(url => url.trim() && isValidUrl(url));
    
    if (validCompetitors.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Competitors',
        message: 'Please add at least one competitor URL to analyze.',
        duration: 4000
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResults([]);

    try {
      addNotification({
        type: 'info',
        title: 'Competitive Analysis Started',
        message: `Analyzing ${validCompetitors.length} competitor(s). This may take a few minutes.`,
        duration: 5000
      });

      const results: CompetitorData[] = [];
      
      // Analyze competitors sequentially to avoid rate limiting
      for (const competitorUrl of validCompetitors) {
        try {
          const result = await analyzeCompetitor(competitorUrl);
          results.push(result);
          setAnalysisResults([...results]); // Update UI with partial results
          
          addNotification({
            type: 'success',
            title: 'Competitor Analyzed',
            message: `Successfully analyzed ${result.name}`,
            duration: 3000
          });
        } catch (error) {
          addNotification({
            type: 'error',
            title: 'Analysis Failed',
            message: `Failed to analyze ${extractDomainName(competitorUrl)}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            duration: 5000
          });
        }
      }

      // Generate comparative insights
      if (results.length > 0) {
        const comparativeInsights = await generateComparativeInsights(primaryWebsite, results);
        
        addNotification({
          type: 'success',
          title: 'Competitive Analysis Complete',
          message: `Analysis complete! Found ${results.length} competitive insights.`,
          duration: 5000
        });

        onAnalysisComplete?.(results);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Analysis Error',
        message: 'Failed to complete competitive analysis. Please try again.',
        duration: 6000
      });
    } finally {
      setIsAnalyzing(false);
      setCurrentAnalysis('');
    }
  };

  const generateComparativeInsights = async (primary: any, competitors: CompetitorData[]) => {
    try {
      const comparison = await groqService.analyzeSeosIntelligence({
        url: primary.url,
        analysisType: ['competitive', 'strategic'],
        customPrompt: `Compare this primary website against these competitors and provide strategic recommendations:

Primary Website: ${primary.url}
Primary Metrics: ${JSON.stringify(primary.metrics, null, 2)}

Competitors Analysis:
${competitors.map(comp => `
- ${comp.name} (${comp.url})
  - Overall Score: ${comp.overallScore}
  - Strengths: ${comp.strengths.join(', ')}
  - Market Position: ${comp.marketPosition}
`).join('')}

Provide strategic competitive insights including:
1. Competitive positioning recommendations
2. Differentiation opportunities  
3. Areas where competitors have advantages
4. Strategic action plan for competitive improvement`
      });

      return comparison;
    } catch (error) {
      console.error('Failed to generate comparative insights:', error);
      return null;
    }
  };

  // Helper functions
  const calculateSEOScore = (seo: any): number => {
    let score = 0;
    if (seo.title && seo.title.length >= 30 && seo.title.length <= 60) score += 25;
    if (seo.description && seo.description.length >= 120 && seo.description.length <= 160) score += 20;
    if (seo.headings && seo.headings.h1 > 0) score += 15;
    if (seo.metaTags > 8) score += 15;
    if (seo.imageAlt > 0) score += 15;
    if (seo.internalLinks > 5) score += 10;
    return Math.min(100, score);
  };

  const calculatePerformanceScore = (performance: any): number => {
    let score = 100;
    const loadTimeMs = performance.loadTime;
    if (loadTimeMs > 5000) score -= 30;
    else if (loadTimeMs > 3000) score -= 20;
    else if (loadTimeMs > 1500) score -= 10;
    return Math.max(0, score);
  };

  const extractDomainName = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <ArrowRight className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Competitive Analysis Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            Add competitor websites to compare against <strong>{primaryWebsite.name}</strong>
          </div>
          
          {competitors.map((competitor, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                placeholder="https://competitor-website.com"
                value={competitor}
                onChange={(e) => updateCompetitor(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isAnalyzing}
              />
              {competitors.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeCompetitor(index)}
                  disabled={isAnalyzing}
                  className="px-3"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={addCompetitor}
              disabled={isAnalyzing || competitors.length >= 5}
            >
              Add Competitor
            </Button>
            <Button
              onClick={runCompetitiveAnalysis}
              disabled={isAnalyzing || competitors.every(c => !c.trim())}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          </div>
          
          {isAnalyzing && currentAnalysis && (
            <div className="text-sm text-blue-600">
              Currently analyzing: {extractDomainName(currentAnalysis)}
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Competitive Analysis Results</h3>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analysisResults.map((competitor, index) => (
              <motion.div
                key={competitor.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{competitor.name}</span>
                      <div className="flex items-center gap-1">
                        {getScoreIcon(competitor.overallScore)}
                        <span className={`text-sm font-semibold ${getScoreColor(competitor.overallScore)}`}>
                          {competitor.overallScore}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Search className="w-3 h-3" />
                          <span className={getScoreColor(competitor.seoScore)}>
                            {competitor.seoScore}
                          </span>
                        </div>
                        <div className="text-gray-500">SEO</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span className={getScoreColor(competitor.performanceScore)}>
                            {competitor.performanceScore}
                          </span>
                        </div>
                        <div className="text-gray-500">Speed</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Globe className="w-3 h-3" />
                          <span className={getScoreColor(competitor.contentScore)}>
                            {competitor.contentScore}
                          </span>
                        </div>
                        <div className="text-gray-500">Content</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-green-600 mb-1">Strengths</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {competitor.strengths.slice(0, 3).map((strength, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-red-600 mb-1">Weaknesses</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {competitor.weaknesses.slice(0, 3).map((weakness, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {competitor.marketPosition && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-500">Market Position</div>
                        <div className="text-xs text-gray-700">{competitor.marketPosition}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}