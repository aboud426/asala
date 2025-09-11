import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
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

export interface LineChartData {
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineChartData[];
  config: ChartConfig;
  xAxisDataKey: string;
  lines: {
    dataKey: string;
    stroke?: string;
    strokeWidth?: number;
    type?: "linear" | "monotone" | "step";
  }[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  config,
  xAxisDataKey,
  lines,
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
        <RechartsLineChart
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
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type={line.type || "monotone"}
              dataKey={line.dataKey}
              stroke={line.stroke || `var(--color-${line.dataKey})`}
              strokeWidth={line.strokeWidth || 2}
              dot={{
                fill: line.stroke || `var(--color-${line.dataKey})`,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                stroke: line.stroke || `var(--color-${line.dataKey})`,
                strokeWidth: 2,
              }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
