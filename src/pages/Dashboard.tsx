import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/dashboard/Sidebar';
import { MetricsCard } from '../components/dashboard/MetricsCard';
import { ScreenshotGallery } from '../components/dashboard/ScreenshotGallery';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { QuickActions } from '../components/dashboard/QuickActions';
import { Monitor, Users, BarChart3, Zap, Globe, Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { RealTimeAnalytics } from '../components/analytics/RealTimeAnalytics';
import { detectAnalyticsStatus, getUserAnalyses, type AnalyticsStatus } from '../lib/analyticsDetection';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useSEO } from '../hooks/useSEO';

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 12,
      duration: 0.6
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [analyticsStatus, setAnalyticsStatus] = useState<AnalyticsStatus | null>(null);
  const [userAnalyses, setUserAnalyses] = useState<any[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // SEO for dashboard page
  useSEO();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user } = useAuth();

  // Load analytics status and user data
  useEffect(() => {
    if (user?.id) {
      loadAnalyticsData();
    }
  }, [user?.id]);

  const loadAnalyticsData = async () => {
    if (!user?.id) return;
    
    setIsLoadingAnalytics(true);
    try {
      const [status, analyses] = await Promise.all([
        detectAnalyticsStatus(user.id),
        getUserAnalyses(user.id, 6)
      ]);
      
      setAnalyticsStatus(status);
      setUserAnalyses(analyses);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Dynamic data based on analytics status
  const getScreenshots = () => {
    if (analyticsStatus?.hasRealAnalytics && userAnalyses.length > 0) {
      return userAnalyses.map(analysis => ({
        id: analysis.id,
        url: analysis.url,
        name: new URL(analysis.url).hostname,
        timestamp: analysis.createdAt,
        thumbnail: `https://api.screenshotmachine.com/?key=demo&url=${encodeURIComponent(analysis.url)}&dimension=1024x768`,
        performanceScore: analysis.analysisData?.performanceScore || 85,
        isExampleData: analysis.isExampleData
      }));
    }
    
    // Fallback to mock data
    return mockScreenshots;
  };

  const mockScreenshots = [
    {
      id: '1',
      url: 'https://example.com',
      name: 'My Portfolio',
      timestamp: new Date(),
      thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400',
      performanceScore: 92,
    },
    {
      id: '2',
      url: 'https://shop.example.com',
      name: 'E-Commerce Store',
      timestamp: new Date(Date.now() - 86400000),
      thumbnail: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=400',
      performanceScore: 78,
    },
    {
      id: '3',
      url: 'https://blog.example.com',
      name: 'Tech Blog',
      timestamp: new Date(Date.now() - 172800000),
      thumbnail: 'https://images.pexels.com/photos/39284/macbook-apple-imac-computer-39284.jpeg?auto=compress&cs=tinysrgb&w=400',
      performanceScore: 85,
    },
  ];

  const getPerformanceData = () => {
    if (analyticsStatus?.hasRealAnalytics && userAnalyses.length > 0) {
      // Generate data from real analyses
      return userAnalyses.slice(0, 6).map((analysis, index) => ({
        date: new Date(analysis.createdAt).toLocaleDateString('en', { month: 'short' }),
        performance: analysis.analysisData?.performanceScore || 85,
        accessibility: analysis.analysisData?.accessibilityScore || 90,
        seo: analysis.analysisData?.seoScore || 80,
        bestPractices: analysis.analysisData?.bestPracticesScore || 88
      })).reverse();
    }
    
    // Fallback to mock data
    return [
      { date: 'Jan', performance: 85, accessibility: 92, seo: 78, bestPractices: 88 },
      { date: 'Feb', performance: 88, accessibility: 94, seo: 82, bestPractices: 90 },
      { date: 'Mar', performance: 92, accessibility: 96, seo: 85, bestPractices: 92 },
      { date: 'Apr', performance: 90, accessibility: 95, seo: 88, bestPractices: 94 },
      { date: 'May', performance: 95, accessibility: 97, seo: 90, bestPractices: 96 },
      { date: 'Jun', performance: 93, accessibility: 98, seo: 87, bestPractices: 95 },
    ];
  };

  const getMetricsData = () => {
    if (analyticsStatus?.hasRealAnalytics) {
      const avgPerformance = userAnalyses.reduce((acc, analysis) => 
        acc + (analysis.analysisData?.performanceScore || 0), 0) / (userAnalyses.length || 1);
      
      return [
        { title: "Websites Analyzed", value: userAnalyses.length.toString(), change: 0, icon: Globe, color: "primary" },
        { title: "Avg Performance Score", value: Math.round(avgPerformance).toString(), change: 5, icon: BarChart3, color: "success" },
        { title: "Active Monitors", value: userAnalyses.filter(a => !a.isExampleData).length.toString(), change: 0, icon: Monitor, color: "accent" },
        { title: "Last Analysis", value: analyticsStatus.lastAnalysisDate ? 
          Math.round((Date.now() - analyticsStatus.lastAnalysisDate.getTime()) / (1000 * 60 * 60 * 24)).toString() + 'd' : 'Never', 
          change: 0, icon: Activity, color: "warning" }
      ];
    }
    
    return [
      { title: "Websites Analyzed", value: "24", change: 12, icon: Globe, color: "primary" },
      { title: "Avg Performance Score", value: "91", change: 5, icon: BarChart3, color: "success" },
      { title: "Issues Found", value: "7", change: -23, icon: Zap, color: "warning" },
      { title: "Active Monitors", value: "12", change: 8, icon: Monitor, color: "accent" }
    ];
  };

  const handleQuickAction = (action: string) => {
    if (action === 'analyze') {
      navigate('/analysis');
    } else {
      setActiveTab(action);
    }
  };

  const renderDashboardContent = () => (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Header with Analytics Status */}
      <motion.div
        className="relative"
        variants={itemVariants}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.h1 
                className="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-2 theme-transition"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Dashboard
              </motion.h1>
              <motion.p 
                className="text-primary-600 dark:text-primary-400 theme-transition text-lg"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Monitor your website performance and optimization metrics
              </motion.p>
            </div>
            
            {/* Analytics Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3"
            >
              {user && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-primary-600 dark:text-primary-400">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
              )}
              
              {analyticsStatus && (
                <Badge 
                  variant={analyticsStatus.hasRealAnalytics ? "default" : "outline"}
                  className="flex items-center gap-1"
                >
                  {analyticsStatus.hasRealAnalytics ? (
                    <><CheckCircle className="h-3 w-3" /> Real Data</>
                  ) : (
                    <><AlertTriangle className="h-3 w-3" /> Example Data</>
                  )}
                </Badge>
              )}
            </motion.div>
          </div>

          {/* Analytics Provider Status */}
          {analyticsStatus && !isLoadingAnalytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mb-4 p-3 rounded-lg bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-800/50 dark:to-accent-800/50 border border-primary-200 dark:border-primary-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-primary-900 dark:text-primary-100 text-sm">
                    Analytics Status
                  </h3>
                  <p className="text-xs text-primary-600 dark:text-primary-400">
                    {analyticsStatus.isUsingExampleData 
                      ? "You're viewing example data. Analyze a website to see real insights."
                      : `Last analyzed: ${analyticsStatus.lastAnalyzedSite || 'Unknown'}`
                    }
                  </p>
                </div>
                <Badge variant={analyticsStatus.analyticsProvider === 'self-hosted' ? 'default' : 'outline'}>
                  {analyticsStatus.analyticsProvider === 'self-hosted' ? 'Connected' : 'Demo Mode'}
                </Badge>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Floating Background Elements */}
        <motion.div
          className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full blur-xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-success-500/20 to-primary-500/20 rounded-full blur-xl"
          variants={{
            animate: {
              y: [10, -10, 10],
              transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }
            }
          }}
          animate="animate"
        />
      </motion.div>

      {/* Enhanced Metrics Cards with Real Data */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        {getMetricsData().map((metric, index) => (
          <motion.div
            key={metric.title}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03,
              y: -4,
              transition: { 
                type: "spring",
                stiffness: 400,
                damping: 25
              }
            }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHoveredCard(metric.title)}
            onHoverEnd={() => setHoveredCard(null)}
            className="relative"
          >
            <MetricsCard
              title={metric.title}
              value={metric.value}
              change={metric.change}
              icon={metric.icon}
              color={metric.color}
            />
            {hoveredCard === metric.title && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5 rounded-lg -z-10 border border-primary-200/50 dark:border-primary-700/50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Quick Actions */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5 rounded-lg"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
        />
        <div className="relative z-10">
          <motion.h2 
            className="text-2xl font-semibold text-primary-900 dark:text-primary-100 mb-4 theme-transition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            Quick Actions
          </motion.h2>
          <QuickActions onAction={handleQuickAction} />
        </div>
      </motion.div>

      {/* Enhanced Performance Chart */}
      <motion.div
        variants={itemVariants}
        className="relative"
      >
        <motion.div
          className="absolute -top-2 -right-2 w-4 h-4 bg-success-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <PerformanceChart data={getPerformanceData()} />
      </motion.div>

      {/* Enhanced Screenshots Gallery */}
      <motion.div
        variants={itemVariants}
        className="relative"
      >
        <motion.div
          className="absolute -top-4 -left-4 w-8 h-8 bg-accent-500/20 rounded-full blur-sm"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <ScreenshotGallery screenshots={getScreenshots()} />
      </motion.div>
    </motion.div>
  );

  const renderAnalyticsContent = () => (
    <RealTimeAnalytics />
  );

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900 theme-transition">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="ml-64 overflow-auto min-h-screen">
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderDashboardContent()}
              </motion.div>
            )}

            {activeTab === 'websites' && (
              <motion.div
                key="websites"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mb-6 theme-transition">
                  Websites
                </h1>
                <p className="text-primary-600 dark:text-primary-400 theme-transition">
                  Manage your analyzed websites and view detailed reports.
                </p>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderAnalyticsContent()}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mb-6 theme-transition">
                  Settings
                </h1>
                <p className="text-primary-600 dark:text-primary-400 theme-transition">
                  Configure your account preferences and optimization settings.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}