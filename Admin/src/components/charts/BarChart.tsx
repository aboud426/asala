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

export interface BarChartData {
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarChartData[];
  config: ChartConfig;
  xAxisDataKey: string;
  bars: {
    dataKey: string;
    fill?: string;
    radius?: [number, number, number, number];
  }[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
  layout?: "horizontal" | "vertical";
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  config,
  xAxisDataKey,
  bars,
  height = 300,
  showGrid = true,
  showTooltip = true,
  className = "",
  layout = "vertical",
}) => {
  const { theme } = useTheme();
  const { isRTL } = useDirection();

  return (
    <ChartContainer config={config} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          layout={layout}
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
            type={layout === "vertical" ? "number" : "category"}
            dataKey={layout === "horizontal" ? xAxisDataKey : undefined}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type={layout === "vertical" ? "category" : "number"}
            dataKey={layout === "vertical" ? xAxisDataKey : undefined}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            orientation={isRTL ? "right" : "left"}
            width={120}
          />
          {showTooltip && (
            <ChartTooltip
              cursor={{ 
                fill: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              }}
              content={<ChartTooltipContent />}
            />
          )}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              fill={bar.fill || `var(--color-${bar.dataKey})`}
              radius={bar.radius || [4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
