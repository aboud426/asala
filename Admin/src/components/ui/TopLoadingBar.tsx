import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { cn } from '@/lib/utils';

interface TopLoadingBarProps {
  className?: string;
}

export const TopLoadingBar: React.FC<TopLoadingBarProps> = ({ className }) => {
  const { isLoading, progress } = useLoading();

  if (!isLoading) return null;

  return (
    <div className={cn('fixed top-0 left-0 right-0 z-[9999]', className)}>
      {/* Main progress bar */}
      <div className="h-1 bg-gradient-to-r from-primary/20 to-primary/10 overflow-hidden loading-bar-container">
        <div
          className={cn(
            'h-full loading-progress relative',
            'bg-gradient-to-r from-primary via-primary-light to-primary',
            'transform-gpu loading-bar-glow'
          )}
          style={{
            width: `${progress}%`,
            transformOrigin: 'left center',
          }}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent loading-bar-pulse" />
          
          {/* Glowing trail effect */}
          <div 
            className={cn(
              'absolute right-0 top-0 bottom-0 w-24',
              'bg-gradient-to-l from-primary-light/80 via-primary/60 to-transparent',
              'blur-sm transform translate-x-2 loading-bar-shimmer'
            )}
          />

          {/* Sweeping highlight */}
          <div 
            className={cn(
              'absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent',
              'loading-bar-sweep opacity-60'
            )}
          />
        </div>
      </div>

      {/* Secondary glow effect */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-60">
        <div
          className="h-full bg-gradient-to-r from-primary/60 to-primary-light/60 loading-progress blur-[1px] loading-bar-pulse"
          style={{
            width: `${Math.min(progress + 10, 100)}%`,
          }}
        />
      </div>

      {/* Subtle shadow beneath */}
      <div 
        className={cn(
          'h-2 bg-gradient-to-b from-primary/5 to-transparent',
          'transition-opacity duration-300'
        )}
        style={{
          opacity: progress > 5 ? 0.3 : 0,
        }}
      />
    </div>
  );
};
