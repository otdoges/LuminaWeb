import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { WebsiteAnalysis, CompetitorData } from '../../types/analysis';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CompetitorComparisonProps {
  currentSite: WebsiteAnalysis;
  competitors: CompetitorData[];
}

export function CompetitorComparison({ currentSite, competitors }: CompetitorComparisonProps) {
  // Mock competitor data for demonstration
  const mockCompetitors: CompetitorData[] = [
    {
      url: 'competitor1.com',
      name: 'Competitor 1',
      metrics: {
        seo: { score: 78 },
        performance: { score: 85 },
        security: { score: 92 },
        mobile: { score: 88 },
        content: { score: 82 },
        engagement: { 
          monthlyVisitors: 180000,
          conversionRate: 3.2,
          bounceRate: 38
        }
      }
    },
    {
      url: 'competitor2.com',
      name: 'Competitor 2',
      metrics: {
        seo: { score: 82 },
        performance: { score: 79 },
        security: { score: 88 },
        mobile: { score: 91 },
        content: { score: 85 },
        engagement: { 
          monthlyVisitors: 220000,
          conversionRate: 2.8,
          bounceRate: 42
        }
      }
    },
    {
      url: 'competitor3.com',
      name: 'Competitor 3',
      metrics: {
        seo: { score: 75 },
        performance: { score: 88 },
        security: { score: 85 },
        mobile: { score: 86 },
        content: { score: 79 },
        engagement: { 
          monthlyVisitors: 150000,
          conversionRate: 3.8,
          bounceRate: 35
        }
      }
    }
  ];

  const allCompetitors = competitors.length > 0 ? competitors : mockCompetitors;

  // Prepare radar chart data
  const radarData = [
    {
      metric: 'SEO',
      'Your Site': currentSite.metrics.seo.score,
      ...allCompetitors.reduce((acc, comp, index) => ({
        ...acc,
        [`Competitor ${index + 1}`]: comp.metrics.seo?.score || 0
      }), {})
    },
    {
      metric: 'Performance',
      'Your Site': currentSite.metrics.performance.score,
      ...allCompetitors.reduce((acc, comp, index) => ({
        ...acc,
        [`Competitor ${index + 1}`]: comp.metrics.performance?.score || 0
      }), {})
    },
    {
      metric: 'Security',
      'Your Site': currentSite.metrics.security.score,
      ...allCompetitors.reduce((acc, comp, index) => ({
        ...acc,
        [`Competitor ${index + 1}`]: comp.metrics.security?.score || 0
      }), {})
    },
    {
      metric: 'Mobile',
      'Your Site': currentSite.metrics.mobile.score,
      ...allCompetitors.reduce((acc, comp, index) => ({
        ...acc,
        [`Competitor ${index + 1}`]: comp.metrics.mobile?.score || 0
      }), {})
    },
    {
      metric: 'Content',
      'Your Site': currentSite.metrics.content.score,
      ...allCompetitors.reduce((acc, comp, index) => ({
        ...acc,
        [`Competitor ${index + 1}`]: comp.metrics.content?.score || 0
      }), {})
    }
  ];

  // Prepare traffic comparison data
  const trafficData = [
    {
      name: 'Your Site',
      visitors: currentSite.metrics.engagement.monthlyVisitors,
      conversionRate: currentSite.metrics.engagement.conversionRate,
      bounceRate: currentSite.metrics.engagement.bounceRate
    },
    ...allCompetitors.map((comp, index) => ({
      name: `Competitor ${index + 1}`,
      visitors: comp.metrics.engagement?.monthlyVisitors || 0,
      conversionRate: comp.metrics.engagement?.conversionRate || 0,
      bounceRate: comp.metrics.engagement?.bounceRate || 0
    }))
  ];

  const getComparisonIcon = (yourValue: number, competitorValue: number) => {
    if (yourValue > competitorValue) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (yourValue < competitorValue) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Overall Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Your Site"
                  dataKey="Your Site"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                {allCompetitors.map((_, index) => (
                  <Radar
                    key={index}
                    name={`Competitor ${index + 1}`}
                    dataKey={`Competitor ${index + 1}`}
                    stroke={COLORS[index + 1]}
                    fill={COLORS[index + 1]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic & Engagement Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  className="text-primary-600 dark:text-primary-400"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="visitors"
                  className="text-primary-600 dark:text-primary-400"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="rate"
                  orientation="right"
                  className="text-primary-600 dark:text-primary-400"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--tw-color-white)',
                    border: '1px solid var(--tw-color-primary-200)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar yAxisId="visitors" dataKey="visitors" fill="#3B82F6" name="Monthly Visitors" />
                <Bar yAxisId="rate" dataKey="conversionRate" fill="#10B981" name="Conversion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary-200 dark:border-primary-700">
                  <th className="text-left py-3 px-4 font-medium text-primary-900 dark:text-primary-100">
                    Metric
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-primary-900 dark:text-primary-100">
                    Your Site
                  </th>
                  {allCompetitors.map((comp, index) => (
                    <th key={index} className="text-left py-3 px-4 font-medium text-primary-900 dark:text-primary-100">
                      Competitor {index + 1}
                    </th>
                  ))}
                  <th className="text-left py-3 px-4 font-medium text-primary-900 dark:text-primary-100">
                    Ranking
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { 
                    metric: 'SEO Score', 
                    yourValue: currentSite.metrics.seo.score,
                    competitorValues: allCompetitors.map(c => c.metrics.seo?.score || 0),
                    format: (val: number) => `${val}%`
                  },
                  { 
                    metric: 'Performance Score', 
                    yourValue: currentSite.metrics.performance.score,
                    competitorValues: allCompetitors.map(c => c.metrics.performance?.score || 0),
                    format: (val: number) => `${val}%`
                  },
                  { 
                    metric: 'Monthly Visitors', 
                    yourValue: currentSite.metrics.engagement.monthlyVisitors,
                    competitorValues: allCompetitors.map(c => c.metrics.engagement?.monthlyVisitors || 0),
                    format: (val: number) => val.toLocaleString()
                  },
                  { 
                    metric: 'Conversion Rate', 
                    yourValue: currentSite.metrics.engagement.conversionRate,
                    competitorValues: allCompetitors.map(c => c.metrics.engagement?.conversionRate || 0),
                    format: (val: number) => `${val}%`
                  },
                  { 
                    metric: 'Bounce Rate', 
                    yourValue: currentSite.metrics.engagement.bounceRate,
                    competitorValues: allCompetitors.map(c => c.metrics.engagement?.bounceRate || 0),
                    format: (val: number) => `${val}%`,
                    lowerIsBetter: true
                  }
                ].map((row, index) => {
                  const allValues = [row.yourValue, ...row.competitorValues];
                  const sortedValues = [...allValues].sort((a, b) => row.lowerIsBetter ? a - b : b - a);
                  const yourRank = sortedValues.indexOf(row.yourValue) + 1;
                  
                  return (
                    <tr key={index} className="border-b border-primary-100 dark:border-primary-800">
                      <td className="py-3 px-4 text-primary-900 dark:text-primary-100 font-medium">
                        {row.metric}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-600">
                          {row.format(row.yourValue)}
                        </span>
                      </td>
                      {row.competitorValues.map((value, compIndex) => (
                        <td key={compIndex} className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-primary-900 dark:text-primary-100">
                              {row.format(value)}
                            </span>
                            {getComparisonIcon(
                              row.lowerIsBetter ? value : row.yourValue,
                              row.lowerIsBetter ? row.yourValue : value
                            )}
                          </div>
                        </td>
                      ))}
                      <td className="py-3 px-4">
                        <span className={`
                          px-2 py-1 text-xs rounded-full font-medium
                          ${yourRank === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            yourRank <= 2 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }
                        `}>
                          #{yourRank} of {allValues.length}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Competitive Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Competitive Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Your Strengths
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  {currentSite.metrics.performance.score > 85 && (
                    <li>• Excellent performance optimization</li>
                  )}
                  {currentSite.metrics.security.score > 90 && (
                    <li>• Strong security implementation</li>
                  )}
                  {currentSite.metrics.engagement.conversionRate > 3 && (
                    <li>• Above-average conversion rate</li>
                  )}
                </ul>
              </div>
              
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Areas for Improvement
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {currentSite.metrics.seo.score < 80 && (
                    <li>• SEO optimization needs attention</li>
                  )}
                  {currentSite.metrics.engagement.bounceRate > 40 && (
                    <li>• High bounce rate compared to competitors</li>
                  )}
                  {currentSite.metrics.mobile.score < 85 && (
                    <li>• Mobile experience could be improved</li>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Strategic Recommendations
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Focus on SEO improvements to match top competitor performance</li>
                <li>• Analyze competitor content strategies for engagement optimization</li>
                <li>• Consider A/B testing conversion funnel improvements</li>
                <li>• Monitor competitor security practices and implement best practices</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}