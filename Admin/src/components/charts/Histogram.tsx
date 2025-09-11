import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { useTheme } from "@/contexts/ThemeContext";
import { useDirection } from "@/contexts/DirectionContext";

export interface HistogramData {
  range: string;
  frequency: number;
  [key: string]: string | number;
}

interface HistogramProps {
  data: HistogramData[];
  config: ChartConfig;
  frequencyDataKey?: string;
  rangeDataKey?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
  barColor?: string;
  binCount?: number;
}

export const Histogram: React.FC<HistogramProps> = ({
  data,
  config,
  frequencyDataKey = "frequency",
  rangeDataKey = "range",
  height = 300,
  showGrid = true,
  showTooltip = true,
  className = "",
  barColor,
}) => {
  const { theme } = useTheme();
  const { isRTL } = useDirection();

  return (
    <ChartContainer config={config} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: isRTL ? 12 : 20,
            left: isRTL ? 20 : 12,
            bottom: 20,
          }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme === "dark" ? "hsl(var(--border))" : "hsl(var(--border))"}
              opacity={0.3}
            />
          )}
          <XAxis
            dataKey={rangeDataKey}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            orientation={isRTL ? "right" : "left"}
          />
          {showTooltip && (
            <ChartTooltip
              cursor={{ 
                fill: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              }}
              content={<ChartTooltipContent />}
            />
          )}
          <Bar
            dataKey={frequencyDataKey}
            fill={barColor || `var(--color-${frequencyDataKey})`}
            radius={[2, 2, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Utility function to create histogram data from raw values
export const createHistogramData = (
  values: number[],
  binCount: number = 10,
  rangeLabels?: { ar: string[]; en: string[] }
): HistogramData[] => {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binSize = (max - min) / binCount;

  const bins: HistogramData[] = [];

  for (let i = 0; i < binCount; i++) {
    const binStart = min + i * binSize;
    const binEnd = min + (i + 1) * binSize;
    const range = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;
    
    const frequency = values.filter(
      value => value >= binStart && (i === binCount - 1 ? value <= binEnd : value < binEnd)
    ).length;

    bins.push({
      range,
      frequency,
      binStart,
      binEnd,
    });
  }

  return bins;
};
