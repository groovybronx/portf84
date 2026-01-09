import React from 'react';
import { cn } from '../Button';
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'vertical' | 'horizontal';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    { className, direction = 'vertical', spacing = 'md', align = 'stretch', children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          {
            // Direction
            'flex-col': direction === 'vertical',
            'flex-row': direction === 'horizontal',

            // Spacing (using gap)
            'gap-0': spacing === 'none',
            'gap-1': spacing === 'xs',
            'gap-2': spacing === 'sm',
            'gap-4': spacing === 'md',
            'gap-6': spacing === 'lg',
            'gap-8': spacing === 'xl',

            // Alignment
            'items-start': align === 'start',
            'items-center': align === 'center',
            'items-end': align === 'end',
            'items-stretch': align === 'stretch',
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

Stack.displayName = 'Stack';
