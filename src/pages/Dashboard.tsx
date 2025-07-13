import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/dashboard/Sidebar';
import { MetricsCard } from '../components/dashboard/MetricsCard';
import { ScreenshotGallery } from '../components/dashboard/ScreenshotGallery';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { QuickActions } from '../components/dashboard/QuickActions';
import { Monitor, Users, BarChart3, Zap, Globe, Activity, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { RealTimeAnalytics } from '../components/analytics/RealTimeAnalytics';

// Enhanced animation variants
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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
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
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  // Mock data with more realistic values
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

  const performanceData = [
    { date: 'Jan', performance: 85, accessibility: 92, seo: 78, bestPractices: 88 },
    { date: 'Feb', performance: 88, accessibility: 94, seo: 82, bestPractices: 90 },
    { date: 'Mar', performance: 92, accessibility: 96, seo: 85, bestPractices: 92 },
    { date: 'Apr', performance: 90, accessibility: 95, seo: 88, bestPractices: 94 },
    { date: 'May', performance: 95, accessibility: 97, seo: 90, bestPractices: 96 },
    { date: 'Jun', performance: 93, accessibility: 98, seo: 87, bestPractices: 95 },
  ];

  const handleQuickAction = (action: string) => {
    if (action === 'analyze') {
      navigate('/analysis');
    } else {
      setActiveTab(action);
    }
  };

  const renderDashboardContent = () => (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Header with Floating Elements */}
      <motion.div
        className="relative"
        variants={itemVariants}
      >
        <div className="relative z-10">
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

      {/* Enhanced Metrics Cards with Hover Effects */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {[
          { title: "Websites Analyzed", value: "24", change: 12, icon: Globe, color: "primary" },
          { title: "Avg Performance Score", value: "91", change: 5, icon: BarChart3, color: "success" },
          { title: "Issues Found", value: "7", change: -23, icon: Zap, color: "warning" },
          { title: "Active Monitors", value: "12", change: 8, icon: Monitor, color: "accent" }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              rotateY: 5,
              transition: { duration: 0.3 }
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
                className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-lg -z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
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
        <PerformanceChart data={performanceData} />
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
        <ScreenshotGallery screenshots={mockScreenshots} />
      </motion.div>
    </motion.div>
  );

  const renderAnalyticsContent = () => (
    <RealTimeAnalytics />
  );

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900 flex theme-transition">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
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