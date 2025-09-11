import React from "react";
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { useDirection } from "@/contexts/DirectionContext";

export interface RadarChartData {
  subject: string;
  [key: string]: string | number;
}

interface RadarChartProps {
  data: RadarChartData[];
  config: ChartConfig;
  height?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
  radarProps?: Array<{
    dataKey: string;
    stroke: string;
    fill: string;
    fillOpacity?: number;
    strokeWidth?: number;
  }>;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  config,
  height = 400,
  showTooltip = true,
  showLegend = true,
  className = "",
  radarProps = [],
}) => {
  const { isRTL } = useDirection();

  const renderCustomTooltip = (props: any) => {
    if (!props.active || !props.payload) return null;
    
    return (
      <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
        <div className="font-medium mb-1">{props.label}</div>
        {props.payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="h-2.5 w-2.5 rounded-full" 
              style={{ backgroundColor: entry.stroke }}
            />
            <span className="font-medium">{entry.dataKey}:</span>
            <span className="font-mono tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ChartContainer config={config} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: 12 }}
            className="fill-foreground"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 'dataMax']}
            tick={{ fontSize: 10 }}
            className="fill-muted-foreground"
          />
          {radarProps.map((radar, index) => (
            <Radar
              key={index}
              name={radar.dataKey}
              dataKey={radar.dataKey}
              stroke={radar.stroke}
              fill={radar.fill}
              fillOpacity={radar.fillOpacity || 0.3}
              strokeWidth={radar.strokeWidth || 2}
            />
          ))}
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
        </RechartsRadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
