import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Theme types and interfaces
type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'blue' | 'green' | 'purple' | 'custom';

interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

interface ThemeConfig {
  theme: Theme;
  colorScheme: ColorScheme;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  customColors?: Partial<ThemeColors>;
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'sm' | 'base' | 'lg';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

interface ThemeContextType {
  config: ThemeConfig;
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setCustomColors: (colors: Partial<ThemeColors>) => void;
  toggleAnimations: () => void;
  toggleHighContrast: () => void;
  setFontSize: (size: 'sm' | 'base' | 'lg') => void;
  setBorderRadius: (radius: 'none' | 'sm' | 'md' | 'lg' | 'xl') => void;
  currentColors: ThemeColors;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
  effectiveTheme: 'light' | 'dark';
}

// Default theme configurations
const DEFAULT_THEME_COLORS = {
  blue: {
    light: {
      primary: '221.2 83.2% 53.3%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 84% 4.9%',
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      accent: '210 40% 96%',
      accentForeground: '222.2 84% 4.9%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '221.2 83.2% 53.3%',
      chart1: '221.2 83.2% 53.3%',
      chart2: '142.1 76.2% 36.3%',
      chart3: '38.3 100% 59.2%',
      chart4: '343.3 96.4% 68.4%',
      chart5: '271.5 91.2% 65.1%'
    },
    dark: {
      primary: '217.2 91.2% 59.8%',
      primaryForeground: '222.2 84% 4.9%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '224.3 76.3% 48%',
      chart1: '220 70% 50%',
      chart2: '160 60% 45%',
      chart3: '30 80% 55%',
      chart4: '340 75% 55%',
      chart5: '270 70% 50%'
    }
  },
  green: {
    light: {
      primary: '142.1 76.2% 36.3%',
      primaryForeground: '355.7 100% 97.3%',
      secondary: '138.5 76.5% 96.7%',
      secondaryForeground: '142.1 84.2% 4.9%',
      background: '0 0% 100%',
      foreground: '142.1 84.2% 4.9%',
      muted: '138.5 76.5% 96.7%',
      mutedForeground: '142.1 16.3% 46.9%',
      accent: '138.5 76.5% 96.7%',
      accentForeground: '142.1 84.2% 4.9%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      border: '138.5 31.8% 91.4%',
      input: '138.5 31.8% 91.4%',
      ring: '142.1 76.2% 36.3%',
      chart1: '142.1 76.2% 36.3%',
      chart2: '221.2 83.2% 53.3%',
      chart3: '38.3 100% 59.2%',
      chart4: '343.3 96.4% 68.4%',
      chart5: '271.5 91.2% 65.1%'
    },
    dark: {
      primary: '142.1 76.2% 36.3%',
      primaryForeground: '355.7 100% 97.3%',
      secondary: '142.1 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      background: '142.1 84.2% 4.9%',
      foreground: '210 40% 98%',
      muted: '142.1 32.6% 17.5%',
      mutedForeground: '142.1 20.2% 65.1%',
      accent: '142.1 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '142.1 32.6% 17.5%',
      input: '142.1 32.6% 17.5%',
      ring: '142.1 76.2% 36.3%',
      chart1: '160 60% 45%',
      chart2: '220 70% 50%',
      chart3: '30 80% 55%',
      chart4: '340 75% 55%',
      chart5: '270 70% 50%'
    }
  },
  purple: {
    light: {
      primary: '271.5 91.2% 65.1%',
      primaryForeground: '210 40% 98%',
      secondary: '270 40% 96%',
      secondaryForeground: '271.5 84% 4.9%',
      background: '0 0% 100%',
      foreground: '271.5 84% 4.9%',
      muted: '270 40% 96%',
      mutedForeground: '271.5 16.3% 46.9%',
      accent: '270 40% 96%',
      accentForeground: '271.5 84% 4.9%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      border: '270 31.8% 91.4%',
      input: '270 31.8% 91.4%',
      ring: '271.5 91.2% 65.1%',
      chart1: '271.5 91.2% 65.1%',
      chart2: '142.1 76.2% 36.3%',
      chart3: '38.3 100% 59.2%',
      chart4: '343.3 96.4% 68.4%',
      chart5: '221.2 83.2% 53.3%'
    },
    dark: {
      primary: '271.5 91.2% 65.1%',
      primaryForeground: '210 40% 98%',
      secondary: '271.5 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      background: '271.5 84% 4.9%',
      foreground: '210 40% 98%',
      muted: '271.5 32.6% 17.5%',
      mutedForeground: '271.5 20.2% 65.1%',
      accent: '271.5 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '271.5 32.6% 17.5%',
      input: '271.5 32.6% 17.5%',
      ring: '271.5 91.2% 65.1%',
      chart1: '270 70% 50%',
      chart2: '160 60% 45%',
      chart3: '30 80% 55%',
      chart4: '340 75% 55%',
      chart5: '220 70% 50%'
    }
  }
} as const;

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Get system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Get user's motion preference
const getMotionPreference = (): boolean => {
  if (typeof window !== 'undefined') {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return true;
};

// Apply CSS variables for theme
const applyCSSVariables = (colors: ThemeColors, config: ThemeConfig) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });

    // Apply font size
    const fontSizes = {
      sm: '14px',
      base: '16px',
      lg: '18px'
    };
    root.style.setProperty('--font-size-base', fontSizes[config.fontSize]);

    // Apply border radius
    const borderRadii = {
      none: '0px',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    };
    root.style.setProperty('--radius', borderRadii[config.borderRadius]);

    // Apply motion preferences
    if (config.reducedMotion) {
      root.style.setProperty('--motion-duration', '0ms');
      root.style.setProperty('--motion-scale', '1');
    } else {
      root.style.setProperty('--motion-duration', '150ms');
      root.style.setProperty('--motion-scale', '0.95');
    }

    // Apply high contrast if needed
    if (config.highContrast) {
      root.style.setProperty('--contrast-multiplier', '1.5');
    } else {
      root.style.setProperty('--contrast-multiplier', '1');
    }
  }
};

