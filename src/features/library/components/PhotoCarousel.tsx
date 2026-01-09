import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../shared/components/ui";
import { motion } from "framer-motion";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PortfolioItem } from "../../../shared/types";
import { useLibrary } from "../../../shared/contexts/LibraryContext";
import { LoadingSpinner } from "../../../shared/components/ui/LoadingSpinner";

import { logger } from '../../../shared/utils/logger';
interface PhotoCarouselProps {
	onSelect: (item: PortfolioItem) => void;
	onFocusedItem?: (item: PortfolioItem) => void;
}

// ... (interfaces remain the same)

export const PhotoCarousel: React.FC<PhotoCarouselProps> = ({
	onSelect,
	onFocusedItem,
}) => {
	// --- État et Initialisation ---
	const { t } = useTranslation("common");
	const { processedItems: items } = useLibrary();
	const showColorTags = true;

	const [currentIndex, setCurrentIndex] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [loadedItems, setLoadedItems] = useState<Set<string>>(new Set());
	
	const dragStartX = useRef(0);
	const dragCurrentX = useRef(0);

	/**
	 * Déchargement des images hors du viewport pour libérer la mémoire.
	 * Les images avec offset > 2 sont déchargées.
	 */
	useEffect(() => {
		const imagesToUnload = items
			.filter((_, idx) => Math.abs(idx - currentIndex) > 2)
			.slice(0, 10); // Limiter pour éviter trop d'opérations

		imagesToUnload.forEach(item => {
			const imgElements = document.querySelectorAll(`img[data-item-id="${item.id}"]`);
			imgElements.forEach(img => {
				if (img instanceof HTMLImageElement && img.src) {
					// Vider le src pour forcer le garbage collection
					img.src = '';
				}
			});
		});
	}, [currentIndex, items]);

	/**
	 * Synchronise l'item au focus avec le parent.
	 */
	useEffect(() => {
		const current = items[currentIndex];
		if (current && onFocusedItem) {
			onFocusedItem(current);
		}
	}, [currentIndex, items, onFocusedItem]);

	/**
	 * Gestion de la navigation clavier globale.
	 */
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

	// --- Handlers de Navigation ---

	const handleNext = () => {
		setCurrentIndex((prev) => (prev + 1) % items.length);
	};

	const handlePrev = () => {
		setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
	};

	// --- Handlers de Gestes (Drag) ---

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

	// --- Calcul des images visibles ---

	/**
	 * Retourne les indices des 5 images à afficher (centrale + 2 de chaque côté)
	 */
	const getVisibleIndices = () => {
		const indices = [];
		for (let offset = -2; offset <= 2; offset++) {
			const index = (currentIndex + offset + items.length) % items.length;
			indices.push({ index, offset });
		}
		return indices;
	};

	// --- Rendu conditionnel ---

	if (items.length === 0) {
		return (
			<div className="h-full flex items-center justify-center">
				<p className="text-gray-500">Aucun élément à afficher</p>
			</div>
		);
	}

	const visibleItems = getVisibleIndices();

	return (
		<div className="h-screen flex flex-col items-center justify-center px-8 pt-24 pb-0 relative">
			{/* Boutons de navigation flottants */}
			<Button
				onClick={handlePrev}
				variant="nav-arrow"
				size="icon-lg"
				className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
				aria-label={t("previous")}
			>
				<ChevronLeft size={24} />
			</Button>

			<Button
				onClick={handleNext}
				variant="nav-arrow"
				size="icon-lg"
				className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
				aria-label={t("next")}
			>
				<ChevronRight size={24} />
			</Button>

			{/* Zone interactive du carrousel */}
			<div
				className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing relative"
				onMouseDown={handleDragStart}
				onMouseMove={handleDragMove}
				onMouseUp={handleDragEnd}
				onMouseLeave={handleDragEnd}
			>
				{visibleItems.map(({ index, offset }) => {
					const item = items[index];
					if (!item) return null;
					
					const isCurrent = offset === 0;
					
					/**
					 * PARAMÈTRES D'ANIMATION LINÉAIRE
					 * Les images arrivent depuis les bords et glissent horizontalement.
					 * - offset négatif : images à gauche (hors écran ou visibles)
					 * - offset 0 : image centrale
					 * - offset positif : images à droite (hors écran ou visibles)
					 */
					const scale = isCurrent ? 1 : Math.abs(offset) === 1 ? 0.7 : 0.5;
					const opacity = isCurrent ? 1 : Math.abs(offset) === 1 ? 0.9 : 0.3;
					const zIndex = isCurrent ? 10 : 10 - Math.abs(offset);
					
					// Position basée sur l'offset : effet de défilement linéaire
					const basePosition = offset * 400; // Espacement entre images
					const xPosition = basePosition;
					
					// Position initiale pour les nouvelles images (hors écran)
					const initialX = offset > 0 ? 1200 : offset < 0 ? -1200 : 0;

					return (
						<motion.div
							key={index}
							initial={{ x: initialX, scale, opacity: 0 }}
							animate={{
								x: xPosition,
								scale,
								opacity,
								zIndex,
							}}
							exit={{ x: offset > 0 ? 1200 : -1200, opacity: 0 }}
							transition={{
								x: { type: "tween", duration: 0.5, ease: [0.4, 0, 0.2, 1] },
								scale: { type: "tween", duration: 0.5, ease: [0.4, 0, 0.2, 1] },
								opacity: { type: "tween", duration: 0.3, ease: "easeOut" },
							}}
							className="absolute flex items-center justify-center"
							onClick={() => {
								if (isCurrent) {
									onSelect(item);
								} else {
									setCurrentIndex(index);
								}
							}}
						>
							<div className="relative max-w-3xl max-h-full flex items-center justify-center">
                                {/* Loader */}
                                {!loadedItems.has(item.id) && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <LoadingSpinner size={isCurrent ? "xl" : "md"} variant="white" />
                                    </div>
                                )}

								<img
									src={item.url}
									alt={item.name}
									data-item-id={item.id}
									loading="lazy"
									decoding="async"
									className={`max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
                                        loadedItems.has(item.id) ? "opacity-100" : "opacity-0"
                                    }`}
									style={{
										filter: isCurrent ? "none" : "brightness(1)",
									}}
                                    onLoad={() => {
                                        setLoadedItems(prev => {
                                            const newSet = new Set(prev);
                                            newSet.add(item.id);
                                            return newSet;
                                        });
                                    }}
								/>

								{isCurrent && showColorTags && item.colorTag && (
									<div
										className="absolute top-4 right-4 w-4 h-4 rounded-full shadow-lg border-2 border-text-primary"
										style={{ backgroundColor: item.colorTag }}
									/>
								)}

								{isCurrent && (
									<div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 	to-transparent p-6 rounded-b-lg">
										<h3 className="text-text-primary text-sm font-light mb-2 wrap-break-words">
											{item.name}
										</h3>
										{item.aiDescription && (
											<p className="text-gray-300 text-sm mb-2">
												{item.aiDescription}
											</p>
										)}
										<div className="flex gap-2 flex-wrap">
											{item.aiTags?.map((tag: string) => (
												<span
													key={tag}
													className="px-2 py-1 bg-primary/30 text-primary text-xs rounded-full"
												>
													{tag}
												</span>
											))}
										</div>
									</div>
								)}
							</div>
						</motion.div>
					);
				})}
			</div>

			{/* Scrubber Interactif */}
			<div 
				className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 group"
				onMouseDown={(e) => {
					e.stopPropagation(); // Empêcher le conflit avec le drag de l'image
					const rect = e.currentTarget.getBoundingClientRect();
					const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
					const percentage = x / rect.width;
					const newIndex = Math.floor(percentage * items.length);
					setCurrentIndex(Math.min(items.length - 1, Math.max(0, newIndex)));

					// Démarrer le drag global pour ce scrubber
					const handleMouseMove = (moveEvent: MouseEvent) => {
						const moveX = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
						const movePercentage = moveX / rect.width;
						const moveIndex = Math.floor(movePercentage * items.length);
						setCurrentIndex(Math.min(items.length - 1, Math.max(0, moveIndex)));
					};

					const handleMouseUp = () => {
						window.removeEventListener("mousemove", handleMouseMove);
						window.removeEventListener("mouseup", handleMouseUp);
					};

					window.addEventListener("mousemove", handleMouseMove);
					window.addEventListener("mouseup", handleMouseUp);
				}}
			>
				{/* Zone sensible élargie pour faciliter l'interaction */}
				<div className="w-64 h-8 flex items-center justify-center cursor-pointer">
					{/* Track background */}
					<div className="w-full h-1 bg-text-primary/20 rounded-full overflow-hidden relative group-hover:h-1.5 transition-all duration-300">
						{/* Progress Bar */}
						<div 
							className="absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-75 ease-linear"
							style={{ 
								width: `${((currentIndex + 1) / items.length) * 100}%` 
							}}
						/>
					</div>
					
					{/* Thumb (visible uniquement au hover ou drag) */}
					<div 
						className="absolute h-3 w-3 bg-text-primary rounded-full shadow-lg transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
						style={{ 
							left: `${((currentIndex + 0.5) / items.length) * 100}%` 
						}}
					/>
				</div>
			</div>
		</div>
	);
};
