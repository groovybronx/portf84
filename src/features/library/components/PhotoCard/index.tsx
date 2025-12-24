/**
 * PhotoCard Component
 * Interactive flip card for displaying portfolio items
 * 
 * Decomposed into sub-components:
 * - PhotoCardFront: Front face with image and overlay
 * - PhotoCardBack: Back face with metadata and tags
 * - PhotoCardBadges: Color tags and selection indicators
 * - usePhotoCardFlip: Animation and interaction logic
 */
import React from "react";
import { motion } from "framer-motion";
import { PortfolioItem, Folder, Collection } from "../../../../shared/types";
import { PhotoCardFront } from "./PhotoCardFront";
import { PhotoCardBack } from "./PhotoCardBack";
import { usePhotoCardFlip } from "./usePhotoCardFlip";

export interface PhotoCardProps {
	item: PortfolioItem;
	isSelected: boolean;
	isFocused: boolean;
	selectionMode: boolean;
	showColorTags: boolean;
	onSelect: (item: PortfolioItem) => void;
	onToggleSelect: (id: string) => void;
	onFocus: (id: string) => void;
	onContextMenu: (e: React.MouseEvent, item: PortfolioItem) => void;
	onHover: (item: PortfolioItem | null) => void;
	registerItemRef?: (id: string, el: HTMLElement | null) => void;
	onTagClick?: (tag: string) => void;
	selectedTag?: string | null;
	folders?: Folder[];
	collections?: Collection[];
}

const PhotoCardComponent: React.FC<PhotoCardProps> = ({
	item,
	isSelected,
	isFocused,
	selectionMode,
	showColorTags,
	onSelect,
	onToggleSelect,
	onFocus,
	onContextMenu,
	onHover,
	registerItemRef,
	onTagClick,
	selectedTag,
	folders = [],
}) => {
	const {
		isFlipped,
		isLoaded,
		handleFlip,
		handleClick,
		handleDoubleClick,
		handleMouseEnter,
		handleMouseLeave,
		handleContextMenu,
		setIsLoaded,
	} = usePhotoCardFlip({
		item,
		selectionMode,
		onToggleSelect,
		onFocus,
		onSelect,
		onHover,
		onContextMenu,
	});

	return (
		<div
			ref={(el) => registerItemRef?.(item.id, el)}
			data-item-id={item.id}
			className="relative perspective-1000 group cursor-pointer"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
			onDoubleClick={handleDoubleClick}
			onContextMenu={handleContextMenu}
		>
			<motion.div
				animate={{ rotateY: isFlipped ? 180 : 0 }}
				transition={{
					duration: 0.5,
					ease: [0.4, 0, 0.2, 1],
				}}
				style={{ transformStyle: "preserve-3d" }}
				className={`relative w-full transition-all duration-300 rounded-xl ${
					isSelected
						? "border-[3px] border-white shadow-xl z-10"
						: isFocused
						? "border-[3px] border-white/80 z-10 scale-[1.02]"
						: "border-0"
				}`}
			>
				{/* Front Face */}
				<PhotoCardFront
					item={item}
					isLoaded={isLoaded}
					isFocused={isFocused}
					isFlipped={isFlipped}
					isSelected={isSelected}
					selectionMode={selectionMode}
					showColorTags={showColorTags}
					onLoad={() => setIsLoaded(true)}
					onFlip={handleFlip}
				/>

				{/* Back Face */}
				<PhotoCardBack
					item={item}
					folders={folders}
					selectedTag={selectedTag}
					onFlip={handleFlip}
					onTagClick={onTagClick}
				/>
			</motion.div>
		</div>
	);
};

// Memoized export with custom comparison
export const PhotoCard = React.memo(PhotoCardComponent, (prev, next) => {
	return (
		prev.item === next.item &&
		prev.isSelected === next.isSelected &&
		prev.isFocused === next.isFocused &&
		prev.selectionMode === next.selectionMode &&
		prev.showColorTags === next.showColorTags &&
		prev.selectedTag === next.selectedTag
	);
});

// Re-export sub-components for potential direct use
export { PhotoCardFront } from "./PhotoCardFront";
export { PhotoCardBack } from "./PhotoCardBack";
export { PhotoCardBadges } from "./PhotoCardBadges";
export { usePhotoCardFlip } from "./usePhotoCardFlip";
