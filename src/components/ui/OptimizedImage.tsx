import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | string;
  blurDataURL?: string;
  quality?: number;
  formats?: ('webp' | 'avif' | 'jpeg' | 'png')[];
  sizes?: string;
  lazy?: boolean;
  fade?: boolean;
  aspectRatio?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
  skeleton?: boolean;
  progressive?: boolean;
}

interface ImageSource {
  src: string;
  type: string;
}

export const OptimizedImage = React.memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  quality = 75,
  formats = ['webp', 'jpeg'],
  sizes,
  lazy = true,
  fade = true,
  aspectRatio,
  objectFit = 'cover',
  className,
  onLoad,
  onError,
  skeleton = true,
  progressive = true,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [loadedSources, setLoadedSources] = useState<Set<string>>(new Set());
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate sources for different formats
  const generateSources = useCallback((baseSrc: string): ImageSource[] => {
    const sources: ImageSource[] = [];
    const baseUrl = baseSrc.split('.').slice(0, -1).join('.');
    const extension = baseSrc.split('.').pop()?.toLowerCase();

    formats.forEach(format => {
      if (format === 'avif') {
        sources.push({
          src: `${baseUrl}.avif`,
          type: 'image/avif'
        });
      } else if (format === 'webp') {
        sources.push({
          src: `${baseUrl}.webp`,
          type: 'image/webp'
        });
      } else if (format === extension) {
        sources.push({
          src: baseSrc,
          type: `image/${format}`
        });
      }
    });

    // Fallback to original
    if (!sources.some(s => s.src === baseSrc)) {
      sources.push({
        src: baseSrc,
        type: `image/${extension || 'jpeg'}`
      });
    }

    return sources;
  }, [formats]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { 
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  // Progressive image loading
  useEffect(() => {
    if (!isInView || hasError) return;

    const sources = generateSources(src);
    let cancelled = false;

    const loadImage = async (source: ImageSource): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          if (!cancelled && !loadedSources.has(source.src)) {
            setLoadedSources(prev => new Set(prev).add(source.src));
            setCurrentSrc(source.src);
            resolve(true);
          }
        };
        
        img.onerror = () => resolve(false);
        
        // Add quality parameter if supported
        if (source.src.includes('?')) {
          img.src = `${source.src}&q=${quality}`;
        } else {
          img.src = source.src;
        }
      });
    };

    const loadImagesSequentially = async () => {
      for (const source of sources) {
        if (cancelled) break;
        
        const loaded = await loadImage(source);
        if (loaded) {
          setIsLoaded(true);
          break;
        }
      }
      
      // If no images loaded, show error
      if (!cancelled && !currentSrc) {
        setHasError(true);
        onError?.();
      }
    };

    if (progressive) {
      loadImagesSequentially();
    } else {
      // Load all sources in parallel and use the first successful one
      Promise.all(sources.map(loadImage)).then(results => {
        if (!cancelled && results.some(Boolean)) {
          setIsLoaded(true);
        } else if (!cancelled) {
          setHasError(true);
          onError?.();
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [isInView, src, quality, progressive, hasError, loadedSources, generateSources, onError]);

  // Handle load completion
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Generate blur placeholder
  const getBlurDataURL = useCallback(() => {
    if (blurDataURL) return blurDataURL;
    if (placeholder === 'blur') {
      // Generate a simple base64 blur placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
    }
    return '';
  }, [blurDataURL, placeholder]);

  // Calculate container styles
  const containerStyles: React.CSSProperties = {
    aspectRatio: aspectRatio ? `${aspectRatio}` : width && height ? `${width}/${height}` : undefined,
    width: width ? `${width}px` : '100%',
    height: height && !aspectRatio ? `${height}px` : 'auto',
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        className
      )}
      style={containerStyles}
    >
      <AnimatePresence mode="wait">
        {!isInView ? (
          // Placeholder when not in view
          <motion.div
            key="placeholder"
            className="absolute inset-0 bg-muted flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {skeleton && (
              <div className="animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted w-full h-full" />
            )}
          </motion.div>
        ) : hasError ? (
          // Error state
          <motion.div
            key="error"
            className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 opacity-50">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-xs">Failed to load</p>
            </div>
          </motion.div>
        ) : (
          // Image content
          <div key="image" className="relative w-full h-full">
            {/* Blur placeholder */}
            {placeholder !== 'empty' && !isLoaded && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 1 }}
                animate={{ opacity: isLoaded ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {placeholder === 'blur' || blurDataURL ? (
                  <img
                    src={getBlurDataURL()}
                    alt=""
                    className={cn(
                      "w-full h-full object-cover filter blur-lg scale-110",
                      `object-${objectFit}`
                    )}
                    aria-hidden="true"
                  />
                ) : typeof placeholder === 'string' ? (
                  <img
                    src={placeholder}
                    alt=""
                    className={cn(
                      "w-full h-full",
                      `object-${objectFit}`
                    )}
                    aria-hidden="true"
                  />
                ) : (
                  <div className="w-full h-full bg-muted animate-pulse" />
                )}
              </motion.div>
            )}

            {/* Main image */}
            <motion.picture
              className="block w-full h-full"
              initial={fade ? { opacity: 0 } : {}}
              animate={fade ? { opacity: isLoaded ? 1 : 0 } : {}}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {generateSources(src).slice(0, -1).map((source) => (
                <source
                  key={source.type}
                  srcSet={source.src}
                  type={source.type}
                  sizes={sizes}
                />
              ))}
              <img
                ref={imgRef}
                src={currentSrc || src}
                alt={alt}
                width={width}
                height={height}
                className={cn(
                  "w-full h-full transition-opacity duration-300",
                  `object-${objectFit}`,
                  isLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                sizes={sizes}
                {...props}
              />
            </motion.picture>

            {/* Loading overlay */}
            {!isLoaded && !hasError && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-muted/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Specialized components
export const AvatarImage = React.memo<OptimizedImageProps>(({
  className,
  objectFit = 'cover',
  ...props
}) => (
  <OptimizedImage
    className={cn("rounded-full", className)}
    objectFit={objectFit}
    {...props}
  />
));

AvatarImage.displayName = 'AvatarImage';

export const HeroImage = React.memo<OptimizedImageProps>(({
  priority = true,
  quality = 90,
  formats = ['avif', 'webp', 'jpeg'],
  ...props
}) => (
  <OptimizedImage
    priority={priority}
    quality={quality}
    formats={formats}
    {...props}
  />
));

HeroImage.displayName = 'HeroImage';

export const ThumbnailImage = React.memo<OptimizedImageProps>(({
  quality = 60,
  lazy = true,
  ...props
}) => (
  <OptimizedImage
    quality={quality}
    lazy={lazy}
    {...props}
  />
));

ThumbnailImage.displayName = 'ThumbnailImage';

export default OptimizedImage; 