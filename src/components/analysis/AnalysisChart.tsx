import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PerformanceMetrics } from '../../types/analysis';

interface AnalysisChartProps {
  data: PerformanceMetrics;
  type: 'performance' | 'seo' | 'security';
}

export function AnalysisChart({ data, type }: AnalysisChartProps) {
  // Mock historical data for demonstration
  const historicalData = [
    { date: 'Jan', performance: 85, seo: 78, security: 92, mobile: 88 },
    { date: 'Feb', performance: 87, seo: 82, security: 94, mobile: 90 },
    { date: 'Mar', performance: 89, seo: 85, security: 91, mobile: 92 },
    { date: 'Apr', performance: 91, seo: 88, security: 95, mobile: 94 },
    { date: 'May', performance: data.score, seo: 90, security: 96, mobile: 95 },
  ];

  const performanceBreakdown = [
    { name: 'Load Time', value: Math.max(0, 100 - (data.loadTime * 20)), color: '#3B82F6' },
    { name: 'FCP', value: Math.max(0, 100 - (data.firstContentfulPaint * 30)), color: '#10B981' },
    { name: 'LCP', value: Math.max(0, 100 - (data.largestContentfulPaint * 25)), color: '#F59E0B' },
    { name: 'CLS', value: Math.max(0, 100 - (data.cumulativeLayoutShift * 1000)), color: '#EF4444' },
    { name: 'FID', value: Math.max(0, 100 - (data.firstInputDelay * 10)), color: '#8B5CF6' },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  className="text-primary-600 dark:text-primary-400"
                  fontSize={12}
                />
                <YAxis 
                  className="text-primary-600 dark:text-primary-400"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--tw-color-white)',
                    border: '1px solid var(--tw-color-primary-200)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Performance"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="seo" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="SEO"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="security" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  name="Security"
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mobile" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="Mobile"
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Breakdown Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    className="text-primary-600 dark:text-primary-400"
                    fontSize={12}
                  />
                  <YAxis 
                    className="text-primary-600 dark:text-primary-400"
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--tw-color-white)',
                      border: '1px solid var(--tw-color-primary-200)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {performanceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Metrics</CardTitle>
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
                    Value
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-primary-900 dark:text-primary-100">
                    Target
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-primary-900 dark:text-primary-100">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { 
                    metric: 'Load Time', 
                    value: `${data.loadTime}s`, 
                    target: '< 3s',
                    status: data.loadTime < 3 ? 'Good' : data.loadTime < 5 ? 'Needs Improvement' : 'Poor'
                  },
                  { 
                    metric: 'First Contentful Paint', 
                    value: `${data.firstContentfulPaint}s`, 
                    target: '< 1.8s',
                    status: data.firstContentfulPaint < 1.8 ? 'Good' : data.firstContentfulPaint < 3 ? 'Needs Improvement' : 'Poor'
                  },
                  { 
                    metric: 'Largest Contentful Paint', 
                    value: `${data.largestContentfulPaint}s`, 
                    target: '< 2.5s',
                    status: data.largestContentfulPaint < 2.5 ? 'Good' : data.largestContentfulPaint < 4 ? 'Needs Improvement' : 'Poor'
                  },
                  { 
                    metric: 'Cumulative Layout Shift', 
                    value: data.cumulativeLayoutShift.toFixed(3), 
                    target: '< 0.1',
                    status: data.cumulativeLayoutShift < 0.1 ? 'Good' : data.cumulativeLayoutShift < 0.25 ? 'Needs Improvement' : 'Poor'
                  },
                  { 
                    metric: 'First Input Delay', 
                    value: `${data.firstInputDelay}ms`, 
                    target: '< 100ms',
                    status: data.firstInputDelay < 100 ? 'Good' : data.firstInputDelay < 300 ? 'Needs Improvement' : 'Poor'
                  },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-primary-100 dark:border-primary-800">
                    <td className="py-3 px-4 text-primary-900 dark:text-primary-100">
                      {row.metric}
                    </td>
                    <td className="py-3 px-4 text-primary-900 dark:text-primary-100 font-medium">
                      {row.value}
                    </td>
                    <td className="py-3 px-4 text-primary-600 dark:text-primary-400">
                      {row.target}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${row.status === 'Good' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          row.status === 'Needs Improvement' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }
                      `}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}