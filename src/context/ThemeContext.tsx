import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ThemeState, ColorTheme } from '../types';

const ThemeContext = createContext<ThemeState | undefined>(undefined);

const colorThemes: ColorTheme[] = [
  {
    id: 'default',
    name: 'Default',
    primary: '#111315',
    accent: '#755c4c',
    background: '#ffffff',
    surface: '#f8f9fa',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    primary: '#0f172a',
    accent: '#0ea5e9',
    background: '#ffffff',
    surface: '#f0f9ff',
  },
  {
    id: 'forest',
    name: 'Forest',
    primary: '#14532d',
    accent: '#16a34a',
    background: '#ffffff',
    surface: '#f0fdf4',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    primary: '#7c2d12',
    accent: '#ea580c',
    background: '#ffffff',
    surface: '#fff7ed',
  },
  {
    id: 'purple',
    name: 'Purple',
    primary: '#581c87',
    accent: '#a855f7',
    background: '#ffffff',
    surface: '#faf5ff',
  },
  {
    id: 'rose',
    name: 'Rose',
    primary: '#881337',
    accent: '#e11d48',
    background: '#ffffff',
    surface: '#fff1f2',
  },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useLocalStorage('theme-dark', false);
  const [currentTheme, setCurrentTheme] = useLocalStorage<ColorTheme>(
    'color-theme',
    colorThemes[0]
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply dark mode class
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply color theme CSS variables with proper color conversion
    const applyColorVariable = (name: string, color: string) => {
      // Convert hex to RGB for CSS variables
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      root.style.setProperty(name, `${r} ${g} ${b}`);
    };

    // Apply theme colors
    applyColorVariable('--color-primary', currentTheme.primary);
    applyColorVariable('--color-accent', currentTheme.accent);
    applyColorVariable('--color-background', currentTheme.background);
    applyColorVariable('--color-surface', currentTheme.surface);

    // Apply direct color variables for components that need them
    root.style.setProperty('--theme-primary', currentTheme.primary);
    root.style.setProperty('--theme-accent', currentTheme.accent);
    root.style.setProperty('--theme-background', currentTheme.background);
    root.style.setProperty('--theme-surface', currentTheme.surface);

    // Update Tailwind CSS variables for proper integration
    root.style.setProperty('--tw-color-primary-900', currentTheme.primary);
    root.style.setProperty('--tw-color-accent-600', currentTheme.accent);

    // Add transition class for smooth theme changes
    root.classList.add('theme-transition');
    
    // Remove transition class after animation completes
    const timer = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);

    return () => clearTimeout(timer);
  }, [isDark, currentTheme]);

  const toggle = () => setIsDark(!isDark);
  
  const setTheme = (theme: ColorTheme) => setCurrentTheme(theme);

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      toggle, 
      currentTheme, 
      setTheme, 
      availableThemes: colorThemes 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}