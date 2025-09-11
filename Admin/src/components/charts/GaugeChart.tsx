import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartConfig,
} from "@/components/ui/chart";
import { useDirection } from "@/contexts/DirectionContext";

export interface GaugeChartData {
  name: string;
  value: number;
  fill?: string;
}

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  config: ChartConfig;
  height?: number;
  className?: string;
  title?: string;
  subtitle?: string;
  unit?: string;
  colors?: {
    low: string;
    medium: string;
    high: string;
    background: string;
  };
  thresholds?: {
    low: number;
    medium: number;
  };
}

const DEFAULT_COLORS = {
  low: "hsl(var(--destructive))",
  medium: "hsl(var(--warning))",
  high: "hsl(var(--success))",
  background: "hsl(var(--muted))",
};

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  config,
  height = 300,
  className = "",
  title,
  subtitle,
  unit = "",
  colors = DEFAULT_COLORS,
  thresholds = { low: 33, medium: 66 },
}) => {
  const { isRTL } = useDirection();

  // Calculate percentage
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const angle = (percentage / 100) * 180; // Half circle

  // Determine color based on percentage
  const getValueColor = () => {
    if (percentage <= thresholds.low) return colors.low;
    if (percentage <= thresholds.medium) return colors.medium;
    return colors.high;
  };

  // Create data for the gauge
  const gaugeData = [
    {
      name: "value",
      value: percentage,
      fill: getValueColor(),
    },
    {
      name: "remaining",
      value: 100 - percentage,
      fill: colors.background,
    },
  ];

  // Background semicircle data
  const backgroundData = [
    {
      name: "background",
      value: 100,
      fill: colors.background,
    },
  ];

  return (
    <ChartContainer config={config} className={className}>
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            {/* Background semicircle */}
            <Pie
              data={backgroundData}
              cx="50%"
              cy="90%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="80%"
              dataKey="value"
            >
              {backgroundData.map((entry, index) => (
                <Cell key={`bg-cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            
            {/* Value arc */}
            <Pie
              data={[{ name: "value", value: percentage, fill: getValueColor() }]}
              cx="50%"
              cy="90%"
              startAngle={180}
              endAngle={180 - angle}
              innerRadius="60%"
              outerRadius="80%"
              dataKey="value"
            >
              <Cell fill={getValueColor()} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center" style={{ marginTop: height * 0.2 }}>
            {title && (
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </h3>
            )}
            <div className="text-3xl font-bold" style={{ color: getValueColor() }}>
              {value.toLocaleString()}{unit}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {percentage.toFixed(1)}% of {max}{unit}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Scale markers */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-between px-8">
          <span className="text-xs text-muted-foreground">{min}{unit}</span>
          <span className="text-xs text-muted-foreground">{Math.round((min + max) / 2)}{unit}</span>
          <span className="text-xs text-muted-foreground">{max}{unit}</span>
        </div>
      </div>
    </ChartContainer>
  );
};
