import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Globe, 
  TrendingUp, 
  Shield, 
  Smartphone, 
  FileText,
  Download,
  Share2,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/Input';
import { WebsiteAnalysis, AnalysisMetrics } from '../../types/analysis';
import { AnalysisChart } from './AnalysisChart';
import { MetricsOverview } from './MetricsOverview';
import { CompetitorComparison } from './CompetitorComparison';
import { TrafficAnalysis } from './TrafficAnalysis';

interface AnalysisDashboardProps {
  analyses: WebsiteAnalysis[];
  onRefresh: () => void;
  onExport: (format: string) => void;
}

export function AnalysisDashboard({ analyses, onRefresh, onExport }: AnalysisDashboardProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (analyses.length > 0 && !selectedAnalysis) {
      setSelectedAnalysis(analyses[0]);
    }
  }, [analyses, selectedAnalysis]);

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || analysis.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'traffic', label: 'Traffic', icon: BarChart3 },
    { id: 'competitors', label: 'Competitors', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
            Website Analysis Dashboard
          </h1>
          <p className="text-primary-600 dark:text-primary-400">
            Comprehensive insights and performance metrics for your websites
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onRefresh} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => onExport('pdf')} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Website List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analyzed Websites</CardTitle>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
                  <Input
                    placeholder="Search websites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="analyzing">Analyzing</option>
                  <option value="pending">Pending</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredAnalyses.map((analysis, index) => (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      p-4 border-b border-primary-200 dark:border-primary-700 cursor-pointer transition-all duration-200
                      ${selectedAnalysis?.id === analysis.id 
                        ? 'bg-accent-50 dark:bg-accent-900/20 border-l-4 border-l-accent-600' 
                        : 'hover:bg-primary-50 dark:hover:bg-primary-700'
                      }
                    `}
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-primary-900 dark:text-primary-100 truncate">
                        {analysis.name}
                      </h4>
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${analysis.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          analysis.status === 'analyzing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          analysis.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }
                      `}>
                        {analysis.status}
                      </span>
                    </div>
                    <p className="text-sm text-primary-600 dark:text-primary-400 truncate">
                      {analysis.url}
                    </p>
                    {analysis.status === 'completed' && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-primary-200 dark:bg-primary-700 rounded-full h-1">
                          <div 
                            className="bg-accent-600 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${analysis.metrics.performance.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-primary-600 dark:text-primary-400">
                          {analysis.metrics.performance.score}%
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedAnalysis ? (
            <div className="space-y-6">
              {/* Website Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                        {selectedAnalysis.name}
                      </h2>
                      <p className="text-primary-600 dark:text-primary-400">
                        {selectedAnalysis.url}
                      </p>
                      <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">
                        Last analyzed: {selectedAnalysis.completedAt?.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-accent-600">
                        {selectedAnalysis.metrics.performance.score}%
                      </div>
                      <p className="text-sm text-primary-600 dark:text-primary-400">
                        Overall Score
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <div className="border-b border-primary-200 dark:border-primary-700">
                <nav className="flex space-x-8 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200
                        ${activeTab === tab.id
                          ? 'border-accent-600 text-accent-600'
                          : 'border-transparent text-primary-500 hover:text-primary-700 hover:border-primary-300'
                        }
                      `}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && (
                  <MetricsOverview metrics={selectedAnalysis.metrics} />
                )}
                {activeTab === 'performance' && (
                  <AnalysisChart 
                    data={selectedAnalysis.metrics.performance} 
                    type="performance"
                  />
                )}
                {activeTab === 'traffic' && (
                  <TrafficAnalysis engagement={selectedAnalysis.metrics.engagement} />
                )}
                {activeTab === 'competitors' && (
                  <CompetitorComparison 
                    currentSite={selectedAnalysis}
                    competitors={[]} // Would be populated with competitor data
                  />
                )}
                {/* Add other tab content components as needed */}
              </motion.div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Globe className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-2">
                  No Website Selected
                </h3>
                <p className="text-primary-600 dark:text-primary-400">
                  Select a website from the sidebar to view its analysis results.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}