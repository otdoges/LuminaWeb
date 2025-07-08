import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../components/ui/notification';
import { LiquidGlass } from '../components/ui/LiquidGlass';
import { ModernCard } from '../components/ui/ModernCard';
import { AccountCard } from '../components/ui/AccountCard';
import { Button } from '../components/ui/button';
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Eye,
  Database,
  Clock,
  Download,
  Trash2,
  Edit,
  Camera,
  Mail,
  Phone,
  MapPin,
  Zap,
  Moon,
  Sun,
  Monitor,
  Volume2,
  Smartphone,
  Wifi,
  Lock,
  Key,
  CreditCard,
  Settings as SettingsIcon,
  Save,
  RefreshCw
} from 'lucide-react';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentTheme, setTheme } = useTheme();
  const { addNotification } = useNotifications();

  // Settings state
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: user?.user_metadata?.name || 'John Doe',
      email: user?.email || 'john@example.com',
      bio: 'Web developer passionate about creating amazing user experiences',
      location: 'San Francisco, CA',
      phone: '+1 (555) 123-4567',
      website: 'https://johndoe.dev',
      avatar: user?.user_metadata?.avatar_url || ''
    },
    notifications: {
      email: true,
      push: true,
      marketing: false,
      security: true,
      updates: true,
      digest: 'weekly',
      quiet_hours: true,
      sound: true
    },
    privacy: {
      profile_visibility: 'public',
      show_email: false,
      show_phone: false,
      analytics: true,
      cookies: true,
      data_export: false
    },
    appearance: {
      theme: currentTheme,
      language: 'en',
      timezone: 'America/Los_Angeles',
      date_format: 'MM/DD/YYYY',
      compact_mode: false,
      animations: true
    },
    security: {
      two_factor: false,
      session_timeout: '30',
      login_notifications: true,
      device_management: true,
      activity_log: true
    },
    billing: {
      plan: 'Pro',
      billing_cycle: 'monthly',
      auto_renew: true,
      invoice_email: true
    }
  });

  const sections = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Manage your personal information and public profile'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      color: 'from-purple-500 to-pink-500',
      description: 'Control how and when you receive notifications'
    },
    { 
      id: 'privacy', 
      label: 'Privacy', 
      icon: Shield, 
      color: 'from-green-500 to-emerald-500',
      description: 'Manage your privacy settings and data preferences'
    },
    { 
      id: 'appearance', 
      label: 'Appearance', 
      icon: Palette, 
      color: 'from-orange-500 to-red-500',
      description: 'Customize the look and feel of your workspace'
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: Lock, 
      color: 'from-red-500 to-pink-500',
      description: 'Secure your account with advanced security options'
    },
    { 
      id: 'billing', 
      label: 'Billing', 
      icon: CreditCard, 
      color: 'from-indigo-500 to-purple-500',
      description: 'Manage your subscription and billing information'
    }
  ];

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));

    addNotification({
      type: 'success',
      title: 'Setting Updated',
      message: 'Your preferences have been saved',
      duration: 3000
    });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme);
    updateSetting('appearance', 'theme', theme);
  };

  const handleSaveAll = () => {
    addNotification({
      type: 'success',
      title: 'Settings Saved',
      message: 'All your settings have been saved successfully',
      duration: 4000,
      actions: [
        {
          label: 'View Changes',
          onClick: () => console.log('Settings:', settings),
          variant: 'primary'
        }
      ]
    });
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }: {
    enabled: boolean;
    onChange: (value: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
          enabled 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg' 
            : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
          animate={{ x: enabled ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <LiquidGlass variant="button" hover className="p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="w-10 h-10 bg-transparent hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </LiquidGlass>
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <SettingsIcon className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account preferences and application settings
            </p>
          </div>

          <LiquidGlass variant="button" hover>
            <Button onClick={handleSaveAll} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg">
              <Save className="w-4 h-4 mr-2" />
              Save All
            </Button>
          </LiquidGlass>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <LiquidGlass variant="panel" className="p-6 sticky top-6">
              <h3 className="font-semibold mb-4 text-foreground">Settings</h3>
              <div className="space-y-2">
                {sections.map((section) => (
                  <motion.button
                    key={section.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all duration-300 flex items-center gap-3 ${
                      activeSection === section.id
                        ? 'bg-white/30 dark:bg-white/20 text-foreground shadow-lg'
                        : 'text-muted-foreground hover:bg-white/20 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                      <section.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{section.label}</p>
                      <p className="text-xs opacity-75">{section.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </LiquidGlass>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Profile Settings */}
            {activeSection === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <ModernCard variant="glow" className="p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-500" />
                    Profile Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                      <AccountCard
                        name={settings.profile.name}
                        role="Account Holder"
                        avatar={settings.profile.avatar}
                        isOnline={true}
                        onClick={() => addNotification({
                          type: 'info',
                          title: 'Profile Photo',
                          message: 'Click to upload a new profile photo',
                          duration: 3000
                        })}
                      />
                    </div>
                    
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
                          <input
                            type="text"
                            value={settings.profile.name}
                            onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                            className="w-full p-3 rounded-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 backdrop-blur-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                          <input
                            type="email"
                            value={settings.profile.email}
                            onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                            className="w-full p-3 rounded-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 backdrop-blur-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Bio</label>
                        <textarea
                          value={settings.profile.bio}
                          onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
                          rows={3}
                          className="w-full p-3 rounded-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 backdrop-blur-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
                          <input
                            type="text"
                            value={settings.profile.location}
                            onChange={(e) => updateSetting('profile', 'location', e.target.value)}
                            className="w-full p-3 rounded-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 backdrop-blur-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Website</label>
                          <input
                            type="url"
                            value={settings.profile.website}
                            onChange={(e) => updateSetting('profile', 'website', e.target.value)}
                            className="w-full p-3 rounded-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 backdrop-blur-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <ModernCard variant="glow" className="p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Bell className="w-6 h-6 text-purple-500" />
                    Notification Preferences
                  </h2>
                  
                  <div className="space-y-6">
                    <ToggleSwitch
                      enabled={settings.notifications.email}
                      onChange={(value) => updateSetting('notifications', 'email', value)}
                      label="Email Notifications"
                      description="Receive notifications via email"
                    />
                    
                    <ToggleSwitch
                      enabled={settings.notifications.push}
                      onChange={(value) => updateSetting('notifications', 'push', value)}
                      label="Push Notifications"
                      description="Receive push notifications in your browser"
                    />
                    
                    <ToggleSwitch
                      enabled={settings.notifications.marketing}
                      onChange={(value) => updateSetting('notifications', 'marketing', value)}
                      label="Marketing Communications"
                      description="Receive updates about new features and promotions"
                    />
                    
                    <ToggleSwitch
                      enabled={settings.notifications.security}
                      onChange={(value) => updateSetting('notifications', 'security', value)}
                      label="Security Alerts"
                      description="Get notified about important security events"
                    />
                    
                    <ToggleSwitch
                      enabled={settings.notifications.quiet_hours}
                      onChange={(value) => updateSetting('notifications', 'quiet_hours', value)}
                      label="Quiet Hours"
                      description="Reduce notifications during 10 PM - 8 AM"
                    />
                  </div>
                </ModernCard>
              </motion.div>
            )}

            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <ModernCard variant="glow" className="p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Palette className="w-6 h-6 text-orange-500" />
                    Appearance & Display
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-4">Theme</label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'light', label: 'Light', icon: Sun },
                          { value: 'dark', label: 'Dark', icon: Moon },
                          { value: 'system', label: 'System', icon: Monitor }
                        ].map((theme) => (
                          <motion.button
                            key={theme.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleThemeChange(theme.value as any)}
                            className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${
                              settings.appearance.theme === theme.value
                                ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                                : 'border-white/30 dark:border-white/20 hover:border-purple-300 dark:hover:border-purple-400'
                            }`}
                          >
                            <theme.icon className="w-6 h-6" />
                            <span className="text-sm font-medium">{theme.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    <ToggleSwitch
                      enabled={settings.appearance.compact_mode}
                      onChange={(value) => updateSetting('appearance', 'compact_mode', value)}
                      label="Compact Mode"
                      description="Use a more condensed interface layout"
                    />
                    
                    <ToggleSwitch
                      enabled={settings.appearance.animations}
                      onChange={(value) => updateSetting('appearance', 'animations', value)}
                      label="Animations"
                      description="Enable smooth animations and transitions"
                    />
                  </div>
                </ModernCard>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <ModernCard variant="glow" className="p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Lock className="w-6 h-6 text-red-500" />
                    Security & Privacy
                  </h2>
                  
                  <div className="space-y-6">
                    <ToggleSwitch
                      enabled={settings.security.two_factor}
                      onChange={(value) => updateSetting('security', 'two_factor', value)}
                      label="Two-Factor Authentication"
                      description="Add an extra layer of security to your account"
                    />
                    
                    <ToggleSwitch
                      enabled={settings.security.login_notifications}
                      onChange={(value) => updateSetting('security', 'login_notifications', value)}
                      label="Login Notifications"
                      description="Get notified when someone logs into your account"
                    />
                    
                    <ToggleSwitch
                      enabled={settings.security.device_management}
                      onChange={(value) => updateSetting('security', 'device_management', value)}
                      label="Device Management"
                      description="Track and manage devices that access your account"
                    />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Session Timeout</p>
                        <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                      </div>
                      <select
                        value={settings.security.session_timeout}
                        onChange={(e) => updateSetting('security', 'session_timeout', e.target.value)}
                        className="p-2 rounded-lg bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 backdrop-blur-md text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="240">4 hours</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            )}

            {/* Billing Settings */}
            {activeSection === 'billing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <ModernCard variant="glow" className="p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-indigo-500" />
                    Billing & Subscription
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                          <h3 className="text-xl font-semibold text-foreground mb-2">Pro Plan</h3>
                          <p className="text-muted-foreground mb-4">
                            Full access to all features including AI chat, advanced analytics, and priority support.
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-foreground">$29</span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg">
                          <Download className="w-4 h-4 mr-2" />
                          Download Invoice
                        </Button>
                        <Button variant="outline" className="w-full">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Update Payment
                        </Button>
                      </div>
                    </div>
                    
                    <ToggleSwitch
                      enabled={settings.billing.auto_renew}
                      onChange={(value) => updateSetting('billing', 'auto_renew', value)}
                      label="Auto-Renewal"
                      description="Automatically renew your subscription"
                    />
                    
                    <ToggleSwitch
                      enabled={settings.billing.invoice_email}
                      onChange={(value) => updateSetting('billing', 'invoice_email', value)}
                      label="Invoice Emails"
                      description="Receive billing invoices via email"
                    />
                  </div>
                </ModernCard>
              </motion.div>
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <ModernCard variant="glow" className="p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-green-500" />
                    Privacy & Data
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Profile Visibility</p>
                        <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                      </div>
                      <select
                        value={settings.privacy.profile_visibility}
                        onChange={(e) => updateSetting('privacy', 'profile_visibility', e.target.value)}
                        className="p-2 rounded-lg bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 backdrop-blur-md text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      >
                        <option value="public">Public</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    
                    <ToggleSwitch
                      enabled={settings.privacy.analytics}
                      onChange={(value) => updateSetting('privacy', 'analytics', value)}
                      label="Analytics & Performance"
                      description="Help improve our service by sharing usage data"
                    />
                    
                    <ToggleSwitch
                      enabled={settings.privacy.cookies}
                      onChange={(value) => updateSetting('privacy', 'cookies', value)}
                      label="Analytics Cookies"
                      description="Allow cookies for analytics and personalization"
                    />
                    
                    <div className="pt-4 border-t border-white/20 dark:border-white/10">
                      <h4 className="font-semibold text-foreground mb-4">Data Management</h4>
                      <div className="flex gap-4">
                        <Button variant="outline" className="flex-1">
                          <Download className="w-4 h-4 mr-2" />
                          Export Data
                        </Button>
                        <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 