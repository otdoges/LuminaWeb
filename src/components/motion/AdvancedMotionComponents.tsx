import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, MotionValue } from 'framer-motion';
import { 
  variants, 
  transitions, 
  sequences, 
  createScrollVariant, 
  createStaggerVariants,
  performanceConfig,
  reducedMotionConfig
} from '../../lib/motionConfig';

// Advanced Card Component with sophisticated hover effects
export function AdvancedCard({ children, className = '', ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  [key: string]: any;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg ${className}`}
      variants={variants.cardHover}
      initial="rest"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        ...performanceConfig.gpuAcceleration,
        willChange: performanceConfig.willChange.transform,
      }}
      {...props}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={transitions.hover}
      />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '200%' : '-100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// Magnetic Button Component
export function MagneticButton({ 
  children, 
  className = '', 
  strength = 0.3,
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string; 
  strength?: number;
  [key: string]: any;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    setMousePosition({ x: deltaX, y: deltaY });
  };
  
  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };
  
  return (
    <motion.button
      ref={buttonRef}
      className={`relative px-6 py-3 rounded-lg font-medium transition-all duration-200 ${className}`}
      variants={variants.button}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: mousePosition.x,
        y: mousePosition.y,
      }}
      transition={transitions.springResponsive}
      style={{
        ...performanceConfig.gpuAcceleration,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Text Reveal Component with staggered animation
export function TextReveal({ 
  text, 
  className = '',
  staggerDelay = 0.02,
  splitBy = 'word' 
}: { 
  text: string; 
  className?: string;
  staggerDelay?: number;
  splitBy?: 'word' | 'char';
}) {
  const words = splitBy === 'word' ? text.split(' ') : text.split('');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };
  
  const childVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: transitions.springGentle,
    },
  };
  
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className={splitBy === 'word' ? 'inline-block mr-2' : 'inline-block'}
          variants={childVariants}
        >
          {word}
          {splitBy === 'word' && index < words.length - 1 && ' '}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Scroll-triggered parallax component
export function ParallaxSection({ 
  children, 
  offset = 50,
  className = '' 
}: { 
  children: React.ReactNode; 
  offset?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y }}
    >
      {children}
    </motion.div>
  );
}

// Advanced Loading Component
export function AdvancedLoading({ 
  type = 'pulse',
  size = 'md',
  className = '' 
}: { 
  type?: 'pulse' | 'spinner' | 'dots' | 'wave';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <motion.div
            className={`rounded-full border-2 border-current border-t-transparent ${sizeClasses[size]}`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        );
        
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-current rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        );
        
      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-current rounded-full"
                animate={{
                  height: ['10px', '20px', '10px'],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        );
        
      default: // pulse
        return (
          <motion.div
            className={`bg-current rounded-full ${sizeClasses[size]}`}
            variants={variants.pulse}
            animate="animate"
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
    }
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {renderLoader()}
    </div>
  );
}

// Morphing Icon Component
export function MorphingIcon({ 
  icons, 
  currentIndex = 0,
  className = '',
  size = 24 
}: { 
  icons: React.ComponentType<any>[];
  currentIndex?: number;
  className?: string;
  size?: number;
}) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <AnimatePresence mode="wait">
        {icons.map((Icon, index) => (
          index === currentIndex && (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={transitions.springElastic}
            >
              <Icon size={size} />
            </motion.div>
          )
        ))}
      </AnimatePresence>
    </div>
  );
}

// Progressive Image Loader with blur effect
export function ProgressiveImage({ 
  src, 
  alt, 
  className = '',
  blurDataURL,
  ...props 
}: { 
  src: string;
  alt: string;
  className?: string;
  blurDataURL?: string;
  [key: string]: any;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <motion.img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-105"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded ? 0 : 1 }}
          transition={transitions.fade}
        />
      )}
      
      {/* Actual image */}
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0,
          scale: isLoaded ? 1 : 1.05,
        }}
        transition={transitions.springGentle}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
        {...props}
      />
      
      {/* Loading state */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <AdvancedLoading type="pulse" size="md" />
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500">
          Failed to load image
        </div>
      )}
    </div>
  );
}

// Floating Action Button with tooltip
export function FloatingActionButton({ 
  icon: Icon,
  tooltip,
  onClick,
  className = '',
  position = 'bottom-right' 
}: {
  icon: React.ComponentType<any>;
  tooltip?: string;
  onClick?: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };
  
  return (
    <motion.div
      className={`fixed z-50 ${positionClasses[position]} ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={transitions.springBouncy}
    >
      <MagneticButton
        className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        strength={0.2}
      >
        <Icon size={24} />
      </MagneticButton>
      
      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && showTooltip && (
          <motion.div
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={transitions.springFast}
          >
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 