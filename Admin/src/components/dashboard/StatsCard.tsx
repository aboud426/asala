import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  gradient = false,
}) => {
  return (
    <Card className={cn(
      'hover-lift transition-smooth border-0 shadow-elegant',
      gradient && 'gradient-primary text-primary-foreground'
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={cn(
              'text-sm font-medium',
              gradient ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}>
              {title}
            </p>
            <p className={cn(
              'text-2xl font-bold mt-2',
              gradient ? 'text-primary-foreground' : 'text-foreground'
            )}>
              {value}
            </p>
            <p className={cn(
              'text-sm mt-2 flex items-center gap-1',
              gradient ? 'text-primary-foreground/80' : changeType === 'positive' 
                ? 'text-success' 
                : changeType === 'negative' 
                  ? 'text-destructive' 
                  : 'text-muted-foreground'
            )}>
              {change}
            </p>
          </div>
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            gradient 
              ? 'bg-white/20 text-primary-foreground' 
              : 'bg-primary/10 text-primary'
          )}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};