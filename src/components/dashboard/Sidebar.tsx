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
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.path !== '/') {
      navigate(item.path);
    } else {
      onTabChange(item.id);
    }
  };

  return (
    <motion.nav 
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-64 bg-white dark:bg-primary-900 border-r border-primary-200 dark:border-primary-700 flex flex-col fixed left-0 top-0 h-screen z-40 theme-transition shadow-lg"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <header className="p-6 border-b border-primary-200 dark:border-primary-700 theme-transition">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${currentTheme.accent}20` }}
          >
            <Monitor className="w-6 h-6" style={{ color: currentTheme.accent }} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-primary-900 dark:text-primary-100 theme-transition">
            <span className="sr-only">LuminaWeb - Website Analysis Platform</span>
            LuminaWeb
          </h1>
        </div>
      </header>

      {/* Quick Actions */}
      <section className="p-4 border-b border-primary-200 dark:border-primary-700 theme-transition" aria-label="Quick actions">
        <Button
          size="sm"
          className="w-full mb-3 text-white theme-transition focus:ring-2 focus:ring-offset-2"
          style={{ backgroundColor: currentTheme.accent, '--tw-ring-color': currentTheme.accent } as React.CSSProperties}
          onClick={() => navigate('/analysis')}
          aria-label="Start new website analysis"
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Analyze Website
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search websites..."
            aria-label="Search through analyzed websites"
            className="w-full pl-10 pr-4 py-2 border border-primary-300 dark:border-primary-600 rounded-lg text-sm bg-white dark:bg-primary-800 text-primary-900 dark:text-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 theme-transition"
            style={{ '--tw-ring-color': currentTheme.accent } as React.CSSProperties}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
        </div>
      </section>

      {/* Navigation */}
      <motion.section 
        className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-300 dark:scrollbar-thumb-primary-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        aria-label="Main navigation menu"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
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
        </motion.div>
      </motion.section>

      {/* User Profile & Controls */}
      <motion.footer 
        className="p-4 border-t border-primary-200 dark:border-primary-700 theme-transition mt-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        aria-label="User account controls"
      >
        <motion.div 
          className="flex items-center gap-3 mb-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          role="img"
          aria-label={`User profile: ${user?.user_metadata?.name || user?.email?.split('@')[0]}`}
        >
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${currentTheme.accent}20` }}
            role="img"
            aria-label="User avatar"
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
        </motion.div>

        <motion.div 
          className="flex items-center gap-2 mb-3"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, duration: 0.2 }}
        >
          <ThemeSwitcher />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 theme-transition focus:ring-2 focus:ring-offset-2"
          style={{ '--tw-ring-color': currentTheme.accent } as React.CSSProperties}
          aria-label="Sign out of your account"
        >
          <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
          Logout
        </Button>
        </motion.div>
      </motion.footer>
    </motion.nav>
  );
}