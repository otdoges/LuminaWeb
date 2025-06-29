import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useTheme } from '../../context/ThemeContext';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
}

export function MetricsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'primary' 
}: MetricsCardProps) {
  const { currentTheme } = useTheme();

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'accent':
        return {
          bg: `${currentTheme.accent}15`,
          text: currentTheme.accent
        };
      case 'success':
        return {
          bg: '#10B98115',
          text: '#10B981'
        };
      case 'warning':
        return {
          bg: '#F59E0B15',
          text: '#F59E0B'
        };
      case 'error':
        return {
          bg: '#EF444415',
          text: '#EF4444'
        };
      default:
        return {
          bg: '#3B82F615',
          text: '#3B82F6'
        };
    }
  };

  const colorStyles = getColorClasses(color);

  return (
    <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 theme-transition">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-600 dark:text-primary-400 mb-1 theme-transition">
              {title}
            </p>
            <p className="text-2xl font-bold text-primary-900 dark:text-primary-100 theme-transition">
              {value}
            </p>
            {change !== undefined && (
              <p className={`text-sm mt-1 ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change >= 0 ? '+' : ''}{change}% from last month
              </p>
            )}
          </div>
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: colorStyles.bg }}
          >
            <Icon className="w-6 h-6" style={{ color: colorStyles.text }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}