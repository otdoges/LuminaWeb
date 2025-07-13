import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Activity, 
  Clock, 
  TrendingUp, 
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Eye,
  MousePointer,
  BarChart3
} from 'lucide-react';
import { MetricsCard } from '../dashboard/MetricsCard';
import { plausibleAnalytics, PlausibleMetrics, PlausibleTimeseriesData } from '../../lib/plausibleAnalytics';

interface RealTimeAnalyticsProps {
  period?: string;
  refreshInterval?: number;
  className?: string;
}

export function RealTimeAnalytics({ 
  period = '30d', 
  refreshInterval = 30000, // 30 seconds
  className = ''
}: RealTimeAnalyticsProps) {
  const [metrics, setMetrics] = useState<PlausibleMetrics | null>(null);
  const [timeseriesData, setTimeseriesData] = useState<PlausibleTimeseriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
      const [metricsData, timeseriesData] = await Promise.all([
        plausibleAnalytics.getCurrentMetrics(period),
        plausibleAnalytics.getTimeseriesData(period)
      ]);

      setMetrics(metricsData);
      setTimeseriesData(timeseriesData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
      setLoading(false);
    }
  }, [period]);

  // Initial load and refresh interval
  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchAnalytics, refreshInterval]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Mini chart component for metrics
  const MiniChart = ({ data, color = '#3B82F6' }: { data: number[], color?: string }) => (
    <div className="flex items-end space-x-1 h-8">
      {data.slice(-10).map((value, index) => (
        <motion.div
          key={index}
          className="w-2 rounded-t"
          style={{ backgroundColor: color }}
          initial={{ height: 0 }}
          animate={{ height: `${(value / Math.max(...data)) * 32}px` }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        />
      ))}
    </div>
  );

  if (error) {
    return (
      <motion.div
        className={`bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-700 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`space-y-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 theme-transition">
            Real-time Analytics
          </h2>
          <p className="text-primary-600 dark:text-primary-400 theme-transition">
            Live data from your Plausible instance
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Live indicator */}
          <motion.div
            className="flex items-center space-x-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-primary-600 dark:text-primary-400">Live</span>
          </motion.div>

          {/* Refresh button */}
          <motion.button
            onClick={fetchAnalytics}
            className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800 hover:bg-primary-200 dark:hover:bg-primary-700 theme-transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 text-primary-600 dark:text-primary-400 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <AnimatePresence mode="wait">
          {metrics ? (
            <>
              <motion.div key="visitors" variants={itemVariants}>
                <MetricsCard
                  title="Unique Visitors"
                  value={plausibleAnalytics.formatNumber(metrics.visitors.value)}
                  change={metrics.visitors.change}
                  icon={Users}
                  color="primary"
                  loading={loading}
                />
              </motion.div>
              
              <motion.div key="pageviews" variants={itemVariants}>
                <MetricsCard
                  title="Page Views"
                  value={plausibleAnalytics.formatNumber(metrics.pageviews.value)}
                  change={metrics.pageviews.change}
                  icon={Activity}
                  color="success"
                  loading={loading}
                />
              </motion.div>
              
              <motion.div key="bounce" variants={itemVariants}>
                <MetricsCard
                  title="Bounce Rate"
                  value={`${metrics.bounceRate.value}%`}
                  change={metrics.bounceRate.change}
                  icon={TrendingUp}
                  color="warning"
                  loading={loading}
                />
              </motion.div>
              
              <motion.div key="duration" variants={itemVariants}>
                <MetricsCard
                  title="Avg. Session"
                  value={plausibleAnalytics.formatVisitDuration(metrics.visitDuration.value)}
                  change={metrics.visitDuration.change}
                  icon={Clock}
                  color="accent"
                  loading={loading}
                />
              </motion.div>
            </>
          ) : (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                key={`loading-${index}`}
                className="bg-white dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700 animate-pulse"
                variants={itemVariants}
              >
                <div className="h-4 bg-primary-200 dark:bg-primary-700 rounded w-3/4 mb-4" />
                <div className="h-8 bg-primary-200 dark:bg-primary-700 rounded w-1/2 mb-2" />
                <div className="h-3 bg-primary-200 dark:bg-primary-700 rounded w-1/4" />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Real-time Chart */}
      <motion.div
        className="bg-white dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 theme-transition">
            Traffic Trends
          </h3>
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm text-primary-600 dark:text-primary-400">
              Last {period}
            </span>
          </div>
        </div>

        {/* Simple visualization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full" />
              <span className="text-sm text-primary-600 dark:text-primary-400">Visitors</span>
            </div>
            <MiniChart 
              data={timeseriesData.map(d => d.visitors)} 
              color="#3B82F6"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success-500 rounded-full" />
              <span className="text-sm text-primary-600 dark:text-primary-400">Page Views</span>
            </div>
            <MiniChart 
              data={timeseriesData.map(d => d.pageviews)} 
              color="#10B981"
            />
          </div>
        </div>
      </motion.div>

      {/* Status Footer */}
      <motion.div
        className="text-center text-sm text-primary-600 dark:text-primary-400 theme-transition"
        variants={itemVariants}
      >
        {lastUpdated ? (
          <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
        ) : (
          <p>Loading analytics data...</p>
        )}
      </motion.div>
    </motion.div>
  );
} 