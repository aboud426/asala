import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
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

export interface AreaChartData {
  [key: string]: string | number;
}

interface AreaChartProps {
  data: AreaChartData[];
  config: ChartConfig;
  xAxisDataKey: string;
  areas: {
    dataKey: string;
    fill?: string;
    stroke?: string;
    fillOpacity?: number;
    type?: "linear" | "monotone" | "step";
    stackId?: string;
  }[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  config,
  xAxisDataKey,
  areas,
  height = 300,
  showGrid = true,
  showTooltip = true,
  className = "",
}) => {
  const { theme } = useTheme();
  const { isRTL } = useDirection();

  return (
    <ChartContainer config={config} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
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
            dataKey={xAxisDataKey}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
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
              cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
              content={<ChartTooltipContent />}
            />
          )}
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type={area.type || "monotone"}
              dataKey={area.dataKey}
              stackId={area.stackId}
              stroke={area.stroke || `var(--color-${area.dataKey})`}
              fill={area.fill || `var(--color-${area.dataKey})`}
              fillOpacity={area.fillOpacity || 0.3}
              strokeWidth={2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
