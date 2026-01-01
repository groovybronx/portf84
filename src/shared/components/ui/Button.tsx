import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

// Utility for merging tailwind classes safely
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost" | "danger" | "glass" | "glass-icon" | "close" | "nav-arrow";
	size?: "sm" | "md" | "lg" | "icon" | "icon-lg" | "icon-sm";
	isLoading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant = "primary",
			size = "md",
			isLoading = false,
			leftIcon,
			rightIcon,
			children,
			disabled,
			...props
		},
		ref
	) => {
		return (
			<button
				ref={ref}
				disabled={disabled || isLoading}
				className={cn(
					// Base styles
					"inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none active:scale-95",

					// Variants
					{
						"bg-primary text-white hover:bg-primary/80 shadow-lg shadow-primary/20 border border-primary/50":
							variant === "primary",
						"bg-white/10 text-white hover:bg-white/20 border border-white/10":
							variant === "secondary",
						"bg-transparent text-gray-400 hover:text-white hover:bg-white/5":
							variant === "ghost",
						"bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20":
							variant === "danger",
						"bg-glass-bg text-white border border-glass-border-light hover:bg-glass-bg-active hover:border-glass-border backdrop-blur-md":
							variant === "glass",
						"p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors border-none":
							variant === "glass-icon",
						"p-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-colors border-none":
							variant === "close",
						"p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10":
							variant === "nav-arrow",
					},

					// Sizes
					{
						"h-8 px-3 text-xs": size === "sm",
						"h-10 px-4 text-sm": size === "md",
						"h-12 px-6 text-base": size === "lg",
						"h-9 w-9 p-0": size === "icon",
						"h-11 w-11 p-0": size === "icon-lg",
						"h-7 w-7 p-0": size === "icon-sm",
					},

					className
				)}
				{...props}
			>
				{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				{!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
				{children}
				{!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
			</button>
		);
	}
);

Button.displayName = "Button";
