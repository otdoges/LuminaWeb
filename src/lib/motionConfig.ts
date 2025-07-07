import { Transition, Spring, MotionValue } from 'framer-motion';

// Duration tokens for consistent timing across the app
export const durations = {
  instant: 0,
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  slowest: 1.2,
  micro: 0.1,
  quick: 0.2,
  medium: 0.4,
  long: 0.6,
} as const;

// Advanced easing functions
export const easings = {
  // CSS default easings
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  
  // Custom easings for sophisticated animations
  smooth: [0.25, 0.46, 0.45, 0.94],
  bounceIn: [0.68, -0.55, 0.265, 1.55],
  bounceOut: [0.34, 1.56, 0.64, 1],
  spring: [0.175, 0.885, 0.32, 1.275],
  
  // Advanced motion easings
  anticipate: [0.215, 0.61, 0.355, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
  circIn: [0.6, 0.04, 0.98, 0.335],
  circOut: [0.075, 0.82, 0.165, 1],
  circInOut: [0.785, 0.135, 0.15, 0.86],
  backIn: [0.6, -0.28, 0.735, 0.045],
  backOut: [0.175, 0.885, 0.32, 1.275],
  backInOut: [0.68, -0.55, 0.265, 1.55],
} as const;

// Enhanced spring configurations
export const springs = {
  // Gentle spring (good for subtle movements)
  gentle: {
    type: 'spring',
    stiffness: 120,
    damping: 14,
    mass: 0.8,
  } as Spring,
  
  // Default spring (balanced for most animations)
  default: {
    type: 'spring',
    stiffness: 180,
    damping: 20,
    mass: 1,
  } as Spring,
  
  // Bouncy spring (for playful animations)
  bouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 15,
    mass: 0.8,
  } as Spring,
  
  // Stiff spring (for quick, responsive animations)
  stiff: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
    mass: 0.5,
  } as Spring,
  
  // Slow spring (for heavy, deliberate movements)
  slow: {
    type: 'spring',
    stiffness: 80,
    damping: 20,
    mass: 2,
  } as Spring,
  
  // Smooth spring (for elegant transitions)
  smooth: {
    type: 'spring',
    stiffness: 200,
    damping: 30,
    mass: 1.2,
  } as Spring,
  
  // Responsive spring (for interactive elements)
  responsive: {
    type: 'spring',
    stiffness: 350,
    damping: 22,
    mass: 0.7,
  } as Spring,
  
  // Elastic spring (for attention-grabbing effects)
  elastic: {
    type: 'spring',
    stiffness: 250,
    damping: 12,
    mass: 1,
  } as Spring,
} as const;

// Enhanced predefined transitions
export const transitions = {
  // Spring-based transitions
  spring: springs.default,
  springGentle: springs.gentle,
  springBouncy: springs.bouncy,
  springStiff: springs.stiff,
  springSlow: springs.slow,
  springSmooth: springs.smooth,
  springResponsive: springs.responsive,
  springElastic: springs.elastic,
  
  // Tween-based transitions
  tween: {
    type: 'tween',
    duration: durations.normal,
    ease: easings.smooth,
  } as Transition,
  
  tweenFast: {
    type: 'tween',
    duration: durations.fast,
    ease: easings.easeOut,
  } as Transition,
  
  tweenSlow: {
    type: 'tween',
    duration: durations.slow,
    ease: easings.smooth,
  } as Transition,
  
  tweenElastic: {
    type: 'tween',
    duration: durations.medium,
    ease: easings.elastic,
  } as Transition,
  
  // Specialized transitions
  fade: {
    type: 'tween',
    duration: durations.normal,
    ease: easings.easeInOut,
  } as Transition,
  
  fadeFast: {
    type: 'tween',
    duration: durations.fast,
    ease: easings.easeOut,
  } as Transition,
  
  scale: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
    mass: 0.8,
  } as Transition,
  
  slide: {
    type: 'spring',
    stiffness: 180,
    damping: 25,
    mass: 1,
  } as Transition,
  
  // Micro-interactions
  hover: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
    mass: 0.5,
  } as Transition,
  
  tap: {
    type: 'spring',
    stiffness: 600,
    damping: 30,
    mass: 0.3,
  } as Transition,
  
  // Page transitions
  pageEnter: {
    type: 'spring',
    stiffness: 120,
    damping: 20,
    mass: 1,
  } as Transition,
  
  pageExit: {
    type: 'tween',
    duration: durations.fast,
    ease: easings.easeIn,
  } as Transition,
} as const;

