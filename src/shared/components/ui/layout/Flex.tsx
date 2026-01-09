import React from 'react';
import { cn } from '../Button';
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      direction = 'row',
      wrap = 'nowrap',
      justify = 'start',
      align = 'start',
      gap = 'md',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          {
            // Direction
            'flex-row': direction === 'row',
            'flex-col': direction === 'col',
            'flex-row-reverse': direction === 'row-reverse',
            'flex-col-reverse': direction === 'col-reverse',

            // Wrap
            'flex-wrap': wrap === 'wrap',
            'flex-nowrap': wrap === 'nowrap',
            'flex-wrap-reverse': wrap === 'wrap-reverse',

            // Justify
            'justify-start': justify === 'start',
            'justify-center': justify === 'center',
            'justify-end': justify === 'end',
            'justify-between': justify === 'between',
            'justify-around': justify === 'around',
            'justify-evenly': justify === 'evenly',

            // Align
            'items-start': align === 'start',
            'items-center': align === 'center',
            'items-end': align === 'end',
            'items-stretch': align === 'stretch',
            'items-baseline': align === 'baseline',

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

Flex.displayName = 'Flex';
