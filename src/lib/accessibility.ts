/**
 * Accessibility utilities for WCAG compliance
 */

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Check if contrast ratio meets WCAG AA standards
export function meetsWCAGAA(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5; // WCAG AA requires 4.5:1 for normal text
}

// Check if contrast ratio meets WCAG AA standards for large text
export function meetsWCAGAALarge(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 3; // WCAG AA requires 3:1 for large text
}

// Check if contrast ratio meets WCAG AAA standards
export function meetsWCAGAAA(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 7; // WCAG AAA requires 7:1 for normal text
}

// Generate accessible color alternatives
export function getAccessibleColor(
  baseColor: string, 
  backgroundColor: string, 
  targetRatio: number = 4.5
): string {
  const baseRgb = hexToRgb(baseColor);
  const bgRgb = hexToRgb(backgroundColor);
  
  if (!baseRgb || !bgRgb) return baseColor;
  
  // Try darkening first
  for (let factor = 0; factor <= 1; factor += 0.05) {
    const adjustedColor = rgbToHex(
      Math.round(baseRgb.r * (1 - factor)),
      Math.round(baseRgb.g * (1 - factor)),
      Math.round(baseRgb.b * (1 - factor))
    );
    
    if (getContrastRatio(adjustedColor, backgroundColor) >= targetRatio) {
      return adjustedColor;
    }
  }
  
  // Try lightening if darkening didn't work
  for (let factor = 0; factor <= 1; factor += 0.05) {
    const adjustedColor = rgbToHex(
      Math.min(255, Math.round(baseRgb.r + (255 - baseRgb.r) * factor)),
      Math.min(255, Math.round(baseRgb.g + (255 - baseRgb.g) * factor)),
      Math.min(255, Math.round(baseRgb.b + (255 - baseRgb.b) * factor))
    );
    
    if (getContrastRatio(adjustedColor, backgroundColor) >= targetRatio) {
      return adjustedColor;
    }
  }
  
  return baseColor; // Return original if no adjustment works
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

// Keyboard navigation utilities
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  function handleTabKey(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
    
    if (e.key === 'Escape') {
      element.blur();
    }
  }
  
  element.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => element.removeEventListener('keydown', handleTabKey);
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Focus management utilities
export function manageFocus() {
  let lastFocusedElement: HTMLElement | null = null;
  
  return {
    save: () => {
      lastFocusedElement = document.activeElement as HTMLElement;
    },
    restore: () => {
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    },
    setFocus: (element: HTMLElement) => {
      element.focus();
    }
  };
}