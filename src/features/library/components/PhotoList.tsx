import React from "react";
import { Button } from "../../../shared/components/ui";
import { PortfolioItem } from "../../../shared/types";
import { Button } from "../../../shared/components/ui";
import { motion } from "framer-motion";
import { useLibrary } from "../../../shared/contexts/LibraryContext";
import { useSelection } from "../../../shared/contexts/SelectionContext";

interface PhotoListProps {
	onSelect: (item: PortfolioItem) => void;
	onHover?: (item: PortfolioItem | null) => void;
	onContextMenu?: (e: React.MouseEvent, item: PortfolioItem) => void;
	onTagClick?: (tag: string) => void;
	focusedId?: string | null;
	onFocusChange?: (id: string | null) => void;
}

export const PhotoList: React.FC<PhotoListProps> = ({
	onSelect,
	onHover,
	onContextMenu,
	onTagClick,
	focusedId,
	onFocusChange,
}) => {
	// Context consumption
	const { processedItems: items, selectedTag } = useLibrary();
	const { selectionMode, selectedIds, toggleSelection, registerItemRef } =
		useSelection();
    
    // Track loaded thumbnails
    const [loadedItems, setLoadedItems] = React.useState<Set<string>>(new Set());

	const showColorTags = true;

	if (items.length === 0) {
		return (
			<div className="h-full flex items-center justify-center">
				<p className="text-gray-500">No items to display</p>
			</div>
		);
	}

	return (
		<div className="h-full overflow-y-auto px-8 py-6">
			<div className="max-w-6xl mx-auto space-y-4">
				{items.map((item, index) => {
					const isSelected = selectedIds.has(item.id);
					const isFocused = focusedId === item.id;
					const fileExtension =
						item.type.split("/")[1]?.toUpperCase() || "FILE";

					return (
						<motion.div
							key={item.id}
							ref={(el) => registerItemRef?.(item.id, el)}
							data-item-id={item.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
							className={`
                glass-surface rounded-xl p-4 flex gap-4 cursor-pointer
                hover:border-glass-border-light transition-all
                ${isFocused ? "ring-2 ring-primary" : ""}
                ${isSelected ? "bg-primary/10 border-primary/50" : ""}
              `}
							onClick={() => onSelect(item)}
							onMouseEnter={() => onHover?.(item)}
							onMouseLeave={() => onHover?.(null)}
							onContextMenu={(e) => {
								e.preventDefault();
								onContextMenu?.(e, item);
							}}
							onFocus={() => onFocusChange?.(item.id)}
						>
							{/* Selection Checkbox */}
							{selectionMode && (
								<div className="shrink-0 flex items-center">
									<input
										type="checkbox"
										checked={isSelected}
										onChange={() => toggleSelection(item.id)}
										onClick={(e) => e.stopPropagation()}
										className="w-5 h-5 rounded border-glass-border-light bg-glass-bg checked:bg-primary cursor-pointer"
									/>
								</div>
							)}

							{/* Thumbnail */}
							<div className={`shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-glass-bg-accent ${!loadedItems.has(item.id) ? "animate-pulse" : ""}`}>
								<img
									src={item.url}
									alt={item.name}
									className={`w-full h-full object-cover transition-opacity duration-300 ${loadedItems.has(item.id) ? "opacity-100" : "opacity-0"}`}
									loading="lazy"
                                    onLoad={() => {
                                        setLoadedItems(prev => {
                                            const newSet = new Set(prev);
                                            newSet.add(item.id);
                                            return newSet;
                                        });
                                    }}
								/>
							</div>

							{/* Info */}
							<div className="flex-1 min-w-0">
								<div className="flex items-start gap-2 mb-2">
									<h3 className="text-lg font-semibold text-white truncate flex-1">
										{item.name}
									</h3>
									{showColorTags && item.colorTag && (
										<div
											className="shrink-0 w-6 h-6 rounded-full border-2 border-glass-border-light"
											style={{ backgroundColor: item.colorTag }}
										/>
									)}
								</div>

								{item.aiDescription && (
									<p className="text-sm text-gray-400 mb-2 line-clamp-2">
										{item.aiDescription}
									</p>
								)}

								{/* Tags */}
								<div className="flex gap-2 flex-wrap mb-2">
									{item.aiTags?.map((tag) => (
										<Button
											key={tag}
											onClick={(e) => {
												e.stopPropagation();
												onTagClick?.(tag);
											}}
											className={`
                        px-2 py-1 text-xs rounded-full transition-colors
                        ${
													selectedTag === tag
														? "bg-primary text-white"
														: "bg-primary/20 text-primary hover:bg-primary/30"
												}
                      `}
										>
											{tag}
										</Button>
									))}
									{item.manualTags?.map((tag) => (
										<Button
											key={tag}
											onClick={(e) => {
												e.stopPropagation();
												onTagClick?.(tag);
											}}
											className={`
                        px-2 py-1 text-xs rounded-full transition-colors
                        ${
													selectedTag === tag
														? "bg-secondary text-white"
														: "bg-secondary/20 text-secondary hover:bg-secondary/30"
												}
                      `}
										>
											{tag}
										</Button>
									))}
								</div>

								{/* Metadata */}
								<div className="flex gap-4 text-xs text-gray-500">
									<span>{fileExtension}</span>
									<span>{(item.size / 1024 / 1024).toFixed(2)} MB</span>
									<span>
										{new Date(item.lastModified).toLocaleDateString()}
									</span>
								</div>
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
};