// Theme transition component
const ThemeTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="theme-transition"
    >
      {children}
    </motion.div>
  );
};

// Theme provider component
export const ThemeProvider = ({
  children,
  defaultTheme = 'system',
  defaultColorScheme = 'blue'
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColorScheme?: ColorScheme;
}) => {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    // Load saved preferences
    const savedConfig = typeof window !== 'undefined' 
      ? localStorage.getItem('theme-config')
      : null;

    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch {
        // Fall back to defaults
      }
    }

    return {
      theme: defaultTheme,
      colorScheme: defaultColorScheme,
      colors: DEFAULT_THEME_COLORS[defaultColorScheme as keyof typeof DEFAULT_THEME_COLORS],
      animations: getMotionPreference(),
      reducedMotion: !getMotionPreference(),
      highContrast: false,
      fontSize: 'base' as const,
      borderRadius: 'md' as const
    };
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

  // Determine effective theme
  const effectiveTheme = config.theme === 'system' ? systemTheme : config.theme;
  const currentColors = {
    ...config.colors[effectiveTheme],
    ...config.customColors
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setSystemTheme(getSystemTheme());
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      setConfig(prev => ({
        ...prev,
        animations: !mediaQuery.matches,
        reducedMotion: mediaQuery.matches
      }));
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme changes
  useEffect(() => {
    applyCSSVariables(currentColors, config);
    
    // Update document class
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(effectiveTheme);
    
    // Save to localStorage
    localStorage.setItem('theme-config', JSON.stringify(config));
  }, [config, currentColors, effectiveTheme]);

  // Theme manipulation functions
  const setTheme = useCallback((theme: Theme) => {
    setConfig(prev => ({ ...prev, theme }));
  }, []);

  const setColorScheme = useCallback((colorScheme: ColorScheme) => {
    if (colorScheme === 'custom') return;
    
    const themeColors = DEFAULT_THEME_COLORS[colorScheme as keyof typeof DEFAULT_THEME_COLORS];
    if (themeColors) {
      setConfig(prev => ({
        ...prev,
        colorScheme,
        colors: themeColors
      }));
    }
  }, []);

  const setCustomColors = useCallback((customColors: Partial<ThemeColors>) => {
    setConfig(prev => ({
      ...prev,
      colorScheme: 'custom',
      customColors
    }));
  }, []);

  const toggleAnimations = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      animations: !prev.animations,
      reducedMotion: !prev.reducedMotion
    }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setConfig(prev => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const setFontSize = useCallback((fontSize: 'sm' | 'base' | 'lg') => {
    setConfig(prev => ({ ...prev, fontSize }));
  }, []);

  const setBorderRadius = useCallback((borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl') => {
    setConfig(prev => ({ ...prev, borderRadius }));
  }, []);

  const contextValue: ThemeContextType = {
    config,
    setTheme,
    setColorScheme,
    setCustomColors,
    toggleAnimations,
    toggleHighContrast,
    setFontSize,
    setBorderRadius,
    currentColors,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light',
    isSystem: config.theme === 'system',
    effectiveTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeTransition>
        {children}
      </ThemeTransition>
    </ThemeContext.Provider>
  );
};

