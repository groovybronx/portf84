/**
 * usePhotoCardFlip Hook
 * Manages the flip animation state and handlers for PhotoCard
 */
import { useState, useCallback } from "react";
import { PortfolioItem } from "../../../../shared/types";

interface UsePhotoCardFlipOptions {
	item: PortfolioItem;
	selectionMode: boolean;
	onToggleSelect: (id: string) => void;
	onFocus: (id: string) => void;
	onSelect: (item: PortfolioItem) => void;
	onHover: (item: PortfolioItem | null) => void;
	onContextMenu: (e: React.MouseEvent, item: PortfolioItem) => void;
}

interface UsePhotoCardFlipReturn {
	isFlipped: boolean;
	isLoaded: boolean;
	handleFlip: (e: React.MouseEvent) => void;
	handleClick: (e: React.MouseEvent) => void;
	handleDoubleClick: (e: React.MouseEvent) => void;
	handleMouseEnter: () => void;
	handleMouseLeave: () => void;
	handleContextMenu: (e: React.MouseEvent) => void;
	setIsLoaded: (loaded: boolean) => void;
}

export const usePhotoCardFlip = ({
	item,
	selectionMode,
	onToggleSelect,
	onFocus,
	onSelect,
	onHover,
	onContextMenu,
}: UsePhotoCardFlipOptions): UsePhotoCardFlipReturn => {
	const [isFlipped, setIsFlipped] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

	const handleFlip = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		setIsFlipped((prev) => !prev);
	}, []);

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			if (selectionMode) {
				onToggleSelect(item.id);
			} else {
				onFocus(item.id);
			}
		},
		[selectionMode, item.id, onToggleSelect, onFocus]
	);

	const handleDoubleClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			if (!selectionMode) {
				onSelect(item);
			}
		},
		[selectionMode, item, onSelect]
	);

	const handleMouseEnter = useCallback(() => {
		onHover(item);
	}, [item, onHover]);

	const handleMouseLeave = useCallback(() => {
		onHover(null);
		setIsFlipped(false); // Auto-reset flip on leave for better UX
	}, [onHover]);

	const handleContextMenu = useCallback(
		(e: React.MouseEvent) => {
			onContextMenu(e, item);
		},
		[item, onContextMenu]
	);

	return {
		isFlipped,
		isLoaded,
		handleFlip,
		handleClick,
		handleDoubleClick,
		handleMouseEnter,
		handleMouseLeave,
		handleContextMenu,
		setIsLoaded,
	};
};
