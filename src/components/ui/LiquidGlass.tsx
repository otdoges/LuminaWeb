import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'subtle' | 'bold' | 'frosted' | 'card' | 'button' | 'panel';
  hover?: boolean;
  glow?: boolean;
  animated?: boolean;
  border?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onClick?: () => void;
}

const variants = {
  subtle: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(8px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
  },
  bold: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px) saturate(150%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  },
  frosted: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(40px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.15)',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px) saturate(140%)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 6px 24px 0 rgba(0, 0, 0, 0.12)',
  },
  button: {
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(16px) saturate(130%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
  },
  panel: {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(24px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 8px 28px 0 rgba(0, 0, 0, 0.08)',
  },
};

const roundedClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md', 
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export function LiquidGlass({
  children,
  className,
  variant = 'subtle',
  hover = false,
  glow = false,
  animated = true,
  border = true,
  rounded = 'lg',
  onClick,
}: LiquidGlassProps) {
  const style = variants[variant];
  
  const Component = motion.div;
  
  const motionProps = animated ? {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { 
      duration: 0.4, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    },
    whileHover: hover ? {
      scale: 1.02,
      y: -2,
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
        'relative overflow-hidden transition-all duration-300',
        roundedClasses[rounded],
        hover && 'hover:shadow-2xl hover:scale-[1.01]',
        glow && 'shadow-[0_0_40px_rgba(117,92,76,0.3)]',
        onClick && 'cursor-pointer select-none',
        className
      )}
      style={{
        background: style.background,
        backdropFilter: style.backdropFilter,
        WebkitBackdropFilter: style.backdropFilter,
        border: border ? style.border : 'none',
        boxShadow: style.boxShadow,
      }}
      onClick={onClick}
      {...motionProps}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none" />
      
      {/* Content with proper z-index */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Animated glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ borderRadius: 'inherit' }}
        />
      )}
    </Component>
  );
} 