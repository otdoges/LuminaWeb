import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/dashboard/Sidebar';
import { MetricsCard } from '../components/dashboard/MetricsCard';
import { ScreenshotGallery } from '../components/dashboard/ScreenshotGallery';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { QuickActions } from '../components/dashboard/QuickActions';
import { Monitor, Users, BarChart3, Zap, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  // Mock data
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

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900 flex theme-transition">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mb-2 theme-transition">
                  Dashboard
                </h1>
                <p className="text-primary-600 dark:text-primary-400 theme-transition">
                  Monitor your website performance and optimization metrics
                </p>
              </motion.div>

              {/* Metrics Cards */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <MetricsCard
                  title="Websites Analyzed"
                  value="24"
                  change={12}
                  icon={Globe}
                  color="primary"
                />
                <MetricsCard
                  title="Avg Performance Score"
                  value="91"
                  change={5}
                  icon={BarChart3}
                  color="success"
                />
                <MetricsCard
                  title="Issues Found"
                  value="7"
                  change={-23}
                  icon={Zap}
                  color="warning"
                />
                <MetricsCard
                  title="Active Monitors"
                  value="12"
                  change={8}
                  icon={Monitor}
                  color="accent"
                />
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-4 theme-transition">
                  Quick Actions
                </h2>
                <QuickActions onAction={handleQuickAction} />
              </motion.div>

              {/* Performance Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <PerformanceChart data={performanceData} />
              </motion.div>

              {/* Screenshots Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <ScreenshotGallery screenshots={mockScreenshots} />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'websites' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mb-6 theme-transition">
                Analytics
              </h1>
              <p className="text-primary-600 dark:text-primary-400 theme-transition">
                Deep dive into performance metrics and trends.
              </p>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mb-6 theme-transition">
                Settings
              </h1>
              <p className="text-primary-600 dark:text-primary-400 theme-transition">
                Configure your account preferences and optimization settings.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}