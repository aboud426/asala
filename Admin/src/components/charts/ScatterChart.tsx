import React from "react";
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { useDirection } from "@/contexts/DirectionContext";

export interface ScatterChartData {
  x: number;
  y: number;
  z?: number;
  [key: string]: string | number | undefined;
}

interface ScatterProps {
  dataKey: string;
  data: ScatterChartData[];
  fill: string;
  name?: string;
}

interface ScatterChartProps {
  data?: ScatterChartData[];
  config: ChartConfig;
  height?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  scatters?: ScatterProps[];
  showGrid?: boolean;
  showReferenceLines?: boolean;
  xDomain?: [number, number] | ['dataMin', 'dataMax'];
  yDomain?: [number, number] | ['dataMin', 'dataMax'];
}

export const ScatterChart: React.FC<ScatterChartProps> = ({
  data = [],
  config,
  height = 400,
  showTooltip = true,
  showLegend = true,
  className = "",
  xAxisLabel,
  yAxisLabel,
  scatters = [],
  showGrid = true,
  showReferenceLines = false,
  xDomain,
  yDomain,
}) => {
  const { isRTL } = useDirection();

  // Use provided scatters or create default from data
  const scatterData = scatters.length > 0 ? scatters : [
    {
      dataKey: "default",
      data: data,
      fill: "hsl(var(--primary))",
      name: "Data Points"
    }
  ];

  const renderCustomTooltip = (props: any) => {
    if (!props.active || !props.payload?.[0]) return null;
    
    const data = props.payload[0].payload;
    
    return (
      <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">X:</span>
            <span className="font-mono tabular-nums">{data.x}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Y:</span>
            <span className="font-mono tabular-nums">{data.y}</span>
          </div>
          {data.z !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Z:</span>
              <span className="font-mono tabular-nums">{data.z}</span>
            </div>
          )}
          {Object.entries(data).map(([key, value]) => {
            if (key !== 'x' && key !== 'y' && key !== 'z' && typeof value === 'string') {
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-medium">{key}:</span>
                  <span>{value}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  return (
    <ChartContainer config={config} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis
            type="number"
            dataKey="x"
            name="x"
            domain={xDomain}
            className="text-xs fill-muted-foreground"
            label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="y"
            domain={yDomain}
            className="text-xs fill-muted-foreground"
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
          />
          {scatterData.map((scatter, index) => (
            <Scatter
              key={index}
              name={scatter.name || scatter.dataKey}
              data={scatter.data}
              fill={scatter.fill}
            />
          ))}
          {showReferenceLines && (
            <>
              <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
            </>
          )}
          {showTooltip && (
            <ChartTooltip content={renderCustomTooltip} />
          )}
          {showLegend && scatterData.length > 1 && (
            <Legend 
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "12px",
              }}
            />
          )}
        </RechartsScatterChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
