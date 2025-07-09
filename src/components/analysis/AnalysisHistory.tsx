import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Globe,
  BarChart3,
  GitCompare,
  Download,
  Filter,
  Search,
  RefreshCw,
  Star,
  Archive,
  Trash2,
  Eye,
  Copy,
  MoreVertical,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { InteractiveChart } from '../charts/InteractiveChart';
import { AdvancedFilter } from '../ui/AdvancedFilter';
import { cn } from '../../lib/utils';

// Analysis data interfaces
interface AnalysisResult {
  id: string;
  url: string;
  timestamp: number;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    overall: number;
  };
  metrics: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    totalBlockingTime: number;
    speedIndex: number;
  };
  opportunities: Array<{
    category: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
    savings: number;
  }>;
  diagnostics: Array<{
    category: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    element?: string;
  }>;
  screenshot?: string;
  userAgent: string;
  connectionType: string;
  location: string;
  favorite?: boolean;
  tags?: string[];
  notes?: string;
}

interface AnalysisComparison {
  baseline: AnalysisResult;
  comparison: AnalysisResult;
  differences: {
    scores: Record<string, number>;
    metrics: Record<string, number>;
    trend: 'improved' | 'degraded' | 'stable';
  };
}

interface AnalysisHistoryProps {
  className?: string;
  onAnalysisSelect?: (analysis: AnalysisResult) => void;
  onCompare?: (comparison: AnalysisComparison) => void;
  initialData?: AnalysisResult[];
}

