import React, { createContext, useContext } from 'react';
import { cn } from '../../lib/utils';

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = createContext<ChartContextValue | null>(null);

export function useChart() {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a ChartContainer');
  }
  return context;
}

interface ChartContainerProps {
  config: ChartConfig;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({ config, children, className }: ChartContainerProps) {
  // Create CSS custom properties for each color in the config
  const style = Object.entries(config).reduce((acc, [key, value]) => {
    acc[`--color-${key}` as string] = value.color;
    return acc;
  }, {} as Record<string, string>);

  return (
    <ChartContext.Provider value={{ config }}>
      <div 
        className={cn("flex aspect-video justify-center text-xs", className)} 
        style={style}
      >
        {children}
      </div>
    </ChartContext.Provider>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    dataKey: string;
    name: string;
    value: any;
    payload: any;
  }>;
  label?: string;
  className?: string;
}

export function ChartTooltipContent({ 
  active, 
  payload, 
  label, 
  className 
}: ChartTooltipProps) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className={cn(
      "rounded-lg border bg-background p-2 shadow-md",
      "border-border/50 bg-background/95 backdrop-blur-sm",
      className
    )}>
      {label && (
        <div className="text-xs font-medium text-foreground mb-1">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const configItem = config[entry.dataKey];
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">
                {configItem?.label || entry.name}:
              </span>
              <span className="font-medium text-foreground">
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartTooltip({ content: Content, ...props }: {
  content: React.ComponentType<ChartTooltipProps>;
  [key: string]: any;
}) {
  return <Content {...props} />;
} 