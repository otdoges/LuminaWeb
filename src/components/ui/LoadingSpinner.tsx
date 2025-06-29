import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClasses[size]} ${className}`} />
  );
}

export function LoadingOverlay({ children }: { children?: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-primary-800 rounded-lg p-6 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" className="text-accent-600" />
        {children && <p className="text-primary-600 dark:text-primary-300">{children}</p>}
      </div>
    </div>
  );
}