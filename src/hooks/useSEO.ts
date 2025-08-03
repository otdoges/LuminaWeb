import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: Record<string, any>;
}

const DEFAULT_SEO: SEOData = {
  title: 'LuminaWeb - Website Optimization Tool',
  description: 'Advanced website optimization tool with AI-powered insights, real-time analytics, performance monitoring, and comprehensive SEO analysis for developers and businesses.',
  keywords: 'website optimization, performance analysis, SEO tools, web analytics, lighthouse audit, page speed, core web vitals, ai insights',
  ogTitle: 'LuminaWeb - Website Optimization Tool',
  ogDescription: 'AI-powered website optimization with real-time analytics and performance insights.',
  ogImage: '/og-image.png',
  ogUrl: 'https://luminaweb.app',
  twitterTitle: 'LuminaWeb - Website Optimization Tool',
  twitterDescription: 'AI-powered website optimization with real-time analytics and performance insights.',
  twitterImage: '/og-image.png',
};

const ROUTE_SEO: Record<string, SEOData> = {
  '/': {
    title: 'LuminaWeb - AI-Powered Website Optimization Tool',
    description: 'Transform your website performance with LuminaWeb\'s AI-driven insights. Get real-time analytics, comprehensive SEO analysis, and actionable recommendations to boost your site\'s speed and user experience.',
    keywords: 'website optimization, AI analytics, performance monitoring, SEO analysis, core web vitals, lighthouse audit, page speed insights',
    ogTitle: 'LuminaWeb - AI-Powered Website Optimization Tool',
    ogDescription: 'Transform your website performance with AI-driven insights and real-time analytics.',
    twitterTitle: 'LuminaWeb - AI-Powered Website Optimization Tool',
    twitterDescription: 'Transform your website performance with AI-driven insights and real-time analytics.',
    canonical: 'https://luminaweb.app/',
  },
  '/auth': {
    title: 'Sign In - LuminaWeb',
    description: 'Sign in to LuminaWeb to access advanced website optimization tools, AI-powered insights, and comprehensive performance analytics.',
    keywords: 'login, sign in, authentication, website optimization account',
    ogTitle: 'Sign In - LuminaWeb',
    ogDescription: 'Access your LuminaWeb dashboard for website optimization and analytics.',
    twitterTitle: 'Sign In - LuminaWeb',
    twitterDescription: 'Access your LuminaWeb dashboard for website optimization and analytics.',
    canonical: 'https://luminaweb.app/auth',
    noindex: true,
  },
  '/dashboard': {
    title: 'Dashboard - LuminaWeb',
    description: 'Your website optimization dashboard with real-time performance metrics, AI insights, and actionable recommendations.',
    keywords: 'dashboard, website metrics, performance analytics, optimization insights',
    ogTitle: 'Performance Dashboard - LuminaWeb',
    ogDescription: 'Monitor your website performance with real-time metrics and AI-powered insights.',
    twitterTitle: 'Performance Dashboard - LuminaWeb',
    twitterDescription: 'Monitor your website performance with real-time metrics and AI-powered insights.',
    canonical: 'https://luminaweb.app/dashboard',
    noindex: true,
  },
  '/analysis': {
    title: 'Website Analysis - LuminaWeb',
    description: 'Comprehensive website analysis with AI-powered insights, performance monitoring, SEO audit, and optimization recommendations.',
    keywords: 'website analysis, SEO audit, performance analysis, lighthouse audit, core web vitals',
    ogTitle: 'AI-Powered Website Analysis - LuminaWeb',
    ogDescription: 'Get comprehensive website analysis with AI insights and optimization recommendations.',
    twitterTitle: 'AI-Powered Website Analysis - LuminaWeb',
    twitterDescription: 'Get comprehensive website analysis with AI insights and optimization recommendations.',
    canonical: 'https://luminaweb.app/analysis',
    noindex: true,
  },
  '/chat': {
    title: 'AI Chat Assistant - LuminaWeb',
    description: 'Chat with our AI assistant for personalized website optimization advice and real-time performance insights.',
    keywords: 'AI chat, website optimization assistant, performance advice, AI insights',
    ogTitle: 'AI Chat Assistant - LuminaWeb',
    ogDescription: 'Get personalized website optimization advice from our AI assistant.',
    twitterTitle: 'AI Chat Assistant - LuminaWeb',
    twitterDescription: 'Get personalized website optimization advice from our AI assistant.',
    canonical: 'https://luminaweb.app/chat',
    noindex: true,
  },
  '/features': {
    title: 'Features - LuminaWeb Website Optimization Tool',
    description: 'Discover LuminaWeb\'s powerful features: AI-powered insights, real-time analytics, comprehensive SEO analysis, performance monitoring, and optimization recommendations.',
    keywords: 'features, AI insights, real-time analytics, SEO analysis, performance monitoring, optimization tools',
    ogTitle: 'Features - LuminaWeb Website Optimization',
    ogDescription: 'Explore powerful website optimization features with AI insights and real-time analytics.',
    twitterTitle: 'Features - LuminaWeb Website Optimization',
    twitterDescription: 'Explore powerful website optimization features with AI insights and real-time analytics.',
    canonical: 'https://luminaweb.app/features',
  },
  '/pricing': {
    title: 'Pricing - LuminaWeb Website Optimization Tool',
    description: 'Choose the perfect LuminaWeb plan for your website optimization needs. Get started free with AI-powered insights and real-time analytics.',
    keywords: 'pricing, plans, website optimization pricing, AI analytics pricing, performance monitoring cost',
    ogTitle: 'Pricing Plans - LuminaWeb Website Optimization',
    ogDescription: 'Affordable website optimization plans with AI-powered insights and analytics.',
    twitterTitle: 'Pricing Plans - LuminaWeb Website Optimization',
    twitterDescription: 'Affordable website optimization plans with AI-powered insights and analytics.',
    canonical: 'https://luminaweb.app/pricing',
  },
  '/about': {
    title: 'About LuminaWeb - Website Optimization Experts',
    description: 'Learn about LuminaWeb\'s mission to revolutionize website optimization through AI-powered insights, advanced analytics, and actionable performance recommendations.',
    keywords: 'about, company, website optimization experts, AI technology, performance analytics',
    ogTitle: 'About LuminaWeb - Website Optimization Experts',
    ogDescription: 'Revolutionizing website optimization through AI-powered insights and advanced analytics.',
    twitterTitle: 'About LuminaWeb - Website Optimization Experts',
    twitterDescription: 'Revolutionizing website optimization through AI-powered insights and advanced analytics.',
    canonical: 'https://luminaweb.app/about',
  },
  '/contact': {
    title: 'Contact LuminaWeb - Get Website Optimization Support',
    description: 'Get in touch with LuminaWeb for website optimization support, feature requests, or business inquiries. We\'re here to help improve your website performance.',
    keywords: 'contact, support, website optimization help, business inquiries, technical support',
    ogTitle: 'Contact LuminaWeb - Website Optimization Support',
    ogDescription: 'Get expert support for your website optimization needs and performance challenges.',
    twitterTitle: 'Contact LuminaWeb - Website Optimization Support',
    twitterDescription: 'Get expert support for your website optimization needs and performance challenges.',
    canonical: 'https://luminaweb.app/contact',
  },
};

