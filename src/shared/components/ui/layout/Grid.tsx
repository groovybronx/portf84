import React from 'react';
import { cn } from '../Button';

import { logger } from '../../../../../shared/utils/logger';
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 2, gap = 'md', responsive = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          {
            // Columns
            'grid-cols-1': cols === 1,
            'grid-cols-2': cols === 2 && !responsive,
            'grid-cols-3': cols === 3 && !responsive,
            'grid-cols-4': cols === 4 && !responsive,
            'grid-cols-5': cols === 5 && !responsive,
            'grid-cols-6': cols === 6 && !responsive,
            'grid-cols-12': cols === 12 && !responsive,
            'grid-cols-[repeat(auto-fill,minmax(200px,1fr))]': cols === 'auto',

            // Responsive defaults
            'grid-cols-1 sm:grid-cols-2': cols === 2 && responsive,
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': cols === 3 && responsive,
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4': cols === 4 && responsive,
            'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5': cols === 5 && responsive,
            'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6': cols === 6 && responsive,
            'grid-cols-4 sm:grid-cols-8 lg:grid-cols-12': cols === 12 && responsive,

            // Gap
            'gap-1': gap === 'xs',
            'gap-2': gap === 'sm',
            'gap-4': gap === 'md',
            'gap-6': gap === 'lg',
            'gap-8': gap === 'xl',
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

Grid.displayName = 'Grid';
