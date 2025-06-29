import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './button';
import { Card, CardContent } from './card';

export function ThemeSwitcher() {
  const { isDark, toggle, currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={toggle}
            className="p-2 bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm border-primary-200 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-700 transition-all duration-300"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 180 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-primary-600" />
              )}
            </motion.div>
          </Button>
        </motion.div>

        {/* Color Theme Selector */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm border-primary-200 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-700 transition-all duration-300"
            aria-label="Select color theme"
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Palette className="w-4 h-4" style={{ color: currentTheme.accent }} />
            </motion.div>
          </Button>
        </motion.div>
      </div>

      {/* Theme Selector Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full right-0 mt-2 z-50"
            >
              <Card className="w-64 bg-white/95 dark:bg-primary-800/95 backdrop-blur-md border-primary-200 dark:border-primary-700 shadow-xl">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-3">
                    Choose Theme
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {availableThemes.map((theme, index) => (
                      <motion.button
                        key={theme.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        onClick={() => {
                          setTheme(theme);
                          setIsOpen(false);
                        }}
                        className={`
                          relative p-3 rounded-lg border-2 transition-all duration-300 group
                          ${currentTheme.id === theme.id
                            ? 'border-current shadow-md'
                            : 'border-primary-200 dark:border-primary-700 hover:border-primary-300 dark:hover:border-primary-600'
                          }
                        `}
                        style={{ 
                          borderColor: currentTheme.id === theme.id ? theme.accent : undefined,
                          backgroundColor: currentTheme.id === theme.id ? `${theme.accent}10` : undefined
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-primary-900 dark:text-primary-100">
                            {theme.name}
                          </span>
                          {currentTheme.id === theme.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Check className="w-3 h-3" style={{ color: theme.accent }} />
                            </motion.div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <div
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: theme.accent }}
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-primary-200"
                            style={{ backgroundColor: theme.surface }}
                          />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}