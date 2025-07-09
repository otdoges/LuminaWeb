import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import {
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Home,
  BarChart3,
  History,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Maximize2,
  Share,
  Download,
  Refresh,
  Globe,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { InteractiveChart } from '../charts/InteractiveChart';
import { cn } from '../../lib/utils';
import { useMobile } from '../../hooks/useMobile';

// Mobile navigation types
interface MobileNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
}

// Swipeable card component
const SwipeableCard = React.memo<SwipeableCardProps>(({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useTransform(x, [-100, 0, 100], [0.95, 1, 0.95]);
  const opacity = useTransform(x, [-100, 0, 100], [0.8, 1, 0.8]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    
    if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
      // Horizontal swipe
      if (info.offset.x > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (info.offset.x < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (info.offset.y > threshold && onSwipeDown) {
        onSwipeDown();
      } else if (info.offset.y < -threshold && onSwipeUp) {
        onSwipeUp();
      }
    }

    // Reset position
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{ x, y, scale, opacity }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
});

SwipeableCard.displayName = 'SwipeableCard';

// Mobile bottom navigation
const MobileBottomNav = React.memo(({
  items,
  activeItem,
  onItemSelect
}: {
  items: MobileNavItem[];
  activeItem: string;
  onItemSelect: (id: string) => void;
}) => {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50 safe-area-pb"
    >
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemSelect(item.id)}
            disabled={item.disabled}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-colors relative",
              activeItem === item.id ? "text-primary" : "text-muted-foreground",
              item.disabled && "opacity-50"
            )}
          >
            <div className="relative">
              {item.icon}
              {item.badge && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </motion.nav>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';

// Expandable metric card for mobile
const MobileMetricCard = React.memo(({
  title,
  value,
  change,
  trend,
  details,
  icon,
  color = '#3B82F6'
}: {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  details?: Array<{ label: string; value: string | number }>;
  icon?: React.ReactNode;
  color?: string;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <SwipeableCard 
      onSwipeUp={() => setExpanded(true)}
      onSwipeDown={() => setExpanded(false)}
      className="w-full"
    >
      <Card className="touch-manipulation">
        <CardHeader 
          className="pb-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <div style={{ color }}>{icon}</div>
                </div>
              )}
              <div>
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">{value}</span>
                  {change !== undefined && (
                    <span className={cn(
                      "text-sm flex items-center gap-1",
                      trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                    )}>
                      {trend === 'up' && '↗'}
                      {trend === 'down' && '↘'}
                      {trend === 'stable' && '→'}
                      {change > 0 ? '+' : ''}{change}%
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {expanded && details && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {details.map((detail, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{detail.label}</span>
                      <span className="text-sm font-medium">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </SwipeableCard>
  );
});

MobileMetricCard.displayName = 'MobileMetricCard';

// Mobile chart wrapper with gestures
const MobileChart = React.memo(({
  title,
  children,
  onMaximize,
  onShare,
  onRefresh
}: {
  title: string;
  children: React.ReactNode;
  onMaximize?: () => void;
  onShare?: () => void;
  onRefresh?: () => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <SwipeableCard 
      onSwipeUp={onMaximize}
      className="w-full"
    >
      <Card className="touch-manipulation">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-2 mt-2"
              >
                {onMaximize && (
                  <Button variant="outline" size="sm" onClick={onMaximize}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                )}
                {onShare && (
                  <Button variant="outline" size="sm" onClick={onShare}>
                    <Share className="w-4 h-4" />
                  </Button>
                )}
                {onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh}>
                    <Refresh className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>
        
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </SwipeableCard>
  );
});

MobileChart.displayName = 'MobileChart';

// Pull-to-refresh component
const PullToRefresh = React.memo(({
  onRefresh,
  children
}: {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const threshold = 80;

  const handleTouchStart = (e: TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(diff, threshold + 20));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing]);

  return (
    <div ref={containerRef} className="relative">
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-muted/50 backdrop-blur-sm"
            style={{ transform: `translateY(${pullDistance - threshold}px)` }}
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: isRefreshing ? 1 : 0.2, repeat: isRefreshing ? Infinity : 0 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Refresh className="w-4 h-4" />
              {isRefreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div style={{ paddingTop: Math.max(0, pullDistance) }}>
        {children}
      </div>
    </div>
  );
});

PullToRefresh.displayName = 'PullToRefresh';

// Device preview selector
const DevicePreview = React.memo(({
  selectedDevice,
  onDeviceChange
}: {
  selectedDevice: 'mobile' | 'tablet' | 'desktop';
  onDeviceChange: (device: 'mobile' | 'tablet' | 'desktop') => void;
}) => {
  const devices = [
    { id: 'mobile', label: 'Mobile', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'tablet', label: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
    { id: 'desktop', label: 'Desktop', icon: <Monitor className="w-4 h-4" /> }
  ] as const;

  return (
    <div className="flex bg-muted rounded-lg p-1 w-fit">
      {devices.map((device) => (
        <Button
          key={device.id}
          variant={selectedDevice === device.id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onDeviceChange(device.id)}
          className="h-8 gap-1"
        >
          {device.icon}
          <span className="hidden sm:inline">{device.label}</span>
        </Button>
      ))}
    </div>
  );
});

DevicePreview.displayName = 'DevicePreview';

// Mobile dashboard component
const MobileDashboard = React.memo(() => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [refreshing, setRefreshing] = useState(false);

  const navItems: MobileNavItem[] = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-5 h-5" /> },
    { id: 'analysis', label: 'Analysis', icon: <BarChart3 className="w-5 h-5" />, badge: 3 },
    { id: 'history', label: 'History', icon: <History className="w-5 h-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const sampleData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    performance: Math.floor(50 + Math.random() * 50),
    accessibility: Math.floor(60 + Math.random() * 40),
    seo: Math.floor(70 + Math.random() * 30)
  })).reverse();

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-4 pb-20">
            {/* Device selector */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Performance Overview</h2>
              <DevicePreview
                selectedDevice={selectedDevice}
                onDeviceChange={setSelectedDevice}
              />
            </div>

            {/* Key metrics */}
            <div className="space-y-3">
              <MobileMetricCard
                title="Overall Score"
                value={87}
                change={5.2}
                trend="up"
                icon={<Globe className="w-5 h-5" />}
                color="#10B981"
                details={[
                  { label: 'Performance', value: '92' },
                  { label: 'Accessibility', value: '85' },
                  { label: 'Best Practices', value: '91' },
                  { label: 'SEO', value: '79' }
                ]}
              />

              <MobileMetricCard
                title="Load Time"
                value="1.2s"
                change={-8.3}
                trend="down"
                icon={<BarChart3 className="w-5 h-5" />}
                color="#3B82F6"
                details={[
                  { label: 'First Contentful Paint', value: '0.8s' },
                  { label: 'Largest Contentful Paint', value: '1.9s' },
                  { label: 'Cumulative Layout Shift', value: '0.05' }
                ]}
              />

              <MobileMetricCard
                title="Mobile Score"
                value={78}
                change={2.1}
                trend="up"
                icon={<Smartphone className="w-5 h-5" />}
                color="#8B5CF6"
                details={[
                  { label: 'Touch Target Size', value: 'Good' },
                  { label: 'Viewport Configuration', value: 'Good' },
                  { label: 'Font Size', value: 'Needs Work' }
                ]}
              />
            </div>

            {/* Performance chart */}
            <MobileChart
              title="Performance Trend"
              onMaximize={() => console.log('Maximize chart')}
              onShare={() => console.log('Share chart')}
              onRefresh={() => console.log('Refresh chart')}
            >
              <div className="p-4">
                <InteractiveChart
                  type="line"
                  data={sampleData}
                  xKey="date"
                  yKeys={['performance', 'accessibility', 'seo']}
                  height={200}
                  showGrid={false}
                  showLegend={false}
                  smoothCurve
                  colors={['#3B82F6', '#10B981', '#F59E0B']}
                />
              </div>
            </MobileChart>
          </div>
        );

      case 'analysis':
        return (
          <div className="space-y-4 pb-20">
            <h2 className="text-lg font-semibold">Latest Analysis</h2>
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Analysis view coming soon</p>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-4 pb-20">
            <h2 className="text-lg font-semibold">Analysis History</h2>
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>History view coming soon</p>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-4 pb-20">
            <h2 className="text-lg font-semibold">Search & Filter</h2>
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Search view coming soon</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-4 pb-20">
            <h2 className="text-lg font-semibold">Settings</h2>
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Settings view coming soon</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="container mx-auto p-4">
          {renderContent()}
        </div>
      </PullToRefresh>

      <MobileBottomNav
        items={navItems}
        activeItem={activeView}
        onItemSelect={setActiveView}
      />
    </div>
  );
});

MobileDashboard.displayName = 'MobileDashboard';

// Touch-friendly button component
const TouchButton = React.memo(({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  className,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'large';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const sizeClasses = {
    default: 'min-h-[44px] px-4',
    large: 'min-h-[56px] px-6 text-lg'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "touch-manipulation rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
        sizeClasses[size],
        variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === 'outline' && "border border-border bg-background hover:bg-muted",
        variant === 'ghost' && "hover:bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});

TouchButton.displayName = 'TouchButton';

// Main mobile-optimized component
export const MobileOptimizedViews = React.memo(({
  className
}: {
  className?: string;
}) => {
  const { isMobile } = useMobile();

  if (!isMobile) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <Smartphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Mobile View</h3>
        <p className="text-muted-foreground">
          This view is optimized for mobile devices. Switch to a mobile device or resize your browser to see the mobile interface.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("mobile-optimized", className)}>
      <MobileDashboard />
    </div>
  );
});

MobileOptimizedViews.displayName = 'MobileOptimizedViews';

// Export components
export {
  SwipeableCard,
  MobileBottomNav,
  MobileMetricCard,
  MobileChart,
  PullToRefresh,
  DevicePreview,
  TouchButton,
  MobileDashboard
};

export default MobileOptimizedViews; 