import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PortfolioItem } from "../../../shared/types";
import { useLibrary } from "../../../contexts/LibraryContext";

interface PhotoCarouselProps {
	onSelect: (item: PortfolioItem) => void;
	onFocusedItem?: (item: PortfolioItem) => void;
}

export const PhotoCarousel: React.FC<PhotoCarouselProps> = ({
	onSelect,
	onFocusedItem,
}) => {
	// Context consumption
	const { processedItems: items } = useLibrary();
	const showColorTags = true;

	const [currentIndex, setCurrentIndex] = useState(0);
	const [direction, setDirection] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const dragStartX = useRef(0);
	const dragCurrentX = useRef(0);

	// Notify parent of focused item
	useEffect(() => {
		const current = items[currentIndex];
		if (current && onFocusedItem) {
			onFocusedItem(current);
		}
	}, [currentIndex, items, onFocusedItem]);

	// Keyboard navigation
	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				handlePrev();
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				handleNext();
			} else if (e.key === "Enter") {
				e.preventDefault();
				const current = items[currentIndex];
				if (current) onSelect(current);
			}
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [currentIndex, items]);

	const handleNext = () => {
		setDirection(1);
		setCurrentIndex((prev) => (prev + 1) % items.length);
	};

	const handlePrev = () => {
		setDirection(-1);
		setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
	};

	const handleDragStart = (e: React.MouseEvent) => {
		setIsDragging(true);
		dragStartX.current = e.clientX;
	};

	const handleDragMove = (e: React.MouseEvent) => {
		if (!isDragging) return;
		dragCurrentX.current = e.clientX;
	};

	const handleDragEnd = () => {
		if (!isDragging) return;
		setIsDragging(false);
		const diff = dragCurrentX.current - dragStartX.current;
		if (Math.abs(diff) > 50) {
			if (diff > 0) handlePrev();
			else handleNext();
		}
	};

	if (items.length === 0) {
		return (
			<div className="h-full flex items-center justify-center">
				<p className="text-gray-500">No items to display</p>
			</div>
		);
	}

	const currentItem = items[currentIndex];
	if (!currentItem) return null;

	const variants = {
		enter: (direction: number) => ({
			x: direction > 0 ? 1000 : -1000,
			opacity: 0,
			scale: 0.8,
		}),
		center: {
			x: 0,
			opacity: 1,
			scale: 1,
		},
		exit: (direction: number) => ({
			x: direction > 0 ? -1000 : 1000,
			opacity: 0,
			scale: 0.8,
		}),
	};

	return (
		<div className="h-screen flex flex-col items-center justify-center px-8 pt-24 pb-0 relative">
			{/* Navigation Buttons */}
			<button
				onClick={handlePrev}
				className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-glass-bg hover:bg-glass-bg-accent border border-glass-border-light transition-colors"
				aria-label="Previous"
			>
				<ChevronLeft size={24} />
			</button>

			<button
				onClick={handleNext}
				className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-glass-bg hover:bg-glass-bg-accent border border-glass-border-light transition-colors"
				aria-label="Next"
			>
				<ChevronRight size={24} />
			</button>

			{/* Carousel Container */}
			<div
				className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
				onMouseDown={handleDragStart}
				onMouseMove={handleDragMove}
				onMouseUp={handleDragEnd}
				onMouseLeave={handleDragEnd}
			>
				<AnimatePresence initial={false} custom={direction} mode="wait">
					<motion.div
						key={currentIndex}
						custom={direction}
						variants={variants}
						initial="enter"
						animate="center"
						exit="exit"
						transition={{
							x: { type: "spring", stiffness: 300, damping: 30 },
							opacity: { duration: 0.2 },
						}}
						className="w-full h-full flex items-center justify-center"
						onClick={() => onSelect(currentItem)}
					>
						<div className="relative max-w-5xl max-h-full">
							<img
								src={currentItem.url}
								alt={currentItem.name}
								className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
							/>

							{/* Color Tag */}
							{showColorTags && currentItem.colorTag && (
								<div
									className="absolute top-4 right-4 w-8 h-8 rounded-full shadow-lg border-2 border-white"
									style={{ backgroundColor: currentItem.colorTag }}
								/>
							)}

							{/* Item Info */}
							<div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6 rounded-b-lg">
								<h3 className="text-white text-xl font-semibold mb-2">
									{currentItem.name}
								</h3>
								{currentItem.aiDescription && (
									<p className="text-gray-300 text-sm mb-2">
										{currentItem.aiDescription}
									</p>
								)}
								<div className="flex gap-2 flex-wrap">
									{currentItem.aiTags?.map((tag) => (
										<span
											key={tag}
											className="px-2 py-1 bg-blue-500/30 text-blue-200 text-xs rounded-full"
										>
											{tag}
										</span>
									))}
								</div>
							</div>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Counter */}
			<div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-glass-bg rounded-full border border-glass-border-light">
				<span className="text-sm text-gray-300">
					{currentIndex + 1} / {items.length}
				</span>
			</div>
		</div>
	);
};
