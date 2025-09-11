import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { useDirection } from "@/contexts/DirectionContext";

export interface PieChartData {
  name: string;
  value: number;
  fill?: string;
  [key: string]: string | number | undefined;
}

interface PieChartProps {
  data: PieChartData[];
  config: ChartConfig;
  height?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  dataKey?: string;
  nameKey?: string;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--destructive))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--info))",
  "hsl(220 70% 50%)",
  "hsl(280 70% 50%)",
  "hsl(320 70% 50%)",
  "hsl(40 70% 50%)",
];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  config,
  height = 300,
  showTooltip = true,
  showLegend = true,
  className = "",
  innerRadius = 0,
  outerRadius,
  paddingAngle = 2,
  dataKey = "value",
  nameKey = "name",
  colors = DEFAULT_COLORS,
}) => {
  const { isRTL } = useDirection();

  const enhancedData = data.map((item, index) => ({
    ...item,
    fill: item.fill || colors[index % colors.length],
  }));

  const renderCustomTooltip = (props: any) => {
    if (!props.active || !props.payload?.[0]) return null;
    
    const data = props.payload[0];
    const total = enhancedData.reduce((sum, item) => sum + item.value, 0);
    const percentage = ((data.value / total) * 100).toFixed(1);
    
    return (
      <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
        <div className="flex items-center gap-2">
          <div 
            className="h-2.5 w-2.5 rounded-full" 
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="font-medium">{data.payload[nameKey]}</span>
        </div>
        <div className="mt-1">
          <span className="font-mono font-medium tabular-nums">
            {data.value} ({percentage}%)
          </span>
        </div>
      </div>
    );
  };

  return (
    <ChartContainer config={config} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={enhancedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={outerRadius || Math.min(height, 300) / 3}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey={dataKey}
            paddingAngle={paddingAngle}
          >
            {enhancedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          {showTooltip && (
            <ChartTooltip content={renderCustomTooltip} />
          )}
          {showLegend && (
            <Legend 
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "12px",
              }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Donut chart variant
export const DonutChart: React.FC<PieChartProps> = (props) => (
  <PieChart {...props} innerRadius={60} />
);
