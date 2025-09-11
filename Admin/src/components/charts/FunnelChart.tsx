import React from "react";
import {
  ChartContainer,
  ChartConfig,
} from "@/components/ui/chart";
import { useDirection } from "@/contexts/DirectionContext";

export interface FunnelChartData {
  name: string;
  value: number;
  fill?: string;
  nameAr?: string;
}

interface FunnelChartProps {
  data: FunnelChartData[];
  config: ChartConfig;
  height?: number;
  className?: string;
  showTooltip?: boolean;
  colors?: string[];
  showPercentages?: boolean;
  showValues?: boolean;
}

const DEFAULT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--info))",
];

export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  config,
  height = 400,
  className = "",
  showTooltip = true,
  colors = DEFAULT_COLORS,
  showPercentages = true,
  showValues = true,
}) => {
  const { isRTL } = useDirection();

  const maxValue = Math.max(...data.map(item => item.value));
  const totalSteps = data.length;

  return (
    <ChartContainer config={config} className={className}>
      <div className="relative w-full" style={{ height }}>
        <svg width="100%" height="100%" viewBox="0 0 400 400" className="overflow-visible">
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            const width = (percentage / 100) * 300; // Max width of 300
            const y = (index * (380 / totalSteps)) + 10;
            const stepHeight = Math.max(50, (380 / totalSteps) - 10);
            const x = (400 - width) / 2; // Center the trapezoid
            
            // Calculate next step width for trapezoid
            const nextWidth = index < data.length - 1 
              ? ((data[index + 1].value / maxValue) * 300)
              : width * 0.8; // Make last step taper
            const nextX = (400 - nextWidth) / 2;
            
            const color = item.fill || colors[index % colors.length];
            
            // Create trapezoid path
            const path = `M ${x} ${y} 
                         L ${x + width} ${y} 
                         L ${nextX + nextWidth} ${y + stepHeight} 
                         L ${nextX} ${y + stepHeight} Z`;
            
            return (
              <g key={index}>
                {/* Funnel step */}
                <path
                  d={path}
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                  opacity={0.8}
                  className="transition-opacity hover:opacity-100 cursor-pointer"
                />
                
                {/* Labels */}
                <text
                  x={200} // Center
                  y={y + stepHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white text-sm font-medium"
                  style={{ fontSize: '12px' }}
                >
                  {isRTL ? item.nameAr || item.name : item.name}
                </text>
                
                {/* Value and percentage */}
                <text
                  x={200}
                  y={y + stepHeight / 2 + 16}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white text-xs"
                  style={{ fontSize: '10px' }}
                >
                  {showValues && `${item.value.toLocaleString()}`}
                  {showValues && showPercentages && " • "}
                  {showPercentages && `${percentage.toFixed(1)}%`}
                </text>
                
                {/* Conversion rate arrow (except for last item) */}
                {index < data.length - 1 && (
                  <>
                    <line
                      x1={200}
                      y1={y + stepHeight + 5}
                      x2={200}
                      y2={y + stepHeight + 15}
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    <text
                      x={220}
                      y={y + stepHeight + 12}
                      className="fill-muted-foreground text-xs"
                      style={{ fontSize: '10px' }}
                    >
                      {((data[index + 1].value / item.value) * 100).toFixed(1)}%
                    </text>
                  </>
                )}
              </g>
            );
          })}
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="0"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="hsl(var(--muted-foreground))"
              />
            </marker>
          </defs>
        </svg>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {data.map((item, index) => {
            const color = item.fill || colors[index % colors.length];
            const conversionRate = index > 0 
              ? ((item.value / data[index - 1].value) * 100).toFixed(1)
              : "100.0";
            
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium">
                  {isRTL ? item.nameAr || item.name : item.name}
                </span>
                <span className="text-muted-foreground">
                  ({conversionRate}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </ChartContainer>
  );
};
