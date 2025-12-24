/**
 * PhotoCardFront Component
 * Front face of the card showing the image and overlay info
 */
import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { PortfolioItem } from "../../../../shared/types";
import { GlassCard } from "../../../../shared/components/ui";
import { PhotoCardBadges } from "./PhotoCardBadges";

interface PhotoCardFrontProps {
	item: PortfolioItem;
	isLoaded: boolean;
	isFocused: boolean;
	isFlipped: boolean;
	isSelected: boolean;
	selectionMode: boolean;
	showColorTags: boolean;
	onLoad: () => void;
	onFlip: (e: React.MouseEvent) => void;
}

export const PhotoCardFront: React.FC<PhotoCardFrontProps> = ({
	item,
	isLoaded,
	isFocused,
	isFlipped,
	isSelected,
	selectionMode,
	showColorTags,
	onLoad,
	onFlip,
}) => {
	return (
		<GlassCard
			className="backface-hidden overflow-hidden h-full group border-0 bg-gray-900/50"
			variant="accent"
			style={{
				backfaceVisibility: "hidden",
				WebkitBackfaceVisibility: "hidden",
			}}
		>
			{/* Skeleton Loader */}
			{!isLoaded && (
				<div className="absolute inset-0 bg-white/5 animate-pulse z-0" />
			)}

			{/* Image */}
			<motion.img
				src={item.url}
				alt={item.name}
				className={`w-full h-auto object-cover transition-transform duration-700 ${
					!selectionMode ? "group-hover:scale-105" : ""
				}`}
				loading="lazy"
				initial={{ opacity: 0 }}
				animate={{ opacity: isLoaded ? 1 : 0 }}
				transition={{ duration: 0.4 }}
				onLoad={onLoad}
			/>

			{/* Badges (color tag, selection) */}
			<PhotoCardBadges
				colorTag={item.colorTag}
				showColorTags={showColorTags}
				selectionMode={selectionMode}
				isSelected={isSelected}
			/>

			{/* Hover Overlay */}
			{!selectionMode && (
				<div
					className={`absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 flex flex-col justify-end p-4 ${
						isFocused || isFlipped
							? "opacity-100"
							: "opacity-0 group-hover:opacity-100"
					}`}
				>
					<div className="flex items-center justify-between gap-2 overflow-hidden">
						<div className="min-w-0">
							<p className="text-white text-sm font-medium truncate">
								{item.name}
							</p>
							<p className="text-white/60 text-xs uppercase tracking-wider">
								{(item.size / 1024 / 1024).toFixed(2)} MB
							</p>
						</div>
						<button
							onClick={onFlip}
							className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors border border-white/10"
							title="View Info"
						>
							<Info size={16} />
						</button>
					</div>
				</div>
			)}
		</GlassCard>
	);
};
