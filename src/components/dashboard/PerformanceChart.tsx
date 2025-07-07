import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader } from '../ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';

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

type ChartType = 'line' | 'bar' | 'area' | 'pie';

const COLORS = {
  performance: '#3B82F6',
  accessibility: '#10B981',
  seo: '#F59E0B',
  bestPractices: '#8B5CF6'
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export function PerformanceChart({ data }: PerformanceChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  // Calculate trend data
  const trendData = useMemo(() => {
    if (data.length < 2) return null;
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    
    return {
      performance: latest.performance - previous.performance,
      accessibility: latest.accessibility - previous.accessibility,
      seo: latest.seo - previous.seo,
      bestPractices: latest.bestPractices - previous.bestPractices
    };
  }, [data]);

  // Calculate average scores for pie chart
  const averageScores = useMemo(() => {
    if (data.length === 0) return [];
    
    const totals = data.reduce((acc, curr) => ({
      performance: acc.performance + curr.performance,
      accessibility: acc.accessibility + curr.accessibility,
      seo: acc.seo + curr.seo,
      bestPractices: acc.bestPractices + curr.bestPractices
    }), { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 });
    
    return [
      { name: 'Performance', value: Math.round(totals.performance / data.length) },
      { name: 'Accessibility', value: Math.round(totals.accessibility / data.length) },
      { name: 'SEO', value: Math.round(totals.seo / data.length) },
      { name: 'Best Practices', value: Math.round(totals.bestPractices / data.length) }
    ];
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <p className="font-semibold text-gray-800 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-300">{entry.name}:</span>
              <span className="font-medium text-gray-800 dark:text-white">{entry.value}</span>
              {trendData && trendData[entry.dataKey as keyof typeof trendData] && (
                <span className={`text-xs flex items-center gap-1 ${
                  trendData[entry.dataKey as keyof typeof trendData] > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trendData[entry.dataKey as keyof typeof trendData] > 0 ? 
                    <TrendingUp className="w-3 h-3" /> : 
                    <TrendingDown className="w-3 h-3" />
                  }
                  {Math.abs(trendData[entry.dataKey as keyof typeof trendData])}
                </span>
              )}
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: payload[0].color }}
            />
            <span className="text-gray-600 dark:text-gray-300">{payload[0].name}:</span>
            <span className="font-medium text-gray-800 dark:text-white">{payload[0].value}</span>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data} onMouseMove={setHoveredPoint}>
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
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="performance" 
              stroke={COLORS.performance}
              strokeWidth={selectedMetric === 'performance' || !selectedMetric ? 3 : 2}
              name="Performance"
              dot={{ fill: COLORS.performance, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS.performance, strokeWidth: 2 }}
              opacity={selectedMetric === 'performance' || !selectedMetric ? 1 : 0.3}
            />
            <Line 
              type="monotone" 
              dataKey="accessibility" 
              stroke={COLORS.accessibility}
              strokeWidth={selectedMetric === 'accessibility' || !selectedMetric ? 3 : 2}
              name="Accessibility"
              dot={{ fill: COLORS.accessibility, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS.accessibility, strokeWidth: 2 }}
              opacity={selectedMetric === 'accessibility' || !selectedMetric ? 1 : 0.3}
            />
            <Line 
              type="monotone" 
              dataKey="seo" 
              stroke={COLORS.seo}
              strokeWidth={selectedMetric === 'seo' || !selectedMetric ? 3 : 2}
              name="SEO"
              dot={{ fill: COLORS.seo, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS.seo, strokeWidth: 2 }}
              opacity={selectedMetric === 'seo' || !selectedMetric ? 1 : 0.3}
            />
            <Line 
              type="monotone" 
              dataKey="bestPractices" 
              stroke={COLORS.bestPractices}
              strokeWidth={selectedMetric === 'bestPractices' || !selectedMetric ? 3 : 2}
              name="Best Practices"
              dot={{ fill: COLORS.bestPractices, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS.bestPractices, strokeWidth: 2 }}
              opacity={selectedMetric === 'bestPractices' || !selectedMetric ? 1 : 0.3}
            />
            <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="5 5" />
            <ReferenceLine y={90} stroke="#22c55e" strokeDasharray="5 5" />
          </LineChart>
        );
        
      case 'bar':
        return (
          <BarChart data={data}>
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
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="performance" fill={COLORS.performance} name="Performance" />
            <Bar dataKey="accessibility" fill={COLORS.accessibility} name="Accessibility" />
            <Bar dataKey="seo" fill={COLORS.seo} name="SEO" />
            <Bar dataKey="bestPractices" fill={COLORS.bestPractices} name="Best Practices" />
          </BarChart>
        );
        
      case 'area':
        return (
          <AreaChart data={data}>
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
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="performance" stackId="1" stroke={COLORS.performance} fill={COLORS.performance} fillOpacity={0.3} />
            <Area type="monotone" dataKey="accessibility" stackId="1" stroke={COLORS.accessibility} fill={COLORS.accessibility} fillOpacity={0.3} />
            <Area type="monotone" dataKey="seo" stackId="1" stroke={COLORS.seo} fill={COLORS.seo} fillOpacity={0.3} />
            <Area type="monotone" dataKey="bestPractices" stackId="1" stroke={COLORS.bestPractices} fill={COLORS.bestPractices} fillOpacity={0.3} />
          </AreaChart>
        );
        
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={averageScores}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {averageScores.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
            Performance Trends
          </h3>
          <p className="text-sm text-primary-600 dark:text-primary-400">
            Interactive visualization of your website metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType('line')}
            className={`p-2 rounded-lg transition-colors ${
              chartType === 'line' 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200' 
                : 'hover:bg-primary-50 dark:hover:bg-primary-900'
            }`}
          >
            <LineChartIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-2 rounded-lg transition-colors ${
              chartType === 'bar' 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200' 
                : 'hover:bg-primary-50 dark:hover:bg-primary-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`p-2 rounded-lg transition-colors ${
              chartType === 'area' 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200' 
                : 'hover:bg-primary-50 dark:hover:bg-primary-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`p-2 rounded-lg transition-colors ${
              chartType === 'pie' 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200' 
                : 'hover:bg-primary-50 dark:hover:bg-primary-900'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Metric Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['performance', 'accessibility', 'seo', 'bestPractices'].map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(selectedMetric === metric ? null : metric)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedMetric === metric
                  ? 'text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={{
                backgroundColor: selectedMetric === metric ? COLORS[metric as keyof typeof COLORS] : undefined
              }}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1).replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
          <button
            onClick={() => setSelectedMetric(null)}
            className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Show All
          </button>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={chartType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
        
        {/* Trend Summary */}
        {trendData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recent Changes
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(trendData).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <span className={`text-xs font-medium flex items-center gap-1 ${
                    value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {value > 0 ? <TrendingUp className="w-3 h-3" /> : 
                     value < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                    {value > 0 ? '+' : ''}{value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}