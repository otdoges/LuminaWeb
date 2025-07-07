import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader } from '../ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  Compare,
  BarChart3,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { historicalDataTracker, HistoricalDataHelpers } from '../../lib/historicalData';

interface HistoricalTrendsProps {
  selectedUrl?: string;
  onUrlSelect?: (url: string) => void;
}

interface TrendData {
  date: string;
  timestamp: number;
  performance: number;
  seo: number;
  accessibility: number;
  security: number;
  mobile: number;
  content: number;
  overall: number;
}

export function HistoricalTrends({ selectedUrl, onUrlSelect }: HistoricalTrendsProps) {
  const [trackedUrls, setTrackedUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>(selectedUrl || '');
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null);
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['overall']);
  const [viewMode, setViewMode] = useState<'line' | 'area'>('line');

  // Load tracked URLs on mount
  useEffect(() => {
    loadTrackedUrls();
  }, []);

  // Load trend data when URL or period changes
  useEffect(() => {
    if (currentUrl) {
      loadTrendData();
    }
  }, [currentUrl, periodDays]);

  const loadTrackedUrls = async () => {
    try {
      const urls = await historicalDataTracker.getTrackedUrls();
      setTrackedUrls(urls);
      if (urls.length > 0 && !currentUrl) {
        setCurrentUrl(urls[0]);
        onUrlSelect?.(urls[0]);
      }
    } catch (error) {
      console.error('Failed to load tracked URLs:', error);
    }
  };

  const loadTrendData = async () => {
    if (!currentUrl) return;
    
    setLoading(true);
    try {
      const [snapshots, analysis] = await Promise.all([
        historicalDataTracker.getSnapshots(currentUrl, 50),
        historicalDataTracker.getTrendAnalysis(currentUrl, periodDays)
      ]);

      // Transform snapshots to chart data
      const chartData: TrendData[] = snapshots
        .filter(s => Date.now() - s.timestamp <= periodDays * 24 * 60 * 60 * 1000)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(snapshot => {
          const overall = [
            snapshot.metrics.performance.score,
            snapshot.metrics.seo.score,
            snapshot.metrics.accessibility.score,
            snapshot.metrics.security.score,
            snapshot.metrics.mobile.score,
            snapshot.metrics.content.score
          ].reduce((sum, score) => sum + score, 0) / 6;

          return {
            date: new Date(snapshot.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            }),
            timestamp: snapshot.timestamp,
            performance: snapshot.metrics.performance.score,
            seo: snapshot.metrics.seo.score,
            accessibility: snapshot.metrics.accessibility.score,
            security: snapshot.metrics.security.score,
            mobile: snapshot.metrics.mobile.score,
            content: snapshot.metrics.content.score,
            overall
          };
        });

      setTrendData(chartData);
      setTrendAnalysis(analysis);
    } catch (error) {
      console.error('Failed to load trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setCurrentUrl(url);
    onUrlSelect?.(url);
  };

  const handleExportData = async () => {
    try {
      const data = await historicalDataTracker.exportData('csv');
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumina-analytics-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const metricConfig = {
    performance: { color: '#3B82F6', name: 'Performance' },
    seo: { color: '#10B981', name: 'SEO' },
    accessibility: { color: '#F59E0B', name: 'Accessibility' },
    security: { color: '#EF4444', name: 'Security' },
    mobile: { color: '#8B5CF6', name: 'Mobile' },
    content: { color: '#06B6D4', name: 'Content' },
    overall: { color: '#6B7280', name: 'Overall' }
  };

  const visibleMetrics = selectedMetrics.length > 0 ? selectedMetrics : ['overall'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <p className="font-semibold text-gray-800 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-300">{entry.name}:</span>
              <span className="font-medium text-gray-800 dark:text-white">{entry.value.toFixed(1)}</span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (viewMode === 'area') {
      return (
        <AreaChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            className="text-primary-600 dark:text-primary-400"
            fontSize={12}
          />
          <YAxis 
            className="text-primary-600 dark:text-primary-400"
            fontSize={12}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {visibleMetrics.map((metric) => (
            <Area
              key={metric}
              type="monotone"
              dataKey={metric}
              stackId="1"
              stroke={metricConfig[metric as keyof typeof metricConfig].color}
              fill={metricConfig[metric as keyof typeof metricConfig].color}
              fillOpacity={0.3}
              name={metricConfig[metric as keyof typeof metricConfig].name}
            />
          ))}
        </AreaChart>
      );
    }

    return (
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="date" 
          className="text-primary-600 dark:text-primary-400"
          fontSize={12}
        />
        <YAxis 
          className="text-primary-600 dark:text-primary-400"
          fontSize={12}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {visibleMetrics.map((metric) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={metricConfig[metric as keyof typeof metricConfig].color}
            strokeWidth={2}
            name={metricConfig[metric as keyof typeof metricConfig].name}
            dot={{ fill: metricConfig[metric as keyof typeof metricConfig].color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: metricConfig[metric as keyof typeof metricConfig].color, strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    );
  };

  if (trackedUrls.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Historical Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
            Start analyzing websites to build historical trends and track performance over time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
              Historical Trends
            </h3>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              Track performance changes over time
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode(viewMode === 'line' ? 'area' : 'line')}
              className="px-3 py-1 rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors"
            >
              {viewMode === 'line' ? 'Area View' : 'Line View'}
            </button>
            
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            {/* URL Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Website:
              </label>
              <select
                value={currentUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {trackedUrls.map(url => (
                  <option key={url} value={url}>
                    {new URL(url).hostname}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Period:
              </label>
              <select
                value={periodDays}
                onChange={(e) => setPeriodDays(Number(e.target.value))}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 3 months</option>
                <option value={180}>Last 6 months</option>
                <option value={365}>Last year</option>
              </select>
            </div>
          </div>

          {/* Metric Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(metricConfig).map(([metric, config]) => (
              <button
                key={metric}
                onClick={() => {
                  if (selectedMetrics.includes(metric)) {
                    setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                  } else {
                    setSelectedMetrics([...selectedMetrics, metric]);
                  }
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedMetrics.includes(metric)
                    ? 'text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                style={{
                  backgroundColor: selectedMetrics.includes(metric) ? config.color : undefined
                }}
              >
                {config.name}
              </button>
            ))}
            <button
              onClick={() => setSelectedMetrics(Object.keys(metricConfig))}
              className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Show All
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : trendData.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewMode}-${visibleMetrics.join(',')}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center h-80">
              <div className="text-center">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  No data available for the selected period
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trend Analysis Summary */}
      {trendAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trends Summary */}
          <Card>
            <CardHeader>
              <h4 className="text-lg font-semibold text-primary-900 dark:text-primary-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trend Summary
              </h4>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(trendAnalysis.trends).map(([metric, trend]: [string, any]) => (
                  <div key={metric} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {metric.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {HistoricalDataHelpers.getTrendEmoji(trend.direction)}
                      </span>
                      <span className={`text-sm font-medium ${
                        trend.change > 0 ? 'text-green-600' : trend.change < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights & Recommendations */}
          <Card>
            <CardHeader>
              <h4 className="text-lg font-semibold text-primary-900 dark:text-primary-100 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Insights & Recommendations
              </h4>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Significant Changes */}
                {trendAnalysis.insights.significantChanges.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Significant Changes
                    </h5>
                    <div className="space-y-1">
                      {trendAnalysis.insights.significantChanges.slice(0, 3).map((change: any, index: number) => (
                        <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                          • {change.description}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {trendAnalysis.insights.recommendations.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Recommendations
                    </h5>
                    <div className="space-y-1">
                      {trendAnalysis.insights.recommendations.slice(0, 3).map((rec: string, index: number) => (
                        <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                          • {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 