import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { HorizontalNavigation, VerticalNavigation } from '../ui/navigation';
import { useNotifications } from '../ui/notification';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { LiquidGlass } from '../ui/LiquidGlass';
import { ModernCard } from '../ui/ModernCard';
import { AccountCard } from '../ui/AccountCard';
import { 
  Home, 
  User, 
  Settings, 
  BarChart3, 
  TrendingUp, 
  Heart,
  Star,
  Bell,
  Zap,
  Palette,
  Sparkles,
  Users,
  Activity,
  Camera,
  Music,
  Code,
  Globe,
  Shield,
  Clock,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

export function UIShowcase() {
  const [activeSection, setActiveSection] = useState('accounts');
  const [activeNavItem, setActiveNavItem] = useState('home');
  const { addNotification } = useNotifications();

  // Mock data for showcase
  const teamMembers = [
    { 
      name: 'Sarah Johnson', 
      role: 'Product Designer', 
      isOnline: true,
      stats: { followers: 2847, following: 423, posts: 89 }
    },
    { 
      name: 'Alex Chen', 
      role: 'Frontend Developer', 
      isOnline: true,
      stats: { followers: 1632, following: 298, posts: 156 }
    },
    { 
      name: 'Maria Rodriguez', 
      role: 'UX Researcher', 
      isOnline: false,
      stats: { followers: 987, following: 145, posts: 67 }
    },
    { 
      name: 'David Kim', 
      role: 'Design System Lead', 
      isOnline: true,
      stats: { followers: 3421, following: 567, posts: 234 }
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'Liquid Glass Effects',
      description: 'Modern glassmorphism with dynamic blur and saturation',
      color: 'from-purple-400 to-pink-400'
    },
    {
      icon: Palette,
      title: 'Adaptive Themes',
      description: 'Seamless light and dark mode transitions',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      icon: Activity,
      title: 'Micro Interactions',
      description: 'Smooth animations and hover effects',
      color: 'from-green-400 to-emerald-400'
    },
    {
      icon: Shield,
      title: 'Modern Design',
      description: 'Clean, minimalist interface patterns',
      color: 'from-orange-400 to-red-400'
    }
  ];

  // Show welcome notification when component loads
  useEffect(() => {
    addNotification({
      type: 'success',
      title: '✨ Modern UI Showcase',
      message: 'Experience the future of web interfaces with liquid glass effects',
      duration: 5000,
      actions: [
        {
          label: 'Explore Components',
          onClick: () => {
            addNotification({
              type: 'info',
              title: 'Interactive Demo',
              message: 'Click on cards and buttons to see smooth animations',
              duration: 4000
            });
          },
          variant: 'primary'
        }
      ]
    });
  }, [addNotification]);

  // Chart data for analytics showcase
  const performanceData = [
    { month: 'Jan', users: 4000, revenue: 2400, engagement: 85 },
    { month: 'Feb', users: 3000, revenue: 1398, engagement: 78 },
    { month: 'Mar', users: 2000, revenue: 9800, engagement: 92 },
    { month: 'Apr', users: 2780, revenue: 3908, engagement: 88 },
    { month: 'May', users: 1890, revenue: 4800, engagement: 95 },
    { month: 'Jun', users: 2390, revenue: 3800, engagement: 89 },
  ];

  const statsCards = [
    { 
      title: 'Total Users',
      value: '127.2K',
      change: '+12.3%',
      icon: Users,
      color: 'from-blue-500 to-purple-500'
    },
    { 
      title: 'Engagement',
      value: '89.4%',
      change: '+5.2%',
      icon: Activity,
      color: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'Revenue',
      value: '$89.2K',
      change: '+18.7%',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500'
    },
    { 
      title: 'Sessions',
      value: '45.8K',
      change: '+7.3%',
      icon: Clock,
      color: 'from-purple-500 to-pink-500'
    }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            ✨ Liquid Glass UI Showcase
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of web interfaces with modern glassmorphism, dynamic animations, and responsive design patterns
          </p>
        </motion.div>

        {/* Section Navigation */}
        <LiquidGlass variant="subtle" className="p-2 w-fit mx-auto">
          <div className="flex gap-2">
            {[
              { id: 'accounts', label: 'Account Cards', icon: Users },
              { id: 'features', label: 'Feature Cards', icon: Sparkles },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map((section) => (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeSection === section.id
                    ? 'bg-white/30 dark:bg-white/20 text-foreground shadow-lg'
                    : 'text-muted-foreground hover:bg-white/20 dark:hover:bg-white/10'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </motion.button>
            ))}
          </div>
        </LiquidGlass>

        {/* Account Cards Section */}
        {activeSection === 'accounts' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Account Cards</h2>
              <p className="text-muted-foreground">Beautiful user profile cards with liquid glass effects</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AccountCard
                    name={member.name}
                    role={member.role}
                    isOnline={member.isOnline}
                    stats={member.stats}
                    onClick={() => addNotification({
                      type: 'info',
                      title: `Viewing ${member.name}`,
                      message: `Opened profile for ${member.role}`,
                      duration: 3000
                    })}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Feature Cards Section */}
        {activeSection === 'features' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Feature Showcase</h2>
              <p className="text-muted-foreground">Explore the advanced capabilities of our design system</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ModernCard variant="glow" className="p-8">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground mb-4">{feature.description}</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                          onClick={() => addNotification({
                            type: 'success',
                            title: feature.title,
                            message: feature.description,
                            duration: 4000
                          })}
                        >
                          Learn More
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </ModernCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analytics Section */}
        {activeSection === 'analytics' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Analytics Dashboard</h2>
              <p className="text-muted-foreground">Real-time metrics with beautiful visualizations</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ModernCard variant="gradient" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {stat.change}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </ModernCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Notification System</h2>
              <p className="text-muted-foreground">Interactive notifications with actions and animations</p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6">
              <LiquidGlass variant="card" className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-semibold mb-2">Demo Notifications</h3>
                <p className="text-muted-foreground mb-6">
                  Click the button below to see various notification types with different behaviors, 
                  actions, and auto-dismiss timers.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={showNotifications}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Zap className="w-4 h-4" />
                  Demo Notifications
                </motion.button>
              </LiquidGlass>

              {/* Sample Notification Preview */}
              <ModernCard variant="glow" className="p-6">
                <h4 className="font-semibold mb-4">Notification Preview</h4>
                <div className="space-y-4">
                  {[
                    { icon: Heart, title: 'New like received', desc: 'Someone liked your photo', color: 'from-pink-500 to-rose-500' },
                    { icon: MessageCircle, title: 'New message', desc: 'You have 3 unread messages', color: 'from-blue-500 to-cyan-500' },
                    { icon: Shield, title: 'Security alert', desc: 'New login from Chrome', color: 'from-green-500 to-emerald-500' }
                  ].map((notif, index) => (
                    <motion.div
                      key={notif.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="rounded-2xl border border-border/30 dark:border-white/20 bg-border/10 dark:bg-white/10 backdrop-blur-md p-4 hover:scale-[1.02] transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${notif.color} flex items-center justify-center`}>
                          <notif.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mb-3">{notif.desc}</p>
                          <div className="flex gap-2">
                            <button className="text-xs bg-border/20 dark:bg-white/20 backdrop-blur-md border border-border/40 dark:border-white/30 rounded-xl px-3 py-1 transition-all duration-300 hover:scale-105">
                              View
                            </button>
                            <button className="text-xs hover:bg-border/10 dark:hover:bg-white/10 rounded-xl px-3 py-1 transition-all duration-300">
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ModernCard>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
} 