import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  color: 'primary' | 'success' | 'warning' | 'error' | 'accent';
  loading?: boolean;
  className?: string;
}

const colorMap = {
  primary: {
    bg: 'bg-primary-500',
    text: 'text-primary-600',
    light: 'bg-primary-50 dark:bg-primary-900/20',
    accent: 'bg-primary-500/10',
    border: 'border-primary-200 dark:border-primary-700'
  },
  success: {
    bg: 'bg-success-500',
    text: 'text-success-600',
    light: 'bg-success-50 dark:bg-success-900/20',
    accent: 'bg-success-500/10',
    border: 'border-success-200 dark:border-success-700'
  },
  warning: {
    bg: 'bg-warning-500',
    text: 'text-warning-600',
    light: 'bg-warning-50 dark:bg-warning-900/20',
    accent: 'bg-warning-500/10',
    border: 'border-warning-200 dark:border-warning-700'
  },
  error: {
    bg: 'bg-error-500',
    text: 'text-error-600',
    light: 'bg-error-50 dark:bg-error-900/20',
    accent: 'bg-error-500/10',
    border: 'border-error-200 dark:border-error-700'
  },
  accent: {
    bg: 'bg-accent-500',
    text: 'text-accent-600',
    light: 'bg-accent-50 dark:bg-accent-900/20',
    accent: 'bg-accent-500/10',
    border: 'border-accent-200 dark:border-accent-700'
  }
};

export function MetricsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  loading = false,
  className = ''
}: MetricsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl bg-white dark:bg-primary-800 p-6 shadow-lg border ${colors.border} ${className}`}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-500/10 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-accent-500/20 to-transparent rounded-full blur-xl" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-primary-600 dark:text-primary-400 theme-transition">
            {title}
          </p>
          <motion.div
            className={`p-2 rounded-lg ${colors.accent}`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Icon className={`w-5 h-5 ${colors.text} dark:text-white`} />
          </motion.div>
        </div>

        {/* Value */}
        <div className="mb-3">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-16 h-8 bg-primary-200 dark:bg-primary-700 rounded animate-pulse" />
              <motion.div
                className="w-2 h-2 bg-primary-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          ) : (
            <motion.p
              className="text-3xl font-bold text-primary-900 dark:text-primary-100 theme-transition"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {value}
            </motion.p>
          )}
        </div>

        {/* Change Indicator */}
        <div className="flex items-center space-x-2">
          <motion.div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              change >= 0 
                ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200' 
                : 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-200'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <motion.div
              animate={{ 
                y: change >= 0 ? [0, -2, 0] : [0, 2, 0],
                rotate: change >= 0 ? 0 : 180
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
            </motion.div>
            <span>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          </motion.div>
        </div>

        {/* Animated Progress Bar */}
        <div className="mt-4 h-1 bg-primary-100 dark:bg-primary-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${colors.bg} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.abs(change) * 2, 100)}%` }}
            transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0"
        whileHover={{ opacity: 1, x: ['-100%', '100%'] }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
}