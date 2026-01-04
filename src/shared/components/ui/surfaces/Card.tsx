import React from "react";
import { cn } from "../Button";
import { GlassCard } from "../GlassCard";

interface CardProps extends Omit<React.ComponentProps<typeof GlassCard>, "variant" | "padding"> {
	variant?: "default" | "interactive";
	padding?: "none" | "sm" | "md" | "lg";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
	(
		{ className, variant = "default", padding = "md", children, ...props },
		ref
	) => {
		return (
			<GlassCard
				ref={ref}
				variant={variant === "interactive" ? "accent" : "card"}
				padding={padding}
				hoverEffect={variant === "interactive"}
				className={cn("rounded-xl", className)}
				{...props}
			>
				{children}
			</GlassCard>
		);
	}
);

Card.displayName = "Card";