// Sample data generator
const generateSampleAnalysis = (url: string, daysAgo: number): AnalysisResult => {
  const timestamp = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);
  const variance = () => 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
  
  return {
    id: `analysis_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    url,
    timestamp,
    scores: {
      performance: Math.floor(50 + Math.random() * 50),
      accessibility: Math.floor(60 + Math.random() * 40),
      bestPractices: Math.floor(70 + Math.random() * 30),
      seo: Math.floor(65 + Math.random() * 35),
      overall: 0 // calculated
    },
    metrics: {
      loadTime: Math.floor(800 + Math.random() * 2000),
      firstContentfulPaint: Math.round((1.0 + Math.random() * 2.0) * variance() * 100) / 100,
      largestContentfulPaint: Math.round((2.0 + Math.random() * 3.0) * variance() * 100) / 100,
      cumulativeLayoutShift: Math.round(Math.random() * 0.3 * variance() * 1000) / 1000,
      firstInputDelay: Math.floor(10 + Math.random() * 90),
      totalBlockingTime: Math.floor(50 + Math.random() * 400),
      speedIndex: Math.floor(1500 + Math.random() * 2000)
    },
    opportunities: [
      {
        category: 'Images',
        impact: 'high',
        description: 'Serve images in next-gen formats',
        savings: Math.floor(200 + Math.random() * 800)
      },
      {
        category: 'JavaScript',
        impact: 'medium',
        description: 'Remove unused JavaScript',
        savings: Math.floor(100 + Math.random() * 400)
      }
    ],
    diagnostics: [
      {
        category: 'Performance',
        severity: 'warning',
        message: 'Large network payloads',
        element: 'main.js'
      }
    ],
    userAgent: 'Chrome 120.0.0.0',
    connectionType: '4G',
    location: 'Virginia, USA',
    tags: ['production', 'desktop'],
    favorite: Math.random() > 0.8
  };
};

// Calculate overall score
const calculateOverallScore = (scores: AnalysisResult['scores']) => {
  return Math.round((scores.performance + scores.accessibility + scores.bestPractices + scores.seo) / 4);
};

// Score badge component
const ScoreBadge = React.memo(({ 
  score, 
  label, 
  size = 'default' 
}: { 
  score: number; 
  label: string; 
  size?: 'small' | 'default' | 'large';
}) => {
  const getColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    default: 'w-10 h-10 text-sm',
    large: 'w-12 h-12 text-base'
  };

  return (
    <div className="text-center">
      <div className={cn(
        "rounded-full flex items-center justify-center text-white font-bold",
        getColor(score),
        sizeClasses[size]
      )}>
        {score}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
});

ScoreBadge.displayName = 'ScoreBadge';

// Analysis card component
const AnalysisCard = React.memo(({
  analysis,
  onSelect,
  onToggleFavorite,
  onDelete,
  selected = false,
  comparisonMode = false
}: {
  analysis: AnalysisResult;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  selected?: boolean;
  comparisonMode?: boolean;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const overallScore = calculateOverallScore(analysis.scores);
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDate(analysis.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "cursor-pointer transition-all duration-200",
        selected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <Card className={cn(
        "relative hover:shadow-lg",
        comparisonMode && "hover:bg-muted/50"
      )}>
        {/* Favorite star */}
        {analysis.favorite && (
          <Star className="absolute top-3 right-3 w-4 h-4 text-yellow-500 fill-current" />
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate" title={analysis.url}>
                {analysis.url}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{date}</span>
                <Clock className="w-3 h-3" />
                <span>{time}</span>
              </div>
            </div>
            
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-full right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 min-w-32"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite();
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <Star className={cn("w-4 h-4", analysis.favorite && "text-yellow-500 fill-current")} />
                        {analysis.favorite ? 'Remove from favorites' : 'Add to favorites'}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(analysis.url);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy URL
                      </button>
                      
                      <div className="border-t border-border my-1"></div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted text-destructive flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Scores */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <ScoreBadge score={overallScore} label="Overall" size="small" />
            <ScoreBadge score={analysis.scores.performance} label="Perf" size="small" />
            <ScoreBadge score={analysis.scores.accessibility} label="A11y" size="small" />
            <ScoreBadge score={analysis.scores.bestPractices} label="Best" size="small" />
            <ScoreBadge score={analysis.scores.seo} label="SEO" size="small" />
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Load Time:</span>
              <span className="font-medium">{analysis.metrics.loadTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">FCP:</span>
              <span className="font-medium">{analysis.metrics.firstContentfulPaint}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">LCP:</span>
              <span className="font-medium">{analysis.metrics.largestContentfulPaint}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CLS:</span>
              <span className="font-medium">{analysis.metrics.cumulativeLayoutShift}</span>
            </div>
          </div>

          {/* Tags */}
          {analysis.tags && analysis.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {analysis.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

AnalysisCard.displayName = 'AnalysisCard';

// Comparison view component
const ComparisonView = React.memo(({
  baseline,
  comparison,
  onClose
}: {
  baseline: AnalysisResult;
  comparison: AnalysisResult;
  onClose: () => void;
}) => {
  const calculateDifference = (baseValue: number, compareValue: number) => {
    const diff = compareValue - baseValue;
    const percent = baseValue !== 0 ? (diff / baseValue) * 100 : 0;
    return { diff, percent };
  };

  const scoreDiffs = {
    performance: calculateDifference(baseline.scores.performance, comparison.scores.performance),
    accessibility: calculateDifference(baseline.scores.accessibility, comparison.scores.accessibility),
    bestPractices: calculateDifference(baseline.scores.bestPractices, comparison.scores.bestPractices),
    seo: calculateDifference(baseline.scores.seo, comparison.scores.seo)
  };

  const DiffIndicator = ({ diff, percent }: { diff: number; percent: number }) => {
    if (Math.abs(diff) < 1) return <span className="text-muted-foreground">~</span>;
    
    const color = diff > 0 ? 'text-green-600' : 'text-red-600';
    const icon = diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
    
    return (
      <span className={cn("flex items-center gap-1 text-xs", color)}>
        {icon}
        {diff > 0 ? '+' : ''}{diff.toFixed(1)} ({percent > 0 ? '+' : ''}{percent.toFixed(1)}%)
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-auto"
    >
      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Analysis Comparison</h2>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Baseline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Baseline</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(baseline.timestamp).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <ScoreBadge score={calculateOverallScore(baseline.scores)} label="Overall" />
                  <div className="grid grid-cols-4 gap-2">
                    <ScoreBadge score={baseline.scores.performance} label="Perf" size="small" />
                    <ScoreBadge score={baseline.scores.accessibility} label="A11y" size="small" />
                    <ScoreBadge score={baseline.scores.bestPractices} label="Best" size="small" />
                    <ScoreBadge score={baseline.scores.seo} label="SEO" size="small" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Comparison</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(comparison.timestamp).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <ScoreBadge score={calculateOverallScore(comparison.scores)} label="Overall" />
                  <div className="grid grid-cols-4 gap-2">
                    <ScoreBadge score={comparison.scores.performance} label="Perf" size="small" />
                    <ScoreBadge score={comparison.scores.accessibility} label="A11y" size="small" />
                    <ScoreBadge score={comparison.scores.bestPractices} label="Best" size="small" />
                    <ScoreBadge score={comparison.scores.seo} label="SEO" size="small" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Differences */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Score Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(scoreDiffs).map(([key, { diff, percent }]) => (
                  <div key={key} className="text-center">
                    <p className="text-sm font-medium capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <DiffIndicator diff={diff} percent={percent} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metrics comparison chart */}
          <Card>
            <CardHeader>
              <CardTitle>Metrics Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveChart
                type="bar"
                data={[
                  {
                    metric: 'Load Time',
                    baseline: baseline.metrics.loadTime,
                    comparison: comparison.metrics.loadTime
                  },
                  {
                    metric: 'FCP',
                    baseline: baseline.metrics.firstContentfulPaint,
                    comparison: comparison.metrics.firstContentfulPaint
                  },
                  {
                    metric: 'LCP',
                    baseline: baseline.metrics.largestContentfulPaint,
                    comparison: comparison.metrics.largestContentfulPaint
                  }
                ]}
                xKey="metric"
                yKeys={['baseline', 'comparison']}
                height={300}
                colors={['#3B82F6', '#10B981']}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
});

ComparisonView.displayName = 'ComparisonView';

// Main analysis history component
export const AnalysisHistory = React.memo<AnalysisHistoryProps>(({
  className,
  onAnalysisSelect,
  onCompare,
  initialData
}) => {
  // Generate sample data if none provided
  const [analyses, setAnalyses] = useState<AnalysisResult[]>(() => {
    if (initialData) return initialData;
    
    const urls = ['https://example.com', 'https://test-site.com', 'https://demo.dev'];
    const sampleData: AnalysisResult[] = [];
    
    urls.forEach(url => {
      for (let i = 0; i < 15; i++) {
        sampleData.push(generateSampleAnalysis(url, i * 2));
      }
    });
    
    return sampleData.map(analysis => ({
      ...analysis,
      scores: {
        ...analysis.scores,
        overall: calculateOverallScore(analysis.scores)
      }
    }));
  });

  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisResult[]>(analyses);
  const [selectedAnalyses, setSelectedAnalyses] = useState<Set<string>>(new Set());
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<{ baseline: AnalysisResult; comparison: AnalysisResult } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  // Filter configuration
  const filterFields = [
    { key: 'url', label: 'URL', type: 'text' as const },
    { key: 'scores.overall', label: 'Overall Score', type: 'range' as const, min: 0, max: 100 },
    { key: 'scores.performance', label: 'Performance', type: 'range' as const, min: 0, max: 100 },
    { key: 'timestamp', label: 'Date', type: 'date' as const },
    { key: 'favorite', label: 'Favorite', type: 'boolean' as const },
    { key: 'tags', label: 'Tags', type: 'select' as const, options: [
      { value: 'production', label: 'Production' },
      { value: 'staging', label: 'Staging' },
      { value: 'desktop', label: 'Desktop' },
      { value: 'mobile', label: 'Mobile' }
    ]}
  ];

  // Handle analysis selection
  const toggleAnalysisSelection = useCallback((id: string) => {
    if (comparisonMode) {
      setSelectedAnalyses(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(id)) {
          newSelection.delete(id);
        } else if (newSelection.size < 2) {
          newSelection.add(id);
        }
        return newSelection;
      });
    } else {
      const analysis = analyses.find(a => a.id === id);
      if (analysis) {
        onAnalysisSelect?.(analysis);
      }
    }
  }, [comparisonMode, analyses, onAnalysisSelect]);

  // Toggle favorite status
  const toggleFavorite = useCallback((id: string) => {
    setAnalyses(prev => prev.map(analysis =>
      analysis.id === id ? { ...analysis, favorite: !analysis.favorite } : analysis
    ));
  }, []);

  // Delete analysis
  const deleteAnalysis = useCallback((id: string) => {
    setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
    setSelectedAnalyses(prev => {
      const newSelection = new Set(prev);
      newSelection.delete(id);
      return newSelection;
    });
  }, []);

  // Compare selected analyses
  const compareSelected = useCallback(() => {
    const selectedIds = Array.from(selectedAnalyses);
    if (selectedIds.length === 2) {
      const baseline = analyses.find(a => a.id === selectedIds[0])!;
      const comparison = analyses.find(a => a.id === selectedIds[1])!;
      
      setComparisonData({ baseline, comparison });
      setShowComparison(true);
      
      onCompare?.({
        baseline,
        comparison,
        differences: {
          scores: {
            performance: comparison.scores.performance - baseline.scores.performance,
            accessibility: comparison.scores.accessibility - baseline.scores.accessibility,
            bestPractices: comparison.scores.bestPractices - baseline.scores.bestPractices,
            seo: comparison.scores.seo - baseline.scores.seo
          },
          metrics: {
            loadTime: comparison.metrics.loadTime - baseline.metrics.loadTime,
            firstContentfulPaint: comparison.metrics.firstContentfulPaint - baseline.metrics.firstContentfulPaint,
            largestContentfulPaint: comparison.metrics.largestContentfulPaint - baseline.metrics.largestContentfulPaint,
            cumulativeLayoutShift: comparison.metrics.cumulativeLayoutShift - baseline.metrics.cumulativeLayoutShift
          },
          trend: comparison.scores.performance > baseline.scores.performance ? 'improved' : 'degraded'
        }
      });
    }
  }, [selectedAnalyses, analyses, onCompare]);

  // Timeline chart data
  const timelineData = useMemo(() => {
    return filteredAnalyses
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(analysis => ({
        date: new Date(analysis.timestamp).toLocaleDateString(),
        timestamp: analysis.timestamp,
        performance: analysis.scores.performance,
        accessibility: analysis.scores.accessibility,
        seo: analysis.scores.seo,
        bestPractices: analysis.scores.bestPractices,
        overall: calculateOverallScore(analysis.scores),
        url: analysis.url
      }));
  }, [filteredAnalyses]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analysis History</h2>
          <p className="text-muted-foreground">
            {filteredAnalyses.length} analyses • {selectedAnalyses.size} selected
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('timeline')}
              className="h-8"
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
          </div>

          {/* Comparison mode toggle */}
          <Button
            variant={comparisonMode ? 'default' : 'outline'}
            onClick={() => {
              setComparisonMode(!comparisonMode);
              setSelectedAnalyses(new Set());
            }}
            className="flex items-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            Compare
          </Button>

          {/* Compare button */}
          {comparisonMode && selectedAnalyses.size === 2 && (
            <Button onClick={compareSelected}>
              Compare Selected
            </Button>
          )}
        </div>
      </div>

      {/* Advanced filter */}
      <AdvancedFilter
        data={analyses}
        fields={filterFields}
        onFilter={setFilteredAnalyses}
        placeholder="Search analyses..."
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredAnalyses.map((analysis) => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                onSelect={() => toggleAnalysisSelection(analysis.id)}
                onToggleFavorite={() => toggleFavorite(analysis.id)}
                onDelete={() => deleteAnalysis(analysis.id)}
                selected={selectedAnalyses.has(analysis.id)}
                comparisonMode={comparisonMode}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Performance Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <InteractiveChart
                  type="line"
                  data={timelineData}
                  xKey="date"
                  yKeys={['performance', 'accessibility', 'seo', 'bestPractices']}
                  title="Score Trends Over Time"
                  height={400}
                  realTime={false}
                  smoothCurve
                  showBrush
                  colors={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filteredAnalyses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No analyses found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or run a new analysis
          </p>
        </motion.div>
      )}

      {/* Comparison modal */}
      <AnimatePresence>
        {showComparison && comparisonData && (
          <ComparisonView
            baseline={comparisonData.baseline}
            comparison={comparisonData.comparison}
            onClose={() => {
              setShowComparison(false);
              setComparisonData(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

AnalysisHistory.displayName = 'AnalysisHistory';

export default AnalysisHistory; 