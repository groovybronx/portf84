import React from 'react';
import { cn } from '../Button';
interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'glass';
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = 'horizontal', variant = 'solid', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'shrink-0',
          {
            // Orientation
            'h-px w-full': orientation === 'horizontal',
            'w-px h-full': orientation === 'vertical',

            // Variants
            'bg-white/10': variant === 'solid',
            'border-t border-dashed border-white/10':
              orientation === 'horizontal' && variant === 'dashed',
            'border-l border-dashed border-white/10':
              orientation === 'vertical' && variant === 'dashed',
            'bg-glass-border': variant === 'glass',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';
