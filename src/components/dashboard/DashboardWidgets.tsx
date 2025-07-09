import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Globe, 
  Shield, 
  Smartphone, 
  Clock,
  Settings,
  Plus,
  Minus,
  GripVertical,
  Maximize2,
  Minimize2,
  RefreshCw,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { InteractiveChart } from '../charts/InteractiveChart';
import { MetricsCard } from './MetricsCard';
import { cn } from '../../lib/utils';

// Widget types and interfaces
type WidgetType = 'chart' | 'metric' | 'performance' | 'security' | 'mobile' | 'custom';
type WidgetSize = 'small' | 'medium' | 'large' | 'xlarge';
type ChartType = 'line' | 'area' | 'bar' | 'pie';

interface BaseWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: { x: number; y: number };
  visible: boolean;
  refreshInterval?: number;
  lastUpdated?: number;
  config?: Record<string, any>;
}

interface ChartWidget extends BaseWidget {
  type: 'chart';
  chartType: ChartType;
  dataSource: string;
  xKey: string;
  yKeys: string[];
  realTime?: boolean;
}

interface MetricWidget extends BaseWidget {
  type: 'metric';
  value: string | number;
  change?: number;
  icon: string;
  color: string;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
}

interface PerformanceWidget extends BaseWidget {
  type: 'performance';
  metrics: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
  };
}

type Widget = ChartWidget | MetricWidget | PerformanceWidget | BaseWidget;

interface DashboardLayout {
  id: string;
  name: string;
  widgets: Widget[];
  columns: number;
  spacing: number;
  createdAt: number;
  updatedAt: number;
}

// Widget size configurations
const WIDGET_SIZES = {
  small: { width: 1, height: 1, minWidth: 300, minHeight: 200 },
  medium: { width: 2, height: 1, minWidth: 400, minHeight: 250 },
  large: { width: 2, height: 2, minWidth: 400, minHeight: 400 },
  xlarge: { width: 3, height: 2, minWidth: 600, minHeight: 400 }
};

// Sample data generators
const generateSampleData = (type: ChartType, count: number = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 20,
      performance: Math.floor(Math.random() * 80) + 20,
      accessibility: Math.floor(Math.random() * 70) + 30,
      seo: Math.floor(Math.random() * 90) + 10
    });
  }
  
  return data;
};

// Widget components
const ChartWidgetComponent = React.memo(({ widget, onUpdate }: { 
  widget: ChartWidget; 
  onUpdate: (id: string, data: any) => void;
}) => {
  const [data, setData] = useState(generateSampleData(widget.chartType));
  const [loading, setLoading] = useState(false);

  const refreshData = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setData(generateSampleData(widget.chartType));
    setLoading(false);
    onUpdate(widget.id, { lastUpdated: Date.now() });
  }, [widget.chartType, widget.id, onUpdate]);

  useEffect(() => {
    if (widget.refreshInterval) {
      const interval = setInterval(refreshData, widget.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [widget.refreshInterval, refreshData]);

  return (
    <InteractiveChart
      type={widget.chartType}
      data={data}
      xKey="date"
      yKeys={widget.yKeys}
      title={widget.title}
      height={WIDGET_SIZES[widget.size].minHeight - 100}
      realTime={widget.realTime}
      loading={loading}
      refreshable
      onDataUpdate={(newData) => setData(newData)}
    />
  );
});

ChartWidgetComponent.displayName = 'ChartWidgetComponent';

const MetricWidgetComponent = React.memo(({ widget }: { widget: MetricWidget }) => {
  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      switch (widget.format) {
        case 'percentage':
          return `${value}%`;
        case 'currency':
          return `$${value.toLocaleString()}`;
        case 'duration':
          return `${value}ms`;
        default:
          return value.toLocaleString();
      }
    }
    return value;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{widget.title}</p>
          <p className="text-3xl font-bold text-foreground">
            {formatValue(widget.value)}
          </p>
          {widget.change !== undefined && (
            <p className={`text-sm mt-1 flex items-center gap-1 ${
              widget.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {widget.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
              {widget.change >= 0 ? '+' : ''}{widget.change}%
            </p>
          )}
        </div>
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${widget.color}15` }}
        >
          <div className="w-6 h-6" style={{ color: widget.color }}>
            {widget.icon === 'chart' && <BarChart3 className="w-6 h-6" />}
            {widget.icon === 'globe' && <Globe className="w-6 h-6" />}
            {widget.icon === 'shield' && <Shield className="w-6 h-6" />}
            {widget.icon === 'smartphone' && <Smartphone className="w-6 h-6" />}
            {widget.icon === 'clock' && <Clock className="w-6 h-6" />}
          </div>
        </div>
      </div>
    </div>
  );
});

