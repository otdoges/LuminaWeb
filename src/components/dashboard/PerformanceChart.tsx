import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader } from '../ui/card';

interface PerformanceData {
  date: string;
  performance: number;
  accessibility: number;
  seo: number;
  bestPractices: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
          Performance Trends
        </h3>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
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
              <Legend />
              <Line 
                type="monotone" 
                dataKey="performance" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Performance"
              />
              <Line 
                type="monotone" 
                dataKey="accessibility" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Accessibility"
              />
              <Line 
                type="monotone" 
                dataKey="seo" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="SEO"
              />
              <Line 
                type="monotone" 
                dataKey="bestPractices" 
                stroke="#755c4c" 
                strokeWidth={2}
                name="Best Practices"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}