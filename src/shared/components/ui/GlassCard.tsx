import React from "react";
import { cn } from "./Button";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
	variant?: "base" | "accent" | "bordered" | "panel" | "card" | "overlay";
	padding?: "none" | "sm" | "md" | "lg";
	border?: boolean;
	hoverEffect?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
	(
		{
			className,
			variant = "base",
			padding = "md",
			border = true,
			hoverEffect = false,
			children,
			...props
		},
		ref
	) => {
		return (
			<motion.div
				ref={ref}
				className={cn(
					"rounded-xl transition-all duration-200 backdrop-blur-md",
					{
						// Base: Standard glass
						"bg-glass-bg": variant === "base",

						// Accent: Lighter background for interactive cards
						"bg-glass-bg-accent": variant === "accent",

						// Bordered: Transparent but with stronger border
						"bg-transparent": variant === "bordered",

						// Panel: For side drawers and panels
						"bg-glass-bg border-r": variant === "panel",

						// Card: Standard card with padding
						"bg-glass-bg-active": variant === "card",

						// Overlay: Full-screen overlays
						"bg-glass-bg/95 backdrop-blur-lg": variant === "overlay",

						// Border
						"border border-glass-border-light": border && variant !== "panel",
						"border-glass-border": border && variant === "base",

						// Padding
						"p-0": padding === "none",
						"p-2": padding === "sm",
						"p-4": padding === "md",
						"p-6": padding === "lg",

						// Hover Effects
						"hover:bg-glass-bg-active hover:border-glass-border hover:shadow-lg hover:shadow-black/20":
							hoverEffect,
					},
					className
				)}
				{...props}
			>
				{children}
			</motion.div>
		);
	}
);

GlassCard.displayName = "GlassCard";
