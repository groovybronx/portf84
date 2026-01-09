import React from 'react';
import { cn } from './Button';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, error, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full group">
        {leftIcon && (
          <div className="absolute left-3 text-gray-500 group-focus-within:text-blue-400 transition-colors pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          className={cn(
            'w-full bg-glass-bg-accent border border-glass-border-light rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 transition-all outline-none',
            'focus:bg-glass-bg-active focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            {
              'pl-10': !!leftIcon,
              'pr-10': !!rightIcon,
              'border-red-500/50 focus:border-red-500 focus:ring-red-500/20': error,
            },
            className
          )}
          {...props}
        />

        {rightIcon && <div className="absolute right-3 text-gray-500">{rightIcon}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const SearchInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <Input ref={ref} leftIcon={<Search size={16} />} placeholder="Search..." {...props} />;
});
SearchInput.displayName = 'SearchInput';
