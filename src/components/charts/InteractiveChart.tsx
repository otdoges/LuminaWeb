import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  Settings,
  Filter,
  Play,
  Pause
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

// Types
interface ChartDataPoint {
  [key: string]: any;
  timestamp?: number;
  date?: string;
}

interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'pie' | 'scatter' | 'radar';
  data: ChartDataPoint[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  animate?: boolean;
  realTime?: boolean;
  updateInterval?: number;
  title?: string;
  subtitle?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showBrush?: boolean;
  gradient?: boolean;
  smoothCurve?: boolean;
  stacked?: boolean;
  normalized?: boolean;
  thresholds?: Array<{ value: number; label: string; color: string }>;
}

interface InteractiveChartProps extends ChartConfig {
  className?: string;
  onDataPointClick?: (data: ChartDataPoint, index: number) => void;
  onDataUpdate?: (newData: ChartDataPoint[]) => void;
  customTooltip?: React.ComponentType<any>;
  exportable?: boolean;
  fullscreenToggle?: boolean;
  refreshable?: boolean;
  filterable?: boolean;
  loading?: boolean;
}

// Color schemes
const COLOR_SCHEMES = {
  default: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
  performance: ['#10B981', '#F59E0B', '#EF4444'],
  accessibility: ['#3B82F6', '#8B5CF6', '#06B6D4'],
  gradient: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'],
  monochrome: ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB'],
  vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
};

// Custom tooltip component
const CustomTooltip = React.memo(({ active, payload, label, config }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg"
    >
      <p className="font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.dataKey}:</span>
          <span className="font-medium text-foreground">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </motion.div>
  );
});

CustomTooltip.displayName = 'CustomTooltip';

