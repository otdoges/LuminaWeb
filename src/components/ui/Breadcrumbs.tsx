import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast?: boolean;
}

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/analysis': 'Website Analysis',
  '/chat': 'AI Assistant',
  '/auth': 'Sign In',
  '/settings': 'Settings',
  '/demo': 'Demo',
  '/playground': 'Playground',
  '/features': 'Features',
  '/pricing': 'Pricing',
  '/about': 'About',
  '/contact': 'Contact',
};

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];

  let currentPath = '';
  
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    const label = ROUTE_LABELS[currentPath] || path.charAt(0).toUpperCase() + path.slice(1);
    const isLast = index === paths.length - 1;
    
    breadcrumbs.push({
      label,
      href: currentPath,
      isLast
    });
  });

  return breadcrumbs;
}

function generateStructuredData(breadcrumbs: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.label,
      "item": `https://luminaweb.app${crumb.href}`
    }))
  };
}

interface BreadcrumbsProps {
  className?: string;
  customBreadcrumbs?: BreadcrumbItem[];
}

export function Breadcrumbs({ className = '', customBreadcrumbs }: BreadcrumbsProps) {
  const location = useLocation();
  const breadcrumbs = customBreadcrumbs || generateBreadcrumbs(location.pathname);

  // Update structured data
  useEffect(() => {
    if (breadcrumbs.length > 1) {
      const structuredData = generateStructuredData(breadcrumbs);
      
      // Remove existing breadcrumb structured data
      const existingScript = document.querySelector('script[type="application/ld+json"][data-breadcrumbs]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Add new structured data
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-breadcrumbs', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [breadcrumbs]);

  // Don't show breadcrumbs on home page
  if (location.pathname === '/' || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((crumb, index) => (
        <motion.div
          key={crumb.href}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center"
        >
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/60" />
          )}
          
          {crumb.isLast ? (
            <span 
              className="font-medium text-foreground"
              aria-current="page"
            >
              {index === 0 && <Home className="w-4 h-4 mr-1 inline" />}
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.href}
              className="hover:text-foreground transition-colors duration-200 flex items-center"
            >
              {index === 0 && <Home className="w-4 h-4 mr-1" />}
              {crumb.label}
            </Link>
          )}
        </motion.div>
      ))}
    </nav>
  );
}

// Hook for easy breadcrumb usage in components
export function useBreadcrumbs(customBreadcrumbs?: BreadcrumbItem[]) {
  const location = useLocation();
  const breadcrumbs = customBreadcrumbs || generateBreadcrumbs(location.pathname);
  
  useEffect(() => {
    if (breadcrumbs.length > 1) {
      const structuredData = generateStructuredData(breadcrumbs);
      
      const existingScript = document.querySelector('script[type="application/ld+json"][data-breadcrumbs]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-breadcrumbs', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [breadcrumbs]);
  
  return breadcrumbs;
}