// Theme customizer component
export const ThemeCustomizer = () => {
  const {
    config,
    setTheme,
    setColorScheme,
    toggleAnimations,
    toggleHighContrast,
    setFontSize,
    setBorderRadius,
    isDark,
    isLight,
    isSystem
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V5zM21 15a2 2 0 00-2-2h-4a2 2 0 00-2 2v2a2 2 0 002 2h4a2 2 0 002-2v-2z" />
        </svg>
      </motion.button>

      {/* Customizer panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="absolute right-0 top-0 h-full w-80 bg-background border-l border-border p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Theme Customizer</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md hover:bg-muted"
                  >
                    ×
                  </button>
                </div>

                {/* Theme selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'dark', 'system'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setTheme(theme)}
                        className={`p-2 rounded-md border text-sm capitalize ${
                          config.theme === theme
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color scheme */}
                <div>
                  <label className="block text-sm font-medium mb-3">Color Scheme</label>
                  <div className="space-y-2">
                    {Object.keys(DEFAULT_THEME_COLORS).map((scheme) => (
                      <button
                        key={scheme}
                        onClick={() => setColorScheme(scheme as ColorScheme)}
                        className={`w-full p-3 rounded-md border text-left capitalize ${
                          config.colorScheme === scheme
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: `hsl(${DEFAULT_THEME_COLORS[scheme as keyof typeof DEFAULT_THEME_COLORS].light.primary})`
                            }}
                          />
                          {scheme}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font size */}
                <div>
                  <label className="block text-sm font-medium mb-3">Font Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['sm', 'base', 'lg'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`p-2 rounded-md border text-sm ${
                          config.fontSize === size
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        {size === 'sm' ? 'Small' : size === 'base' ? 'Normal' : 'Large'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border radius */}
                <div>
                  <label className="block text-sm font-medium mb-3">Border Radius</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((radius) => (
                      <button
                        key={radius}
                        onClick={() => setBorderRadius(radius)}
                        className={`p-2 rounded-md border text-sm capitalize ${
                          config.borderRadius === radius
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        {radius === 'none' ? 'None' : radius.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Animations</label>
                    <button
                      onClick={toggleAnimations}
                      className={`w-11 h-6 rounded-full border-2 transition-colors ${
                        config.animations
                          ? 'bg-primary border-primary'
                          : 'bg-background border-border'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          config.animations ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">High Contrast</label>
                    <button
                      onClick={toggleHighContrast}
                      className={`w-11 h-6 rounded-full border-2 transition-colors ${
                        config.highContrast
                          ? 'bg-primary border-primary'
                          : 'bg-background border-border'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          config.highContrast ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemeProvider; 