import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}

interface HorizontalNavigationProps {
  items: NavigationItem[];
  className?: string;
}

export function HorizontalNavigation({ items, className }: HorizontalNavigationProps) {
  return (
    <nav className={cn(
      "flex items-center space-x-1 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-2 shadow-xl",
      className
    )}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-inter tracking-tighter transition-all duration-300 hover:scale-105 active:scale-95",
              item.active
                ? "bg-white/30 backdrop-blur-md text-foreground shadow-lg"
                : "text-muted-foreground hover:bg-white/10"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

interface VerticalNavigationProps {
  items: NavigationItem[];
  className?: string;
}

export function VerticalNavigation({ items, className }: VerticalNavigationProps) {
  return (
    <nav className={cn(
      "flex flex-col space-y-1 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-3 shadow-xl w-48",
      className
    )}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-inter tracking-tighter transition-all duration-300 hover:scale-105 active:scale-95",
              item.active
                ? "bg-white/30 backdrop-blur-md text-foreground shadow-lg"
                : "text-muted-foreground hover:bg-white/10"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
} 