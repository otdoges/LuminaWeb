import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Globe, 
  TrendingUp, 
  Shield, 
  Smartphone, 
  FileText,
  Users,
  Clock,
  Target,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AnalysisMetrics } from '../../types/analysis';

interface MetricsOverviewProps {
  metrics: AnalysisMetrics;
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const overviewCards = [
    {
      title: 'SEO Score',
      value: metrics.seo.score,
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      details: `${metrics.seo.metaTags} meta tags, ${metrics.seo.keywords.length} keywords`
    },
    {
      title: 'Performance',
      value: metrics.performance.score,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      details: `${metrics.performance.loadTime}s load time`
    },
    {
      title: 'Security',
      value: metrics.security.score,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      details: `${metrics.security.vulnerabilities.length} vulnerabilities found`
    },
    {
      title: 'Mobile Score',
      value: metrics.mobile.score,
      icon: Smartphone,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      details: metrics.mobile.responsive ? 'Responsive design' : 'Not responsive'
    },
    {
      title: 'Content Quality',
      value: metrics.content.score,
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900',
      details: `${metrics.content.wordCount} words, ${metrics.content.readabilityScore}% readable`
    },
    {
      title: 'Monthly Visitors',
      value: metrics.engagement.monthlyVisitors,
      icon: Users,
      color: 'text-accent-600',
      bgColor: 'bg-accent-100 dark:bg-accent-900',
      details: `${metrics.engagement.conversionRate}% conversion rate`,
      isNumber: true
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">
                      {card.title}
                    </p>
                    <p className={`text-2xl font-bold ${card.isNumber ? card.color : getScoreColor(card.value as number)}`}>
                      {card.isNumber ? formatNumber(card.value as number) : `${card.value}%`}
                    </p>
                    <p className="text-xs text-primary-500 dark:text-primary-400 mt-1">
                      {card.details}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'First Contentful Paint', value: `${metrics.performance.firstContentfulPaint}s`, target: '< 1.8s' },
                { label: 'Largest Contentful Paint', value: `${metrics.performance.largestContentfulPaint}s`, target: '< 2.5s' },
                { label: 'Cumulative Layout Shift', value: metrics.performance.cumulativeLayoutShift.toFixed(3), target: '< 0.1' },
                { label: 'Time to Interactive', value: `${metrics.performance.timeToInteractive}s`, target: '< 3.8s' }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between py-2 border-b border-primary-100 dark:border-primary-700 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
                      {metric.label}
                    </p>
                    <p className="text-xs text-primary-500 dark:text-primary-400">
                      Target: {metric.target}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary-900 dark:text-primary-100">
                    {metric.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              SEO Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{metrics.seo.internalLinks}</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">Internal Links</p>
                </div>
                <div className="text-center p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{metrics.seo.externalLinks}</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">External Links</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-900 dark:text-primary-100">Title Tag</span>
                  <span className="text-xs text-green-600">✓ Optimized</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-900 dark:text-primary-100">Meta Description</span>
                  <span className="text-xs text-green-600">✓ Present</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-900 dark:text-primary-100">Sitemap</span>
                  <span className={`text-xs ${metrics.seo.sitemap ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.seo.sitemap ? '✓ Found' : '✗ Missing'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-900 dark:text-primary-100">Robots.txt</span>
                  <span className={`text-xs ${metrics.seo.robotsTxt ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.seo.robotsTxt ? '✓ Found' : '✗ Missing'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-900 dark:text-primary-100">HTTPS Enabled</span>
                <span className={`text-xs ${metrics.security.httpsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.security.httpsEnabled ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-900 dark:text-primary-100">SSL Certificate</span>
                <span className={`text-xs ${metrics.security.sslCertificate ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.security.sslCertificate ? '✓ Valid' : '✗ Invalid'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-900 dark:text-primary-100">Security Headers</span>
                <span className="text-xs text-primary-600 dark:text-primary-400">
                  {metrics.security.securityHeaders}/10 implemented
                </span>
              </div>
              
              {metrics.security.vulnerabilities.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                      {metrics.security.vulnerabilities.length} Vulnerabilities Found
                    </span>
                  </div>
                  <div className="space-y-1">
                    {metrics.security.vulnerabilities.slice(0, 3).map((vuln, index) => (
                      <p key={index} className="text-xs text-red-700 dark:text-red-300">
                        • {vuln.type} ({vuln.severity})
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-600" />
              User Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                  <p className="text-2xl font-bold text-accent-600">{metrics.engagement.bounceRate}%</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">Bounce Rate</p>
                </div>
                <div className="text-center p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                  <p className="text-2xl font-bold text-accent-600">{metrics.engagement.avgSessionDuration}</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">Avg. Session</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary-900 dark:text-primary-100">Top Traffic Sources</h4>
                {metrics.engagement.trafficSources.slice(0, 3).map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <span className="text-sm text-primary-900 dark:text-primary-100 capitalize">
                      {source.source}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-primary-200 dark:bg-primary-700 rounded-full h-2">
                        <div 
                          className="bg-accent-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-primary-600 dark:text-primary-400 w-8">
                        {source.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}