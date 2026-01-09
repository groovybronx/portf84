import React from 'react';
import { cn } from '../Button';
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
  padding?: boolean;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth = 'xl', centered = true, padding = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          {
            // Max width
            'max-w-screen-sm': maxWidth === 'sm',
            'max-w-screen-md': maxWidth === 'md',
            'max-w-screen-lg': maxWidth === 'lg',
            'max-w-screen-xl': maxWidth === 'xl',
            'max-w-screen-2xl': maxWidth === '2xl',
            'max-w-full': maxWidth === 'full',

            // Centered
            'mx-auto': centered,

            // Padding
            'px-4 sm:px-6 lg:px-8': padding,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
