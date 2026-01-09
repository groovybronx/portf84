import React from 'react';
import { cn } from '../Button';
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-colors',
          {
            // Variants
            'bg-white/10 text-white border border-white/20': variant === 'default',
            'bg-primary/20 text-primary border border-primary/30': variant === 'primary',
            'bg-secondary/20 text-secondary border border-secondary/30': variant === 'secondary',
            'bg-green-500/20 text-green-400 border border-green-500/30': variant === 'success',
            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30': variant === 'warning',
            'bg-red-500/20 text-red-400 border border-red-500/30': variant === 'danger',

            // Sizes
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-1 text-sm': size === 'md',
            'px-3 py-1.5 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
