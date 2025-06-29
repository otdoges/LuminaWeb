import React from 'react';
import { Plus, Camera, BarChart, Settings, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { useTheme } from '../../context/ThemeContext';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const { currentTheme } = useTheme();

  const actions = [
    {
      id: 'analyze',
      label: 'Analyze Website',
      description: 'Get comprehensive performance insights',
      icon: BarChart,
      color: '#3B82F6',
    },
    {
      id: 'screenshot',
      label: 'Take Screenshot',
      description: 'Capture visual snapshot of any website',
      icon: Camera,
      color: '#10B981',
    },
    {
      id: 'optimize',
      label: 'Quick Optimize',
      description: 'Get instant optimization suggestions',
      icon: Zap,
      color: '#F59E0B',
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Configure your preferences',
      icon: Settings,
      color: currentTheme.accent,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg theme-transition"
            onClick={() => onAction(action.id)}
          >
            <CardContent className="p-6 text-center">
              <div 
                className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <action.icon className="w-6 h-6" style={{ color: action.color }} />
              </div>
              <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2 theme-transition">
                {action.label}
              </h3>
              <p className="text-sm text-primary-600 dark:text-primary-400 theme-transition">
                {action.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}