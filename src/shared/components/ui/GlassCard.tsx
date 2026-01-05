import React from 'react';
import { cn } from './Button';
import { motion, HTMLMotionProps } from 'framer-motion';

/**
 * GlassCard - Polymorphic glassmorphism card component
 *
 * @example
 * // As a div (default)
 * <GlassCard variant="card" padding="md">Content</GlassCard>
 *
 * @example
 * // As a button
 * <GlassCard as={Button} variant="accent" onClick={handleClick}>
 *   Clickable Card
 * </GlassCard>
 *
 * @example
 * // As a link
 * <GlassCard as="a" href="/path" variant="card">Link Card</GlassCard>
 */
interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'as'> {
  /** Element type to render as. Can be any valid HTML element or React component */
  as?: React.ElementType;
  /** Visual variant of the card */
  variant?: 'base' | 'accent' | 'bordered' | 'panel' | 'card' | 'overlay';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether to show border */
  border?: boolean;
  /** Enable hover effects */
  hoverEffect?: boolean;
}

export const GlassCard = React.forwardRef<HTMLElement, GlassCardProps>(
  (
    {
      as: Component = 'div',
      className,
      variant = 'base',
      padding = 'md',
      border = true,
      hoverEffect = false,
      children,
      ...props
    },
    ref
  ) => {
    const classNames = cn(
      'rounded-xl transition-all duration-200 backdrop-blur-md',
      {
        // Base: Standard glass
        'bg-glass-bg': variant === 'base',

        // Accent: Lighter background for interactive cards
        'bg-glass-bg-accent': variant === 'accent',

        // Bordered: Transparent but with stronger border
        'bg-transparent': variant === 'bordered',

        // Panel: For side drawers and panels
        'bg-glass-bg border-r': variant === 'panel',

        // Card: Standard card with padding
        'bg-glass-bg-active': variant === 'card',

        // Overlay: Full-screen overlays
        'bg-glass-bg/95 backdrop-blur-lg': variant === 'overlay',

        // Border
        'border border-glass-border-light': border && variant !== 'panel',
        'border-glass-border': border && variant === 'base',

        // Padding
        'p-0': padding === 'none',
        'p-2': padding === 'sm',
        'p-4': padding === 'md',
        'p-6': padding === 'lg',

        // Hover Effects
        'hover:bg-glass-bg-active hover:border-glass-border hover:shadow-lg hover:shadow-black/20':
          hoverEffect,
      },
      className
    );

    // Use motion.div and override the element type via 'as' prop
    // When using a custom component (e.g., Button), we skip motion to avoid prop conflicts
    if (Component !== 'div') {
      // Render as custom component without motion
      return (
        <Component ref={ref} className={classNames} {...props}>
          {children}
        </Component>
      );
    }

    // Default: render as motion.div
    return (
      <motion.div ref={ref as any} className={classNames} {...props}>
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
