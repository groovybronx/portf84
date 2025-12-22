import React from "react";
import { cn } from "./Button";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
	variant?: "base" | "accent" | "bordered";
	hoverEffect?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
	(
		{ className, variant = "base", hoverEffect = false, children, ...props },
		ref
	) => {
		return (
			<motion.div
				ref={ref}
				className={cn(
					"rounded-xl border transition-all duration-200 backdrop-blur-md",
					{
						// Base: Standard glass
						"bg-glass-bg border-glass-border": variant === "base",

						// Accent: Lighter background for interactive cards
						"bg-glass-bg-accent border-glass-border-light":
							variant === "accent",

						// Bordered: Transparent but with stronger border
						"bg-transparent border-glass-border": variant === "bordered",

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
