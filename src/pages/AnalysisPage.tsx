import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Clock, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AnalysisWizard } from '../components/analysis/AnalysisWizard';
import { AnalysisDashboard } from '../components/analysis/AnalysisDashboard';
import { WebsiteAnalysis, AnalysisSettings, AnalysisMetrics } from '../types/analysis';

export function AnalysisPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [analyses, setAnalyses] = useState<WebsiteAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data generation
  const generateMockMetrics = (url: string): AnalysisMetrics => {
    const baseScore = 70 + Math.random() * 25; // 70-95 range
    
    return {
      seo: {
        score: Math.round(baseScore + (Math.random() - 0.5) * 10),
        title: `${url} - Professional Website`,
        description: `Comprehensive analysis of ${url} performance and optimization`,
        keywords: ['business', 'professional', 'services', 'quality'],
        metaTags: Math.floor(Math.random() * 15) + 10,
        headingStructure: Math.floor(Math.random() * 5) + 8,
        internalLinks: Math.floor(Math.random() * 50) + 25,
        externalLinks: Math.floor(Math.random() * 20) + 5,
        imageAlt: Math.floor(Math.random() * 30) + 15,
        sitemap: Math.random() > 0.3,
        robotsTxt: Math.random() > 0.2
      },
      performance: {
        score: Math.round(baseScore + (Math.random() - 0.5) * 15),
        loadTime: 1.5 + Math.random() * 3,
        firstContentfulPaint: 0.8 + Math.random() * 1.5,
        largestContentfulPaint: 1.2 + Math.random() * 2,
        cumulativeLayoutShift: Math.random() * 0.2,
        firstInputDelay: Math.random() * 200,
        totalBlockingTime: Math.random() * 500,
        speedIndex: 1000 + Math.random() * 2000,
        timeToInteractive: 2 + Math.random() * 3
      },
      engagement: {
        monthlyVisitors: Math.floor(Math.random() * 200000) + 50000,
        conversionRate: 2 + Math.random() * 3,
        bounceRate: 25 + Math.random() * 25,
        avgSessionDuration: `${Math.floor(Math.random() * 3) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        pageViews: Math.floor(Math.random() * 500000) + 100000,
        uniqueVisitors: Math.floor(Math.random() * 150000) + 40000,
        returnVisitors: Math.floor(Math.random() * 50000) + 15000,
        topPages: [
          { url: '/', title: 'Home Page', views: 15000, bounceRate: 35, avgTime: '2:45' },
          { url: '/products', title: 'Products', views: 12000, bounceRate: 28, avgTime: '3:20' },
          { url: '/about', title: 'About Us', views: 8500, bounceRate: 42, avgTime: '1:55' },
          { url: '/contact', title: 'Contact', views: 6200, bounceRate: 25, avgTime: '1:30' }
        ],
        trafficSources: [
          { source: 'organic', percentage: 45, visitors: 22500 },
          { source: 'direct', percentage: 25, visitors: 12500 },
          { source: 'social', percentage: 15, visitors: 7500 },
          { source: 'paid', percentage: 10, visitors: 5000 },
          { source: 'referral', percentage: 5, visitors: 2500 }
        ],
        demographics: {
          ageGroups: [
            { range: '18-24', percentage: 15 },
            { range: '25-34', percentage: 35 },
            { range: '35-44', percentage: 25 },
            { range: '45-54', percentage: 15 },
            { range: '55+', percentage: 10 }
          ],
          gender: { male: 52, female: 46, other: 2 },
          locations: [
            { country: 'United States', percentage: 45 },
            { country: 'Canada', percentage: 20 },
            { country: 'United Kingdom', percentage: 15 },
            { country: 'Australia', percentage: 10 },
            { country: 'Germany', percentage: 10 }
          ],
          devices: { desktop: 60, mobile: 35, tablet: 5 }
        }
      },
      security: {
        score: Math.round(baseScore + (Math.random() - 0.5) * 10),
        httpsEnabled: Math.random() > 0.1,
        sslCertificate: Math.random() > 0.15,
        securityHeaders: Math.floor(Math.random() * 8) + 5,
        vulnerabilities: Math.random() > 0.7 ? [
          {
            type: 'Missing Security Headers',
            severity: 'medium' as const,
            description: 'Some security headers are missing',
            recommendation: 'Implement Content Security Policy and X-Frame-Options headers'
          }
        ] : [],
        malwareDetected: Math.random() > 0.95,
        privacyPolicy: Math.random() > 0.2,
        cookiePolicy: Math.random() > 0.3
      },
      mobile: {
        score: Math.round(baseScore + (Math.random() - 0.5) * 12),
        responsive: Math.random() > 0.1,
        mobileSpeed: Math.round(baseScore + (Math.random() - 0.5) * 15),
        touchTargets: Math.floor(Math.random() * 8) + 7,
        viewportConfig: Math.random() > 0.15,
        mobileUsability: Math.round(baseScore + (Math.random() - 0.5) * 10)
      },
      content: {
        score: Math.round(baseScore + (Math.random() - 0.5) * 8),
        readabilityScore: Math.round(60 + Math.random() * 35),
        wordCount: Math.floor(Math.random() * 2000) + 500,
        duplicateContent: Math.floor(Math.random() * 5),
        brokenLinks: Math.floor(Math.random() * 8),
        imageOptimization: Math.round(70 + Math.random() * 25),
        contentFreshness: Math.round(60 + Math.random() * 35)
      }
    };
  };

  const handleStartAnalysis = async (urls: string[], settings: AnalysisSettings) => {
    setShowWizard(false);
    setIsLoading(true);

    // Create analysis entries
    const newAnalyses: WebsiteAnalysis[] = urls.map(url => ({
      id: Math.random().toString(36).substr(2, 9),
      url,
      name: url.replace(/^https?:\/\//, '').replace(/^www\./, ''),
      status: 'analyzing' as const,
      createdAt: new Date(),
      metrics: generateMockMetrics(url),
      settings
    }));

    setAnalyses(prev => [...prev, ...newAnalyses]);

    // Simulate analysis process
    for (let i = 0; i < newAnalyses.length; i++) {
      setTimeout(() => {
        setAnalyses(prev => prev.map(analysis => 
          analysis.id === newAnalyses[i].id 
            ? { ...analysis, status: 'completed' as const, completedAt: new Date() }
            : analysis
        ));
      }, (i + 1) * 2000); // Stagger completion
    }

    setIsLoading(false);
  };

  const handleRefresh = () => {
    // Refresh logic here
    console.log('Refreshing analyses...');
  };

  const handleExport = (format: string) => {
    // Export logic here
    console.log(`Exporting in ${format} format...`);
  };

  // Load sample data on mount
  useEffect(() => {
    const sampleAnalysis: WebsiteAnalysis = {
      id: 'sample-1',
      url: 'acme-electronics.com',
      name: 'ACME Electronics',
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      completedAt: new Date(Date.now() - 86000000), // Completed shortly after
      metrics: generateMockMetrics('acme-electronics.com'),
      settings: {
        parameters: [
          { id: 'seo', name: 'SEO Metrics', enabled: true, weight: 1 },
          { id: 'performance', name: 'Performance Analytics', enabled: true, weight: 1 },
          { id: 'engagement', name: 'User Engagement Statistics', enabled: true, weight: 1 },
          { id: 'security', name: 'Security Analysis', enabled: true, weight: 1 }
        ],
        trafficSources: ['organic', 'paid', 'social'],
        conversionTracking: true,
        customerJourney: true,
        heatmapVisualization: false,
        abTesting: false,
        customKPIs: [],
        reportFormat: 'pdf',
        scheduledReports: false,
        reportFrequency: 'weekly'
      }
    };

    setAnalyses([sampleAnalysis]);
  }, []);

  if (analyses.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 dark:bg-primary-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <Card>
            <CardContent className="p-12">
              <FileText className="w-16 h-16 text-primary-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-4">
                Welcome to Website Analysis
              </h2>
              <p className="text-primary-600 dark:text-primary-400 mb-8">
                Get comprehensive insights into your website's performance, SEO, security, and user engagement.
              </p>
              <Button onClick={() => setShowWizard(true)} size="lg" className="w-full">
                <Plus className="w-5 h-5 mr-2" />
                Start New Analysis
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {showWizard && (
          <AnalysisWizard
            onComplete={handleStartAnalysis}
            onCancel={() => setShowWizard(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
              Website Analysis
            </h1>
            <p className="text-primary-600 dark:text-primary-400">
              Comprehensive website performance and optimization insights
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowWizard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </div>

        {/* Analysis Dashboard */}
        <AnalysisDashboard
          analyses={analyses}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />

        {/* Analysis Wizard Modal */}
        {showWizard && (
          <AnalysisWizard
            onComplete={handleStartAnalysis}
            onCancel={() => setShowWizard(false)}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
            <Card>
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-accent-600 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-primary-900 dark:text-primary-100 font-medium">
                  Starting website analysis...
                </p>
                <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">
                  This may take a few minutes
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}