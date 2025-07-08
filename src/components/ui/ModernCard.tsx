import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glow' | 'minimal';
  hover?: boolean;
  animated?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  onClick?: () => void;
}

const variants = {
  default: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(16px) saturate(130%)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
  },
  gradient: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px) saturate(150%)',
    boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.15)',
  },
  glow: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(24px) saturate(180%)',
    boxShadow: '0 8px 32px 0 rgba(139, 92, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)',
  },
  minimal: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px) saturate(120%)',
    boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
  },
};

const roundedClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
};

export function ModernCard({
  children,
  className,
  variant = 'default',
  hover = true,
  animated = true,
  rounded = '2xl',
  onClick,
}: ModernCardProps) {
  const style = variants[variant];
  
  const Component = animated ? motion.div : 'div';
  
  const motionProps = animated ? {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { 
      duration: 0.4, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    },
    whileHover: hover ? {
      scale: 1.02,
      y: -4,
      transition: { duration: 0.2 }
    } : undefined,
    whileTap: onClick ? {
      scale: 0.98,
      transition: { duration: 0.1 }
    } : undefined,
  } : {};

  return (
    <Component
      className={cn(
        'relative overflow-hidden transition-all duration-300 group',
        roundedClasses[rounded],
        hover && 'hover:shadow-2xl',
        variant === 'glow' && 'hover:shadow-purple-500/20',
        onClick && 'cursor-pointer select-none',
        className
      )}
      style={{
        background: style.background,
        backdropFilter: style.backdropFilter,
        WebkitBackdropFilter: style.backdropFilter,
        border: style.border,
        boxShadow: style.boxShadow,
      }}
      onClick={onClick}
      {...(animated ? motionProps : {})}
    >
      {/* Ambient light effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5" />
      </div>
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-gradient-to-br from-gray-900 to-gray-600 mix-blend-multiply" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Border highlight */}
      <div className="absolute inset-0 rounded-inherit border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Component>
  );
} 