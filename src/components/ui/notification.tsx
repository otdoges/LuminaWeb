import React, { createContext, useContext, useState, useCallback } from 'react';
import { LucideIcon, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  icon?: LucideIcon;
  duration?: number;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }[];
}

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const getIcon = () => {
    if (notification.icon) {
      return notification.icon;
    }
    
    switch (notification.type) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getGradientColors = () => {
    switch (notification.type) {
      case 'success': return 'from-green-400 to-emerald-500';
      case 'error': return 'from-red-400 to-rose-500';
      case 'warning': return 'from-amber-400 to-orange-500';
      case 'info': return 'from-cyan-400 to-blue-500';
      default: return 'from-cyan-400 to-blue-500';
    }
  };

  const Icon = getIcon();

  return (
    <div className="rounded-2xl border border-border/30 dark:border-white/20 bg-border/10 dark:bg-white/10 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r",
          getGradientColors()
        )}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-inter font-normal tracking-tighter text-sm mb-1">
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => onDismiss(notification.id)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 -mt-1 -mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex gap-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={cn(
                    "text-xs rounded-xl px-3 py-1 transition-all duration-300 hover:scale-105 active:scale-95",
                    action.variant === 'primary'
                      ? "bg-border/20 dark:bg-white/20 backdrop-blur-md border border-border/40 dark:border-white/30 hover:bg-border/30 dark:hover:bg-white/30"
                      : "bg-transparent hover:bg-border/10 dark:hover:bg-white/10"
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
} 