MetricWidgetComponent.displayName = 'MetricWidgetComponent';

const PerformanceWidgetComponent = React.memo(({ widget }: { widget: PerformanceWidget }) => {
  const metrics = [
    { label: 'Load Time', value: widget.metrics.loadTime, unit: 'ms', color: '#10B981' },
    { label: 'FCP', value: widget.metrics.firstContentfulPaint, unit: 's', color: '#3B82F6' },
    { label: 'LCP', value: widget.metrics.largestContentfulPaint, unit: 's', color: '#F59E0B' },
    { label: 'CLS', value: widget.metrics.cumulativeLayoutShift, unit: '', color: '#EF4444' }
  ];

  return (
    <div className="p-6">
      <h3 className="font-semibold text-lg mb-4">{widget.title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: metric.color }}
            >
              {metric.value}{metric.unit}
            </div>
            <p className="text-xs text-muted-foreground">{metric.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

PerformanceWidgetComponent.displayName = 'PerformanceWidgetComponent';

// Widget wrapper with controls
const WidgetWrapper = React.memo(({ 
  widget, 
  onUpdate, 
  onRemove, 
  onDuplicate,
  onResize,
  isEditing 
}: {
  widget: Widget;
  onUpdate: (id: string, updates: Partial<Widget>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onResize: (id: string, size: WidgetSize) => void;
  isEditing: boolean;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const sizeConfig = WIDGET_SIZES[widget.size];

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'chart':
        return <ChartWidgetComponent widget={widget as ChartWidget} onUpdate={onUpdate} />;
      case 'metric':
        return <MetricWidgetComponent widget={widget as MetricWidget} />;
      case 'performance':
        return <PerformanceWidgetComponent widget={widget as PerformanceWidget} />;
      default:
        return (
          <div className="p-6 text-center text-muted-foreground">
            <p>Widget type not supported</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: isEditing ? 0 : -2 }}
      className={cn(
        "relative group",
        isExpanded ? "fixed inset-4 z-50" : "",
        isEditing ? "cursor-move" : ""
      )}
      style={{
        minWidth: isExpanded ? 'auto' : sizeConfig.minWidth,
        minHeight: isExpanded ? 'auto' : sizeConfig.minHeight,
        gridColumn: `span ${sizeConfig.width}`,
        gridRow: `span ${sizeConfig.height}`
      }}
    >
      {isEditing && (
        <div className="absolute -top-2 -left-2 z-10 bg-primary text-primary-foreground rounded-full p-1">
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      <Card className={cn(
        "h-full transition-all duration-200",
        isEditing ? "ring-2 ring-primary" : "hover:shadow-lg",
        isExpanded ? "shadow-2xl" : ""
      )}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium truncate">
              {widget.title}
            </CardTitle>
            {widget.lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Updated {new Date(widget.lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            )}
            
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className={cn(
                  "transition-opacity",
                  isEditing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-full right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 min-w-36"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onUpdate(widget.id, { lastUpdated: Date.now() });
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                      
                      <button
                        onClick={() => {
                          onDuplicate(widget.id);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      
                      <div className="border-t border-border my-1"></div>
                      
                      {(['small', 'medium', 'large', 'xlarge'] as WidgetSize[]).map(size => (
                        <button
                          key={size}
                          onClick={() => {
                            onResize(widget.id, size);
                            setShowMenu(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm hover:bg-muted capitalize",
                            widget.size === size ? "bg-muted" : ""
                          )}
                        >
                          {size}
                        </button>
                      ))}
                      
                      <div className="border-t border-border my-1"></div>
                      
                      <button
                        onClick={() => {
                          onRemove(widget.id);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted text-destructive flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 h-full">
          {renderWidgetContent()}
        </CardContent>
      </Card>
    </motion.div>
  );
});

WidgetWrapper.displayName = 'WidgetWrapper';

// Widget templates for easy addition
const WIDGET_TEMPLATES: Partial<Widget>[] = [
  {
    type: 'chart',
    chartType: 'line',
    title: 'Performance Trend',
    size: 'medium',
    xKey: 'date',
    yKeys: ['performance'],
    refreshInterval: 30
  } as Partial<ChartWidget>,
  {
    type: 'metric',
    title: 'Page Load Time',
    size: 'small',
    value: 1.2,
    change: -5.2,
    icon: 'clock',
    color: '#10B981',
    format: 'duration'
  } as Partial<MetricWidget>,
  {
    type: 'performance',
    title: 'Core Web Vitals',
    size: 'medium',
    metrics: {
      loadTime: 1200,
      firstContentfulPaint: 1.8,
      largestContentfulPaint: 2.1,
      cumulativeLayoutShift: 0.05
    }
  } as Partial<PerformanceWidget>
];

// Main dashboard widgets component
export const DashboardWidgets = React.memo(({ 
  initialLayout,
  onLayoutChange
}: {
  initialLayout?: DashboardLayout;
  onLayoutChange?: (layout: DashboardLayout) => void;
}) => {
  const [layout, setLayout] = useState<DashboardLayout>(
    initialLayout || {
      id: 'default',
      name: 'Default Dashboard',
      widgets: [],
      columns: 4,
      spacing: 16,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  );
  
  const [isEditing, setIsEditing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);

  // Save layout to localStorage
  useEffect(() => {
    const updatedLayout = { ...layout, updatedAt: Date.now() };
    localStorage.setItem('dashboard_layout', JSON.stringify(updatedLayout));
    onLayoutChange?.(updatedLayout);
  }, [layout, onLayoutChange]);

  // Load layout from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dashboard_layout');
    if (saved && !initialLayout) {
      try {
        setLayout(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load dashboard layout:', error);
      }
    }
  }, [initialLayout]);

  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === id ? { ...widget, ...updates } : widget
      )
    }));
  }, []);

  const removeWidget = useCallback((id: string) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(widget => widget.id !== id)
    }));
  }, []);

  const duplicateWidget = useCallback((id: string) => {
    setLayout(prev => {
      const widget = prev.widgets.find(w => w.id === id);
      if (!widget) return prev;
      
      const newWidget = {
        ...widget,
        id: `${widget.id}_copy_${Date.now()}`,
        title: `${widget.title} (Copy)`,
        position: { x: widget.position.x + 1, y: widget.position.y }
      };
      
      return {
        ...prev,
        widgets: [...prev.widgets, newWidget]
      };
    });
  }, []);

  const resizeWidget = useCallback((id: string, size: WidgetSize) => {
    updateWidget(id, { size });
  }, [updateWidget]);

  const addWidget = useCallback((template: Partial<Widget>) => {
    const newWidget: Widget = {
      id: `widget_${Date.now()}`,
      visible: true,
      position: { x: 0, y: 0 },
      ...template
    } as Widget;
    
    setLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));
    setShowAddWidget(false);
  }, []);

  const reorderWidgets = useCallback((newWidgets: Widget[]) => {
    setLayout(prev => ({
      ...prev,
      widgets: newWidgets
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Dashboard controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{layout.name}</h2>
          <p className="text-sm text-muted-foreground">
            {layout.widgets.length} widgets • Last updated {new Date(layout.updatedAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddWidget(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Widget
          </Button>
          
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {isEditing ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* Widget grid */}
      <div className="relative">
        {isEditing ? (
          <Reorder.Group
            axis="y"
            values={layout.widgets}
            onReorder={reorderWidgets}
            className={cn(
              "grid gap-4 auto-rows-min",
              `grid-cols-${layout.columns}`
            )}
            style={{ gridGap: layout.spacing }}
          >
            <AnimatePresence>
              {layout.widgets.map((widget) => (
                <Reorder.Item key={widget.id} value={widget}>
                  <WidgetWrapper
                    widget={widget}
                    onUpdate={updateWidget}
                    onRemove={removeWidget}
                    onDuplicate={duplicateWidget}
                    onResize={resizeWidget}
                    isEditing={isEditing}
                  />
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        ) : (
          <div 
            className={cn(
              "grid gap-4 auto-rows-min",
              `grid-cols-${layout.columns}`
            )}
            style={{ gridGap: layout.spacing }}
          >
            <AnimatePresence>
              {layout.widgets.map((widget) => (
                <WidgetWrapper
                  key={widget.id}
                  widget={widget}
                  onUpdate={updateWidget}
                  onRemove={removeWidget}
                  onDuplicate={duplicateWidget}
                  onResize={resizeWidget}
                  isEditing={isEditing}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {layout.widgets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No widgets yet</h3>
              <p className="text-sm mb-4">Add your first widget to get started</p>
              <Button onClick={() => setShowAddWidget(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add widget modal */}
      <AnimatePresence>
        {showAddWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddWidget(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-background border border-border rounded-lg shadow-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Add Widget</h3>
              
              <div className="space-y-3">
                {WIDGET_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => addWidget(template)}
                    className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="font-medium">{template.title}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {template.type} • {template.size}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowAddWidget(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

DashboardWidgets.displayName = 'DashboardWidgets';

export default DashboardWidgets; 