// Enhanced animation variants for common patterns
export const variants = {
  // Fade variants
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  // Scale variants
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  },
  
  scaleUp: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
  },
  
  // Slide variants
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  },
  
  slideDown: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  },
  
  slideLeft: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },
  
  slideRight: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  },
  
  // Advanced combined variants
  scaleSpring: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: transitions.springBouncy,
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: transitions.tweenFast,
    },
  },
  
  // Card hover effects
  cardHover: {
    rest: { scale: 1, y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
    hover: { 
      scale: 1.02, 
      y: -2, 
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      transition: transitions.hover,
    },
  },
  
  // Button interactions
  button: {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  },
  
  // Text reveals
  textReveal: {
    initial: { y: 20, opacity: 0 },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.05,
        ...transitions.springGentle,
      },
    }),
  },
  
  // Loading animations
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
    },
  },
  
  spinner: {
    animate: {
      rotate: 360,
    },
  },
  
  // Progress animations
  progressBar: {
    initial: { scaleX: 0, originX: 0 },
    animate: { scaleX: 1 },
  },
  
  // Navigation animations
  nav: {
    closed: { x: '-100%' },
    open: { x: 0 },
  },
  
  navOverlay: {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  },
} as const;

// Enhanced stagger configuration
export const stagger = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
  slower: 0.2,
  micro: 0.03,
} as const;

// Performance optimization helpers
export const performanceConfig = {
  // Will-change optimization
  willChange: {
    transform: 'transform',
    opacity: 'opacity',
    auto: 'auto',
  },
  
  // GPU acceleration
  gpuAcceleration: {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    perspective: 1000,
  },
} as const;

// Reduced motion support
export const reducedMotionConfig = {
  respectsReducedMotion: true,
  fallback: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1 },
  },
} as const;

// Default motion configuration
export const defaultMotionConfig = {
  reducedMotion: 'user',
  transition: transitions.spring,
  layoutTransition: transitions.springGentle,
} as const;

// Helper function to create staggered children variants
export const createStaggerVariants = (
  staggerAmount: number = stagger.normal,
  childVariant = variants.fadeUp
) => ({
  container: {
    animate: {
      transition: {
        staggerChildren: staggerAmount,
        delayChildren: 0.1,
      },
    },
  },
  item: childVariant,
});

// Helper function to create responsive animations
export const createResponsiveVariant = (
  desktop: any,
  mobile: any
) => ({
  initial: mobile.initial || desktop.initial,
  animate: (isMobile: boolean) => isMobile ? mobile.animate : desktop.animate,
  exit: mobile.exit || desktop.exit,
});

// Advanced spring factory
export const createSpring = (
  stiffness: number = 180,
  damping: number = 20,
  mass: number = 1
): Spring => ({
  type: 'spring',
  stiffness,
  damping,
  mass,
});

// Advanced tween factory
export const createTween = (
  duration: number = durations.normal,
  ease: number[] | string = easings.smooth as any
): Transition => ({
  type: 'tween',
  duration,
  ease,
});

// Helper for scroll-triggered animations
export const createScrollVariant = (
  startOffset: number = 0,
  endOffset: number = 1
) => ({
  initial: { opacity: 0, y: 50 },
  whileInView: { 
    opacity: 1, 
    y: 0,
    transition: transitions.springGentle,
  },
  viewport: { 
    once: true, 
    amount: 0.3,
    margin: '-100px',
  },
});

// Complex animation sequences
export const sequences = {
  // Card reveal sequence
  cardReveal: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
        },
      },
    },
    item: {
      initial: { scale: 0.8, opacity: 0, y: 20 },
      animate: { 
        scale: 1, 
        opacity: 1, 
        y: 0,
        transition: transitions.springBouncy,
      },
    },
  },
  
  // Text typing effect
  typewriter: (text: string) => ({
    initial: { width: 0 },
    animate: { width: 'auto' },
    transition: {
      duration: text.length * 0.05,
      ease: 'linear',
    },
  }),
  
  // Morphing shapes
  morph: {
    initial: { pathLength: 0, pathOffset: 1 },
    animate: { pathLength: 1, pathOffset: 0 },
    transition: {
      pathLength: { duration: 2, ease: easings.easeInOut },
      pathOffset: { duration: 2, ease: easings.easeInOut },
    },
  },
};

// Export everything for easy access
export {
  variants as motionVariants,
  transitions as motionTransitions,
  springs as motionSprings,
  easings as motionEasings,
  durations as motionDurations,
};