function updateMetaTag(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let element = document.querySelector(selector) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    if (property) {
      element.setAttribute('property', name);
    } else {
      element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateTitle(title: string) {
  document.title = title;
  
  // Update og:title
  updateMetaTag('og:title', title, true);
  updateMetaTag('twitter:title', title);
}

function updateCanonical(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  
  canonical.setAttribute('href', url);
}

function updateStructuredData(data: Record<string, any>) {
  const existingScript = document.querySelector('script[type="application/ld+json"][data-dynamic]');
  if (existingScript) {
    existingScript.remove();
  }
  
  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.setAttribute('data-dynamic', 'true');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function useSEO(customSEO?: SEOData) {
  const location = useLocation();
  
  useEffect(() => {
    const routeSEO = ROUTE_SEO[location.pathname] || {};
    const seoData = { ...DEFAULT_SEO, ...routeSEO, ...customSEO };
    
    // Update title
    if (seoData.title) {
      updateTitle(seoData.title);
    }
    
    // Update meta tags
    if (seoData.description) {
      updateMetaTag('description', seoData.description);
      updateMetaTag('og:description', seoData.ogDescription || seoData.description, true);
      updateMetaTag('twitter:description', seoData.twitterDescription || seoData.description);
    }
    
    if (seoData.keywords) {
      updateMetaTag('keywords', seoData.keywords);
    }
    
    if (seoData.ogImage) {
      updateMetaTag('og:image', seoData.ogImage, true);
      updateMetaTag('twitter:image', seoData.twitterImage || seoData.ogImage);
    }
    
    if (seoData.ogUrl) {
      updateMetaTag('og:url', seoData.ogUrl, true);
    }
    
    // Update canonical URL
    if (seoData.canonical) {
      updateCanonical(seoData.canonical);
    }
    
    // Handle noindex
    if (seoData.noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }
    
    // Update structured data if provided
    if (seoData.structuredData) {
      updateStructuredData(seoData.structuredData);
    }
    
    // Update og:url with current URL
    const currentUrl = `https://luminaweb.app${location.pathname}`;
    updateMetaTag('og:url', currentUrl, true);
    
  }, [location.pathname, customSEO]);
}

// Utility function for components to set SEO data
export function setSEO(seoData: SEOData) {
  return seoData;
}

// Pre-defined structured data templates
export const structuredDataTemplates = {
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "LuminaWeb",
    "description": "Advanced website optimization tool with AI-powered insights",
    "url": "https://luminaweb.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://luminaweb.app/analysis?url={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },
  softwareApplication: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "LuminaWeb",
    "description": "Advanced website optimization tool with AI-powered insights and real-time analytics",
    "url": "https://luminaweb.app",
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "LuminaWeb"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    }
  }
};