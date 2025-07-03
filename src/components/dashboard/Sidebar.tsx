import React from 'react';
import { 
  Home, 
  Monitor, 
  BarChart3, 
  Settings, 
  Search, 
  Plus,
  LogOut,
  MessageSquare,
  Palette
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { VerticalNavigation } from '../ui/navigation';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { signOut, user } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'websites', label: 'Websites', icon: Monitor, path: '/' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analysis' },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, path: '/chat' },
    { id: 'demo', label: 'UI Showcase', icon: Palette, path: '/demo' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/' },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.path !== '/') {
      navigate(item.path);
    } else {
      onTabChange(item.id);
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-primary-900 border-r border-primary-200 dark:border-primary-700 flex flex-col h-full theme-transition">
      {/* Logo */}
      <div className="p-6 border-b border-primary-200 dark:border-primary-700 theme-transition">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${currentTheme.accent}20` }}
          >
            <Monitor className="w-6 h-6" style={{ color: currentTheme.accent }} />
          </div>
          <h1 className="text-xl font-bold text-primary-900 dark:text-primary-100 theme-transition">
            LuminaWeb
          </h1>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-primary-200 dark:border-primary-700 theme-transition">
        <Button
          size="sm"
          className="w-full mb-3 text-white theme-transition"
          style={{ backgroundColor: currentTheme.accent }}
          onClick={() => navigate('/analysis')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Analyze Website
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input
            type="text"
            placeholder="Search websites..."
            className="w-full pl-10 pr-4 py-2 border border-primary-300 dark:border-primary-600 rounded-lg text-sm bg-white dark:bg-primary-800 text-primary-900 dark:text-primary-100 focus:outline-none focus:ring-2 theme-transition"

          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <VerticalNavigation 
          items={menuItems.map(({ id, label, icon, path }) => ({
            id,
            label,
            icon,
            active: activeTab === id,
            onClick: () => handleMenuClick({ id, label, icon, path })
          }))}
          className="w-full"
        />
      </div>

      {/* User Profile & Controls */}
      <div className="p-4 border-t border-primary-200 dark:border-primary-700 theme-transition">
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${currentTheme.accent}20` }}
          >
            <span 
              className="font-medium"
              style={{ color: currentTheme.accent }}
            >
              {(user?.user_metadata?.name || user?.email)?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary-900 dark:text-primary-100 truncate theme-transition">
              {user?.user_metadata?.name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-primary-500 dark:text-primary-400 truncate theme-transition">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <ThemeSwitcher />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 theme-transition"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}