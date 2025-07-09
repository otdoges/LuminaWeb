import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LoadingOverlayProps {
  children?: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({ children, className }: LoadingOverlayProps) {
  return (
    <div className={cn("fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center", className)}>
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 mx-auto">
            <motion.div
              className="absolute inset-0 border-4 border-accent/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 border-t-4 border-accent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
        {children && (
          <motion.p
            className="text-lg font-medium text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {children}
          </motion.p>
        )}
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <motion.div
        className="absolute inset-0 border-2 border-accent/20 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 border-t-2 border-accent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted";
  
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              "h-4 rounded",
              i === lines - 1 ? "w-3/4" : "w-full",
              className
            )}
            style={{ width: i === lines - 1 ? '75%' : width, height }}
          />
        ))}
      </div>
    );
  }

  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'h-4 rounded'
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
    />
  );
}

interface CardSkeletonProps {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

export function CardSkeleton({ className, showAvatar = false, lines = 3 }: CardSkeletonProps) {
  return (
    <div className={cn("p-6 space-y-4", className)}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <Skeleton variant="circular" width={40} height={40} />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
      </div>
      <Skeleton variant="text" lines={lines} />
      <div className="flex space-x-2">
        <Skeleton width={80} height={32} className="rounded-full" />
        <Skeleton width={100} height={32} className="rounded-full" />
      </div>
    </div>
  );
}

interface ChartSkeletonProps {
  className?: string;
  height?: number;
}

export function ChartSkeleton({ className, height = 200 }: ChartSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <Skeleton width={120} height={24} />
        <Skeleton width={80} height={32} className="rounded-full" />
      </div>
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end justify-between space-x-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="bg-gradient-to-t from-muted via-muted/50 to-muted rounded-t"
              style={{ 
                height: `${Math.random() * 80 + 20}%`,
                width: 'calc(100% / 12 - 4px)'
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ 
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  variant?: 'default' | 'gradient' | 'striped';
}

export function Progress({ 
  value, 
  max = 100, 
  className, 
  showValue = false,
  variant = 'default'
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variantClasses = {
    default: 'bg-accent',
    gradient: 'bg-gradient-to-r from-accent to-primary',
    striped: 'bg-accent bg-gradient-to-r from-transparent via-background/20 to-transparent bg-[length:20px_20px]'
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-sm mb-1">
        <span>Progress</span>
        {showValue && <span>{Math.round(percentage)}%</span>}
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className={cn("h-full transition-all duration-500", variantClasses[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

interface PulseProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export function Pulse({ children, className, duration = 2 }: PulseProps) {
  return (
    <motion.div
      className={className}
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {children}
    </motion.div>
  );
}

export { LoadingOverlay as default };