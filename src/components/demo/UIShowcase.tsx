import { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { HorizontalNavigation, VerticalNavigation } from '../ui/navigation';
import { useNotifications } from '../ui/notification';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Home, 
  User, 
  Settings, 
  BarChart3, 
  TrendingUp, 
  Heart,
  Star,
  Bell,
  Zap
} from 'lucide-react';

export function UIShowcase() {
  const [activeNavItem, setActiveNavItem] = useState('home');
  const { addNotification } = useNotifications();

  // Show welcome notification when component loads
  useEffect(() => {
    addNotification({
      type: 'success',
      title: '🎨 Welcome to UI Showcase!',
      message: 'Explore the modern components and interactive patterns',
      duration: 5000,
      actions: [
        {
          label: 'Demo Notifications',
          onClick: () => {
            // Inline demo notifications
            addNotification({
              type: 'info',
              title: 'Demo Started!',
              message: 'Watch for multiple notification types',
              duration: 3000
            });
          },
          variant: 'primary'
        }
      ]
    });
  }, [addNotification]);

  // Sample data for charts
  const areaData = [
    { stage: '01', value: 5 },
    { stage: '02', value: 80 },
    { stage: '03', value: 45 },
    { stage: '04', value: 92 },
    { stage: '05', value: 73 },
  ];

  const lineData = [
    { day: 'Mon', calls: 140 },
    { day: 'Tue', calls: 100 },
    { day: 'Wed', calls: 180 },
    { day: 'Thu', calls: 120 },
    { day: 'Fri', calls: 220 },
    { day: 'Sat', calls: 90 },
    { day: 'Sun', calls: 60 },
  ];

  const areaChartConfig = {
    performance: { label: "Performance", color: "hsl(20, 100%, 60%)" },
  };

  const lineChartConfig = {
    calls: { label: "Calls", color: "hsl(217, 91%, 60%)" },
  };

  const horizontalNavItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      active: activeNavItem === 'home',
      onClick: () => setActiveNavItem('home')
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      active: activeNavItem === 'profile',
      onClick: () => setActiveNavItem('profile')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      active: activeNavItem === 'settings',
      onClick: () => setActiveNavItem('settings')
    }
  ];

  const verticalNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      active: activeNavItem === 'dashboard',
      onClick: () => setActiveNavItem('dashboard')
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      active: activeNavItem === 'analytics',
      onClick: () => setActiveNavItem('analytics')
    },
    {
      id: 'trends',
      label: 'Trends',
      icon: TrendingUp,
      active: activeNavItem === 'trends',
      onClick: () => setActiveNavItem('trends')
    }
  ];

  const showNotifications = () => {
    // Show different types of notifications
    addNotification({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed successfully',
      duration: 4000,
      icon: Star
    });

    setTimeout(() => {
      addNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please review your settings',
        duration: 5000,
        actions: [
          {
            label: 'Review',
            onClick: () => addNotification({
              type: 'info',
              title: 'Reviewed',
              message: 'Settings have been reviewed',
              duration: 3000
            }),
            variant: 'primary'
          }
        ]
      });
    }, 1000);

    setTimeout(() => {
      addNotification({
        type: 'error',
        title: 'Error Occurred',
        message: 'Failed to save changes',
        duration: 6000,
        actions: [
          {
            label: 'Retry',
            onClick: () => addNotification({
              type: 'success',
              title: 'Retry Successful',
              message: 'Changes saved successfully',
              duration: 3000
            }),
            variant: 'primary'
          },
          {
            label: 'Cancel',
            onClick: () => {},
            variant: 'secondary'
          }
        ]
      });
    }, 2000);

    setTimeout(() => {
      addNotification({
        type: 'info',
        title: 'New Feature',
        message: 'Check out our latest update',
        duration: 7000,
        icon: Zap,
        actions: [
          {
            label: 'Learn More',
            onClick: () => addNotification({
              type: 'success',
              title: 'Thanks for your interest!',
              message: 'Feature documentation is now available',
              duration: 4000
            }),
            variant: 'primary'
          }
        ]
      });
    }, 3000);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">🎨 Modern UI Showcase</h1>
        <p className="text-muted-foreground">
          Demonstrating modern chart containers, navigation patterns, and notification system
        </p>
      </div>

      {/* Chart Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Stalled Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">4 Deals Stalled At Objection Handling</h3>
              <ChartContainer config={areaChartConfig} className="h-64 w-full">
                <AreaChart data={areaData}>
                  <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <ChartTooltip content={ChartTooltipContent} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--color-performance)" 
                    fill="url(#gradient)"
                    strokeWidth={0}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-performance)" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="var(--color-performance)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Call Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-6xl font-bold">473</div>
              <ChartContainer config={lineChartConfig} className="h-64 w-full">
                <LineChart data={lineData}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <ChartTooltip content={ChartTooltipContent} />
                  <Line 
                    type="monotone" 
                    dataKey="calls" 
                    stroke="var(--color-calls)" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horizontal Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Horizontal Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <HorizontalNavigation items={horizontalNavItems} />
              <p className="text-sm text-muted-foreground">
                Active item: <strong>{activeNavItem}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vertical Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Vertical Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <VerticalNavigation items={verticalNavItems} />
              <p className="text-sm text-muted-foreground">
                Active item: <strong>{activeNavItem}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Notification System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Click the button below to see various notification types with different behaviors, 
              actions, and auto-dismiss timers.
            </p>
            <Button onClick={showNotifications} className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Demo Notifications
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sample Notification Display */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Pattern Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-border/30 dark:border-white/20 bg-border/10 dark:bg-white/10 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-inter font-normal tracking-tighter text-sm mb-1">New like received</p>
                <p className="text-xs text-muted-foreground mb-3">Someone liked your photo</p>
                <div className="flex gap-2">
                  <button className="text-xs bg-border/20 dark:bg-white/20 backdrop-blur-md border border-border/40 dark:border-white/30 rounded-xl px-3 py-1 transition-all duration-300 hover:scale-105 hover:bg-border/30 dark:hover:bg-white/30 active:scale-95">
                    View
                  </button>
                  <button className="text-xs bg-transparent rounded-xl px-3 py-1 transition-all duration-300 hover:scale-105 hover:bg-border/10 dark:hover:bg-white/10 active:scale-95">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 