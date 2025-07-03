import React from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PerformanceMetrics } from '../../types/analysis';

interface ModernPerformanceChartProps {
  data: PerformanceMetrics;
  showTrend?: boolean;
}

export function ModernPerformanceChart({ data, showTrend = true }: ModernPerformanceChartProps) {
  // Performance trend data
  const trendData = [
    { month: 'Jan', performance: 72, loadTime: 3.2 },
    { month: 'Feb', performance: 78, loadTime: 2.8 },
    { month: 'Mar', performance: 85, loadTime: 2.4 },
    { month: 'Apr', performance: 88, loadTime: 2.1 },
    { month: 'May', performance: data.score, loadTime: data.loadTime },
  ];

  // Core Web Vitals breakdown
  const coreVitalsData = [
    { 
      metric: 'FCP', 
      value: Math.max(0, 100 - (data.firstContentfulPaint * 40)),
      target: 1.8,
      actual: data.firstContentfulPaint
    },
    { 
      metric: 'LCP', 
      value: Math.max(0, 100 - (data.largestContentfulPaint * 25)),
      target: 2.5,
      actual: data.largestContentfulPaint
    },
    { 
      metric: 'CLS', 
      value: Math.max(0, 100 - (data.cumulativeLayoutShift * 1000)),
      target: 0.1,
      actual: data.cumulativeLayoutShift
    },
    { 
      metric: 'FID', 
      value: Math.max(0, 100 - (data.firstInputDelay * 10)),
      target: 100,
      actual: data.firstInputDelay
    },
  ];

  const performanceChartConfig = {
    performance: { label: "Performance Score", color: "hsl(217, 91%, 60%)" },
    loadTime: { label: "Load Time", color: "hsl(142, 76%, 36%)" },
  };

  const vitalsChartConfig = {
    value: { label: "Score", color: "hsl(20, 100%, 60%)" },
  };

  return (
    <div className="space-y-6">
      {/* Performance Score Display */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-6xl font-bold text-center">
              {data.score}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Performance Score
            </div>
            {showTrend && (
              <ChartContainer config={performanceChartConfig} className="h-64 w-full">
                <LineChart data={trendData}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <ChartTooltip content={ChartTooltipContent} />
                  <Line 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="var(--color-performance)" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">
              {coreVitalsData.filter(item => item.value > 75).length} of 4 Metrics Performing Well
            </h3>
            <ChartContainer config={vitalsChartConfig} className="h-64 w-full">
                             <AreaChart data={coreVitalsData}>
                 <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                 <YAxis hide />
                 <ChartTooltip content={ChartTooltipContent} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--color-value)" 
                  fill="url(#vitalsGradient)"
                  strokeWidth={0}
                />
                <defs>
                  <linearGradient id="vitalsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Load Time Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Load Time Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-6xl font-bold text-center">
              {data.loadTime.toFixed(1)}s
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Current Load Time
            </div>
            <ChartContainer config={performanceChartConfig} className="h-64 w-full">
                             <AreaChart data={trendData}>
                 <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                 <YAxis hide />
                 <ChartTooltip content={ChartTooltipContent} />
                <Area 
                  type="monotone" 
                  dataKey="loadTime" 
                  stroke="var(--color-loadTime)" 
                  fill="url(#loadTimeGradient)"
                  strokeWidth={0}
                />
                <defs>
                  <linearGradient id="loadTimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-loadTime)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="var(--color-loadTime)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Metric</th>
                  <th className="text-left py-3 px-4 font-medium">Value</th>
                  <th className="text-left py-3 px-4 font-medium">Target</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {coreVitalsData.map((item, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium">{item.metric}</td>
                    <td className="py-3 px-4">
                      {item.metric === 'CLS' ? item.actual.toFixed(3) : `${item.actual.toFixed(1)}${item.metric.includes('FCP') || item.metric.includes('LCP') ? 's' : 'ms'}`}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {item.metric === 'CLS' ? `< ${item.target}` : `< ${item.target}${item.metric.includes('FCP') || item.metric.includes('LCP') ? 's' : 'ms'}`}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.value > 75 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        item.value > 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {item.value > 75 ? 'Good' : item.value > 50 ? 'Needs Improvement' : 'Poor'}
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