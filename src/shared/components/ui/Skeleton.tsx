import React from 'react';
import { cn } from './Button';

interface SkeletonProps {
  className?: string | undefined;
  variant?: 'default' | 'circle' | 'text' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number; // For text variant
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-gray-800 rounded-lg';

  const variantClasses = {
    default: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
    card: 'rounded-xl',
  };

  const combinedClassName = cn(baseClasses, variantClasses[variant], className);

  const style = {
    width: width || (variant === 'circle' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, variantClasses.text, i === lines - 1 ? 'w-3/4' : 'w-full')}
            style={style}
          />
        ))}
      </div>
    );
  }

  return <div className={combinedClassName} style={style} />;
};

// Specialized skeleton components
export const CardSkeleton: React.FC<{ className?: string | undefined }> = ({ className }) => (
  <Skeleton variant="card" className={cn('aspect-square', className)} />
);

export const TextSkeleton: React.FC<{ lines?: number; className?: string | undefined }> = ({
  lines = 3,
  className,
}) => <Skeleton variant="text" lines={lines} className={className} />;

export const AvatarSkeleton: React.FC<{
  size?: string | number;
  className?: string | undefined;
}> = ({ size = 40, className }) => (
  <Skeleton variant="circle" width={size} height={size} className={className} />
);
