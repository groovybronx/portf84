import React from 'react';
import { cn } from '../Button';
import { GlassCard } from '../GlassCard';
interface PanelProps extends Omit<React.ComponentProps<typeof GlassCard>, 'variant' | 'padding'> {
  side?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg';
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, side = 'left', width = 'md', children, ...props }, ref) => {
    return (
      <GlassCard
        ref={ref}
        variant="panel"
        padding="none"
        className={cn(
          'h-full',
          {
            // Side
            'border-r': side === 'left',
            'border-l': side === 'right',

            // Width
            'w-64': width === 'sm',
            'w-80': width === 'md',
            'w-96': width === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </GlassCard>
    );
  }
);

Panel.displayName = 'Panel';
