import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Home, 
  BarChart3, 
  Settings, 
  Search,
  Plus,
  Filter,
  Share,
  Download,
  RefreshCw,
  Star,
  Bookmark,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { useSwipeable } from 'react-swipeable';

interface MobileOptimizedDashboardProps {
  data?: any;
  onAnalyze?: (url: string) => void;
  onRefresh?: () => void;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  badge?: number;
}

export function MobileOptimizedDashboard({ 
  data, 
  onAnalyze, 
  onRefresh 
}: MobileOptimizedDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchUrl, setSearchUrl] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [pullToRefresh, setPullToRefresh] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mobile-specific state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Haptic feedback (if available)
  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Show toast notification
  const showToastNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  // Handle pull-to-refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollContainerRef.current?.scrollTop === 0) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || scrollContainerRef.current?.scrollTop !== 0) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStart.y;
    
    if (deltaY > 0) {
      e.preventDefault();
      const distance = Math.min(deltaY, 100);
      setPullDistance(distance);
      
      if (distance > 60) {
        setPullToRefresh(true);
        hapticFeedback('light');
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullToRefresh) {
      setIsRefreshing(true);
      hapticFeedback('medium');
      
      try {
        await onRefresh?.();
        showToastNotification('Dashboard refreshed', 'success');
      } catch (error) {
        showToastNotification('Failed to refresh', 'error');
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setTouchStart(null);
    setPullDistance(0);
    setPullToRefresh(false);
  };

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const tabs = ['overview', 'analytics', 'history', 'settings'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
        setSwipeDirection('left');
        hapticFeedback('light');
      }
    },
    onSwipedRight: () => {
      const tabs = ['overview', 'analytics', 'history', 'settings'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
        setSwipeDirection('right');
        hapticFeedback('light');
      }
    },
    trackMouse: false
  });

  // Handle search
  const handleSearch = async () => {
    if (!searchUrl.trim()) return;
    
    try {
      setIsSearchOpen(false);
      showToastNotification('Starting analysis...', 'info');
      await onAnalyze?.(searchUrl);
      setSearchUrl('');
      showToastNotification('Analysis completed', 'success');
    } catch (error) {
      showToastNotification('Analysis failed', 'error');
    }
  };

  // Toggle card expansion
  const toggleCard = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
    hapticFeedback('light');
  };

  // Tab configuration
  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      content: <OverviewContent data={data} onToggleCard={toggleCard} expandedCards={expandedCards} />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      content: <AnalyticsContent data={data} />,
      badge: data?.alerts?.length || 0
    },
    {
      id: 'history',
      label: 'History',
      icon: TrendingUp,
      content: <HistoryContent data={data} />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      content: <SettingsContent />
    }
  ];

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <motion.header 
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            LuminaWeb
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
          >
            <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={() => onRefresh?.()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
            disabled={isRefreshing}
          >
            <onRefresh className={`w-5 h-5 text-gray-700 dark:text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.header>

      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {pullDistance > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
              <Refresh className={`w-5 h-5 text-primary-600 ${pullToRefresh ? 'animate-spin' : ''}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
                placeholder="Enter website URL..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                autoFocus
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors touch-target"
              >
                Analyze
              </button>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...swipeHandlers}
      >
        <div className="p-4 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ 
                opacity: 0, 
                x: swipeDirection === 'left' ? 100 : swipeDirection === 'right' ? -100 : 0 
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ 
                opacity: 0, 
                x: swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0 
              }}
              transition={{ duration: 0.3 }}
              onAnimationComplete={() => setSwipeDirection(null)}
            >
              {activeTabContent}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-1 fixed bottom-0 left-0 right-0 z-50">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  hapticFeedback('light');
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors touch-target relative ${
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-4 right-4 z-50"
          >
            <div className={`rounded-lg p-4 shadow-lg flex items-center gap-3 ${
              showToast.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200'
                : showToast.type === 'error'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {showToast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {showToast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {showToast.type === 'info' && <Info className="w-5 h-5" />}
              <span className="font-medium">{showToast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 p-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMenuOpen(false);
                      hapticFeedback('light');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left touch-target"
                  >
                    <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <span className="text-gray-900 dark:text-white font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}

// Individual content components
function OverviewContent({ 
  data, 
  onToggleCard, 
  expandedCards 
}: { 
  data: any; 
  onToggleCard: (id: string) => void; 
  expandedCards: Set<string>; 
}) {
  const metrics = [
    { id: 'performance', label: 'Performance', score: data?.performance || 85, color: 'text-blue-600' },
    { id: 'seo', label: 'SEO', score: data?.seo || 92, color: 'text-green-600' },
    { id: 'accessibility', label: 'Accessibility', score: data?.accessibility || 78, color: 'text-yellow-600' },
    { id: 'security', label: 'Security', score: data?.security || 95, color: 'text-purple-600' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="touch-target">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {metric.label}
                </span>
                <span className={`text-lg font-bold ${metric.color}`}>
                  {metric.score}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metric.score >= 90 ? 'bg-green-500' :
                    metric.score >= 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="touch-target">
        <CardHeader
          className="cursor-pointer"
          onClick={() => onToggleCard('recent-analyses')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Analyses
            </h3>
            {expandedCards.has('recent-analyses') ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        <AnimatePresence>
          {expandedCards.has('recent-analyses') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">{i}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          example{i}.com
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          2 hours ago
                        </p>
                      </div>
                      <Star className="w-4 h-4 text-yellow-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

function AnalyticsContent({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Trends
          </h3>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Chart placeholder</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommendations
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['Optimize images', 'Minify CSS', 'Enable compression'].map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-medium text-primary-600">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rec}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    High impact improvement
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HistoryContent({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Analysis History
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    example{i}.com
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Score: {90 - i * 5} • {i} day{i > 1 ? 's' : ''} ago
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Share className="w-4 h-4 text-gray-500 touch-target" />
                  <Download className="w-4 h-4 text-gray-500 touch-target" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsContent() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Preferences
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Use dark theme</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  darkMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Enable push notifications</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Auto Refresh</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Automatically refresh data</p>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoRefresh ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 