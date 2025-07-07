import React, { ReactNode } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig } from 'framer-motion';
import { defaultMotionConfig } from '../../lib/motionConfig';

interface MotionLayoutProps {
  children: ReactNode;
  // Enable AnimatePresence for exit animations
  enableExitAnimations?: boolean;
  // AnimatePresence mode for controlling animation behavior
  mode?: 'sync' | 'wait' | 'popLayout';
  // Enable layout animations for this section
  enableLayoutAnimations?: boolean;
  // Layout group ID for isolated layout animations
  layoutId?: string;
  // Custom motion config overrides
  motionConfig?: Parameters<typeof MotionConfig>[0]['transition'];
  // Reduce motion preference
  reducedMotion?: 'always' | 'never' | 'user';
}

export const MotionLayout: React.FC<MotionLayoutProps> = ({
  children,
  enableExitAnimations = true,
  mode = 'sync',
  enableLayoutAnimations = true,
  layoutId,
  motionConfig = defaultMotionConfig.transition,
  reducedMotion = defaultMotionConfig.reducedMotion,
}) => {
  // Wrap content in MotionConfig for consistent animations
  let content = (
    <MotionConfig
      transition={motionConfig}
      reducedMotion={reducedMotion}
    >
      {children}
    </MotionConfig>
  );

  // Add layout group if layout animations are enabled
  if (enableLayoutAnimations) {
    content = (
      <LayoutGroup id={layoutId}>
        {content}
      </LayoutGroup>
    );
  }

  // Add AnimatePresence if exit animations are enabled
  if (enableExitAnimations) {
    content = (
      <AnimatePresence mode={mode}>
        {content}
      </AnimatePresence>
    );
  }

  return content;
};

// Specialized motion layouts for common use cases
export const PageMotionLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <MotionLayout
    enableExitAnimations
    mode="wait"
    enableLayoutAnimations
    layoutId="page"
  >
    {children}
  </MotionLayout>
);

export const ListMotionLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <MotionLayout
    enableExitAnimations
    mode="popLayout"
    enableLayoutAnimations
    layoutId="list"
  >
    {children}
  </MotionLayout>
);

export const ModalMotionLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <MotionLayout
    enableExitAnimations
    mode="sync"
    enableLayoutAnimations={false}
  >
    {children}
  </MotionLayout>
);
