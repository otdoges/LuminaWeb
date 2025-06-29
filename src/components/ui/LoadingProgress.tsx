import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingProgressProps {
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

export function LoadingProgress({ 
  duration = 2000, 
  onComplete, 
  className = '' 
}: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        return prev + (100 / (duration / 50));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className={`w-full bg-primary-200 dark:bg-primary-700 rounded-full h-1 overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-accent-500 to-accent-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      />
    </div>
  );
}