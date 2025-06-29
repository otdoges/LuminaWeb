import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { EngagementMetrics } from '../../types/analysis';
import { Users, TrendingUp, Target, Clock } from 'lucide-react';

interface TrafficAnalysisProps {
  engagement: EngagementMetrics;
}

export function TrafficAnalysis({ engagement }: TrafficAnalysisProps) {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Mock monthly traffic data
  const monthlyTraffic = [
    { month: 'Jan', visitors: 45000, conversions: 1125 },
    { month: 'Feb', visitors: 52000, conversions: 1404 },
    { month: 'Mar', visitors: 48000, conversions: 1344 },
    { month: 'Apr', visitors: 61000, conversions: 1830 },
    { month: 'May', visitors: engagement.monthlyVisitors, conversions: Math.round(engagement.monthlyVisitors * engagement.conversionRate / 100) },
  ];

  const deviceData = [
    { name: 'Desktop', value: engagement.demographics.devices.desktop, color: '#3B82F6' },
    { name: 'Mobile', value: engagement.demographics.devices.mobile, color: '#10B981' },
    { name: 'Tablet', value: engagement.demographics.devices.tablet, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Traffic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">
                  Monthly Visitors
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {engagement.monthlyVisitors.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +12% from last month
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {engagement.conversionRate}%
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +0.3% from last month
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">
                  Bounce Rate
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {engagement.bounceRate}%
                </p>
                <p className="text-xs text-red-600 mt-1">
                  +2% from last month
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">
                  Avg. Session Duration
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {engagement.avgSessionDuration}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +15s from last month
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagement.trafficSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, percentage }) => `${source}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {engagement.trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {engagement.trafficSources.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-primary-900 dark:text-primary-100 capitalize">
                      {source.source}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                      {source.visitors.toLocaleString()}
                    </span>
                    <span className="text-xs text-primary-600 dark:text-primary-400 ml-2">
                      ({source.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    className="text-primary-600 dark:text-primary-400"
                    fontSize={12}
                  />
                  <YAxis 
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
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {deviceData.map((device, index) => (
                <div key={device.name} className="text-center p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                  <p className="text-lg font-bold" style={{ color: device.color }}>
                    {device.value}%
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">
                    {device.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Traffic Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Traffic & Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTraffic}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  className="text-primary-600 dark:text-primary-400"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="visitors"
                  className="text-primary-600 dark:text-primary-400"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="conversions"
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
                <Line 
                  yAxisId="visitors"
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Visitors"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  yAxisId="conversions"
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Conversions"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary-200 dark:border-primary-700">
                  <th className="text-left py-3 px-4 font-medium text-primary-900 dark:text-primary-100">
                    Page
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-primary-900 dark:text-primary-100">
                    Views
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-primary-900 dark:text-primary-100">
                    Bounce Rate
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-primary-900 dark:text-primary-100">
                    Avg. Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {engagement.topPages.map((page, index) => (
                  <tr key={index} className="border-b border-primary-100 dark:border-primary-800">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-primary-900 dark:text-primary-100 font-medium">
                          {page.title}
                        </p>
                        <p className="text-xs text-primary-600 dark:text-primary-400">
                          {page.url}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-primary-900 dark:text-primary-100 font-medium">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${page.bounceRate < 30 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          page.bounceRate < 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }
                      `}>
                        {page.bounceRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-primary-900 dark:text-primary-100">
                      {page.avgTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Age Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {engagement.demographics.ageGroups.map((group, index) => (
                <div key={group.range} className="flex items-center justify-between">
                  <span className="text-sm text-primary-900 dark:text-primary-100">
                    {group.range}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-primary-200 dark:bg-primary-700 rounded-full h-2">
                      <div 
                        className="bg-accent-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${group.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-primary-600 dark:text-primary-400 w-8">
                      {group.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {engagement.demographics.locations.map((location, index) => (
                <div key={location.country} className="flex items-center justify-between">
                  <span className="text-sm text-primary-900 dark:text-primary-100">
                    {location.country}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-primary-200 dark:bg-primary-700 rounded-full h-2">
                      <div 
                        className="bg-accent-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${location.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-primary-600 dark:text-primary-400 w-8">
                      {location.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}