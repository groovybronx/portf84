import React, { useEffect, useRef, useMemo, useState } from "react";
import { PortfolioItem } from "../../../shared/types";
import { motion } from "framer-motion";
import { PhotoCard } from "./PhotoCard";
import { useLibrary } from "../../../contexts/LibraryContext";
import { useSelection } from "../../../contexts/SelectionContext";

interface PhotoGridProps {
	onSelect: (item: PortfolioItem) => void;
	onHover?: (item: PortfolioItem | null) => void;
	onContextMenu?: (e: React.MouseEvent, item: PortfolioItem) => void;
	onTagClick?: (tag: string) => void;
	focusedId?: string | null;
	onFocusChange?: (id: string | null) => void;
}

const ITEMS_PER_PAGE = 30;

export const PhotoGrid: React.FC<PhotoGridProps> = ({
	onSelect,
	onHover,
	onContextMenu,
	onTagClick,
	focusedId,
	onFocusChange,
}) => {
	// Context consumption
	const { processedItems: items, gridColumns, selectedTag } = useLibrary();

	const { selectionMode, selectedIds, toggleSelection, registerItemRef } =
		useSelection();

	// Local config
	const showColorTags = true;

	const containerRef = useRef<HTMLDivElement>(null);
	const observerTarget = useRef<HTMLDivElement>(null);

	// Infinite Scroll State
	const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

	// Reset count when source items change significantly (e.g. folder change)
	useEffect(() => {
		setVisibleCount(ITEMS_PER_PAGE);
		// Scroll to top when items are completely swapped out (folder change)
		if (containerRef.current) {
			containerRef.current.scrollTop = 0;
		}
	}, [items]);

	// Intersection Observer for infinite scroll
	useEffect(() => {
		const target = observerTarget.current;
		if (!target) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setVisibleCount((prev: number) =>
						Math.min(prev + ITEMS_PER_PAGE, items.length)
					);
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(target);
		return () => observer.disconnect();
	}, [items.length]);

	// Slice items for display
	const displayedItems = useMemo(() => {
		return items.slice(0, visibleCount);
	}, [items, visibleCount]);

	// --- Logic: Distributed Masonry ---
	const distributedgridColumns = useMemo(() => {
		const cols: PortfolioItem[][] = Array.from(
			{ length: gridColumns },
			() => []
		);
		displayedItems.forEach((item, index) => {
			const targetCol = cols[index % gridColumns];
			if (targetCol) targetCol.push(item);
		});
		return cols;
	}, [displayedItems, gridColumns]);

	// Keyboard Navigation Effect
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!items || items.length === 0) return;
			if (
				document.activeElement?.tagName === "INPUT" ||
				document.activeElement?.tagName === "TEXTAREA"
			)
				return;

			let currentIndex = -1;
			if (focusedId) {
				currentIndex = items.findIndex((item) => item.id === focusedId);
			}

			let nextIndex = currentIndex;

			switch (e.key) {
				case "ArrowRight":
					e.preventDefault();
					if (currentIndex < items.length - 1) {
						nextIndex = currentIndex + 1;
					} else {
						nextIndex = 0;
					}
					break;
				case "ArrowLeft":
					e.preventDefault();
					if (currentIndex > 0) {
						nextIndex = currentIndex - 1;
					} else {
						nextIndex = items.length - 1;
					}
					break;
				case "ArrowUp":
					e.preventDefault();
					nextIndex = Math.max(0, currentIndex - gridColumns);
					break;
				case "ArrowDown":
					e.preventDefault();
					nextIndex = Math.min(items.length - 1, currentIndex + gridColumns);
					break;
				case "Enter":
					e.preventDefault();
					if (currentIndex >= 0) {
						const item = items[currentIndex];
						if (item) {
							onSelect(item);
						}
					}
					break;
				default:
					return;
			}

			if (nextIndex !== currentIndex && nextIndex >= 0) {
				const nextItem = items[nextIndex];
				if (nextItem) {
					onFocusChange?.(nextItem.id);

					// Lazy load if needed
					if (nextIndex >= visibleCount - 5) {
						setVisibleCount((prev: number) => nextIndex + ITEMS_PER_PAGE);
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [items, focusedId, gridColumns, onFocusChange, onSelect, visibleCount]);

	return (
		<div ref={containerRef} className="h-full overflow-y-auto px-8 py-6">
			<motion.div layout className="w-full">
				{/* Flex container holding the gridColumns */}
				<div className="flex gap-4 items-start w-full">
					{distributedgridColumns.map((colItems, colIndex) => (
						<div key={colIndex} className="flex flex-col gap-4 flex-1 min-w-0">
							{colItems.map((item) => {
								const isSelected = selectedIds.has(item.id);
								const isFocused = focusedId === item.id;

								return (
									<PhotoCard
										key={item.id}
										item={item}
										isSelected={isSelected}
										isFocused={isFocused}
										selectionMode={selectionMode}
										showColorTags={showColorTags}
										onSelect={onSelect}
										onToggleSelect={toggleSelection}
										onFocus={(id) => onFocusChange?.(id)}
										onContextMenu={onContextMenu || (() => {})}
										onHover={onHover || (() => {})}
										registerItemRef={registerItemRef}
										onTagClick={onTagClick}
										selectedTag={selectedTag}
									/>
								);
							})}
						</div>
					))}
				</div>
			</motion.div>

			{/* Observer target for infinite scroll */}
			{visibleCount < items.length && (
				<div ref={observerTarget} className="h-10" />
			)}
		</div>
	);
};