// Chart controls component
const ChartControls = React.memo(({ 
  config, 
  onConfigChange, 
  onRefresh, 
  onExport, 
  onFullscreen,
  isFullscreen,
  isPlaying,
  onPlayPause
}: {
  config: ChartConfig;
  onConfigChange: (newConfig: Partial<ChartConfig>) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  isPlaying?: boolean;
  onPlayPause?: () => void;
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {config.realTime && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onPlayPause}
          className="flex items-center gap-1"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
      )}
      
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-1"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {onExport && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="flex items-center gap-1"
        >
          <Download className="w-4 h-4" />
        </Button>
      )}

      {onFullscreen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onFullscreen}
          className="flex items-center gap-1"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      )}

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full right-0 mt-2 bg-background border border-border rounded-lg p-4 shadow-lg z-50 min-w-64"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Show Grid</label>
                <input
                  type="checkbox"
                  checked={config.showGrid}
                  onChange={(e) => onConfigChange({ showGrid: e.target.checked })}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Show Legend</label>
                <input
                  type="checkbox"
                  checked={config.showLegend}
                  onChange={(e) => onConfigChange({ showLegend: e.target.checked })}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Smooth Curve</label>
                <input
                  type="checkbox"
                  checked={config.smoothCurve}
                  onChange={(e) => onConfigChange({ smoothCurve: e.target.checked })}
                  className="rounded"
                />
              </div>

              {config.type === 'line' || config.type === 'area' ? (
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Gradient</label>
                  <input
                    type="checkbox"
                    checked={config.gradient}
                    onChange={(e) => onConfigChange({ gradient: e.target.checked })}
                    className="rounded"
                  />
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ChartControls.displayName = 'ChartControls';

// Main interactive chart component
export const InteractiveChart = React.memo<InteractiveChartProps>(({
  type,
  data,
  xKey,
  yKeys,
  colors = COLOR_SCHEMES.default,
  animate = true,
  realTime = false,
  updateInterval = 5000,
  title,
  subtitle,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showBrush = false,
  gradient = false,
  smoothCurve = true,
  stacked = false,
  normalized = false,
  thresholds = [],
  className,
  onDataPointClick,
  onDataUpdate,
  customTooltip,
  exportable = true,
  fullscreenToggle = true,
  refreshable = true,
  filterable = false,
  loading = false
}) => {
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type, data, xKey, yKeys, colors, animate, realTime, updateInterval,
    title, subtitle, height, showGrid, showLegend, showTooltip, showBrush,
    gradient, smoothCurve, stacked, normalized, thresholds
  });
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(realTime);
  const [filteredData, setFilteredData] = useState(data);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const chartRef = useRef<HTMLDivElement>(null);

  // Update internal config when props change
  useEffect(() => {
    setChartConfig(prev => ({
      ...prev,
      type, data, xKey, yKeys, colors, animate, realTime, updateInterval,
      title, subtitle, height, showGrid, showLegend, showTooltip, showBrush,
      gradient, smoothCurve, stacked, normalized, thresholds
    }));
    setFilteredData(data);
  }, [type, data, xKey, yKeys, colors, animate, realTime, updateInterval,
      title, subtitle, height, showGrid, showLegend, showTooltip, showBrush,
      gradient, smoothCurve, stacked, normalized, thresholds]);

  // Real-time data updates
  useEffect(() => {
    if (realTime && isPlaying && onDataUpdate) {
      intervalRef.current = setInterval(() => {
        // Simulate new data point (in real app, this would fetch from API)
        const newPoint = {
          [xKey]: new Date().toISOString(),
          ...yKeys.reduce((acc, key) => ({
            ...acc,
            [key]: Math.floor(Math.random() * 100)
          }), {})
        };
        
        const updatedData = [...data, newPoint].slice(-50); // Keep last 50 points
        onDataUpdate(updatedData);
      }, updateInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [realTime, isPlaying, updateInterval, onDataUpdate, data, xKey, yKeys]);

  // Configuration change handler
  const handleConfigChange = useCallback((newConfig: Partial<ChartConfig>) => {
    setChartConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Export functionality
  const handleExport = useCallback(() => {
    // Implementation would depend on specific export needs
    console.log('Exporting chart data:', filteredData);
  }, [filteredData]);

  // Chart component based on type
  const renderChart = useMemo(() => {
    const commonProps = {
      data: filteredData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      onMouseMove: (e: any) => {
        if (e && e.activeTooltipIndex !== undefined) {
          setHoveredPoint(e.activeTooltipIndex);
        }
      },
      onMouseLeave: () => setHoveredPoint(null),
      onClick: onDataPointClick
    };

    const TooltipComponent = customTooltip || CustomTooltip;

    switch (chartConfig.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis 
              dataKey={xKey} 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            {showTooltip && <Tooltip content={<TooltipComponent config={chartConfig} />} />}
            {showLegend && <Legend />}
            {showBrush && <Brush dataKey={xKey} height={30} />}
            
            {thresholds.map((threshold, index) => (
              <ReferenceLine
                key={index}
                y={threshold.value}
                stroke={threshold.color}
                strokeDasharray="5 5"
                label={threshold.label}
              />
            ))}
            
            {yKeys.map((key, index) => (
              <Line
                key={key}
                type={smoothCurve ? "monotone" : "linear"}
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={animate ? 1000 : 0}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            {showTooltip && <Tooltip content={<TooltipComponent config={chartConfig} />} />}
            {showLegend && <Legend />}
            
            {yKeys.map((key, index) => (
              <Area
                key={key}
                type={smoothCurve ? "monotone" : "linear"}
                dataKey={key}
                stackId={stacked ? "1" : undefined}
                stroke={colors[index % colors.length]}
                fill={gradient ? `url(#gradient-${index})` : colors[index % colors.length]}
                fillOpacity={0.3}
                strokeWidth={2}
                animationDuration={animate ? 1000 : 0}
              />
            ))}
            
            {gradient && (
              <defs>
                {yKeys.map((_, index) => (
                  <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
            )}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            {showTooltip && <Tooltip content={<TooltipComponent config={chartConfig} />} />}
            {showLegend && <Legend />}
            
            {yKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
                animationDuration={animate ? 1000 : 0}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        const pieData = yKeys.map((key, index) => ({
          name: key,
          value: filteredData.reduce((sum, item) => sum + (item[key] || 0), 0),
          color: colors[index % colors.length]
        }));

        return (
          <PieChart {...commonProps}>
            {showTooltip && <Tooltip content={<TooltipComponent config={chartConfig} />} />}
            {showLegend && <Legend />}
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={height * 0.3}
              paddingAngle={2}
              dataKey="value"
              animationDuration={animate ? 1000 : 0}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  }, [chartConfig, filteredData, colors, xKey, yKeys, showGrid, showTooltip, showLegend, showBrush, 
      smoothCurve, stacked, gradient, thresholds, animate, height, onDataPointClick, customTooltip]);

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : "",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        
        <div className="relative">
          <ChartControls
            config={chartConfig}
            onConfigChange={handleConfigChange}
            onRefresh={refreshable ? () => onDataUpdate?.(data) : undefined}
            onExport={exportable ? handleExport : undefined}
            onFullscreen={fullscreenToggle ? () => setIsFullscreen(!isFullscreen) : undefined}
            isFullscreen={isFullscreen}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
          />
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center"
              style={{ height }}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading chart data...
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              ref={chartRef}
            >
              <ResponsiveContainer width="100%" height={isFullscreen ? "calc(100vh - 200px)" : height}>
                {renderChart}
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-time indicator */}
        {realTime && (
          <motion.div
            className="absolute top-4 right-16 flex items-center gap-2 text-xs text-muted-foreground"
            animate={{ opacity: isPlaying ? [0.5, 1, 0.5] : 1 }}
            transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
          >
            <Activity className="w-3 h-3" />
            {isPlaying ? 'Live' : 'Paused'}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
});

InteractiveChart.displayName = 'InteractiveChart';

export default InteractiveChart; 