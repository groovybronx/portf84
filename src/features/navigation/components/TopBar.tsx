import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../../../shared/components/Icon";
import { motion, AnimatePresence } from "framer-motion";
import { ViewMode } from "../../../shared/types";
import { useLibrary } from "../../../shared/contexts/LibraryContext";
import { useSelection } from "../../../shared/contexts/SelectionContext";
import { Button, GlassCard, Flex } from "../../../shared/components/ui";

// Sub-components
import { SearchField } from "./topbar/SearchField";
import { SortControls } from "./topbar/SortControls";
import { BatchActions } from "./topbar/BatchActions";
import { ColorPicker } from "./topbar/ColorPicker";
import { ViewToggle } from "./topbar/ViewToggle";

interface TopBarProps {
	folderName?: string;
	onOpenFolders: () => void;
	onMoveSelected: () => void;
	onShareSelected: () => void;
	onOpenSettings: () => void;

	onOpenTagHub: () => void;
	onOpenBatchTagPanel: () => void;
	showColorTags: boolean;
	onToggleColorTags: () => void;
	isSidebarPinned?: boolean;
	onToggleTopBarPin?: () => void;
	isExternalHovered?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
	folderName,
	onOpenFolders,
	onMoveSelected,
	onShareSelected,
	onOpenSettings,

	onOpenTagHub,
	onOpenBatchTagPanel,
	showColorTags,
	onToggleColorTags,
	isSidebarPinned = false,
	onToggleTopBarPin,
	isExternalHovered = false,
}) => {
	const { t } = useTranslation(["navigation", "common"]);
	// Context consumption
	const {
		searchTerm,
		setSearchTerm,
		sortOption,
		setSortOption,
		sortDirection,
		setSortDirection,
		activeTags,
		toggleTag,
		clearTags,
		activeColorFilter,
		setActiveColorFilter,
		availableTags,
		viewMode,
		setViewMode,
		gridColumns,
		setGridColumns,
		autoAnalyzeEnabled,
		useCinematicCarousel,
		processedItems,
	} = useLibrary();

	const isFiltered = activeTags?.size > 0 || !!searchTerm || !!activeColorFilter;
	const filteredCount = processedItems?.length || 0;

	const { selectionMode, selectedIds } = useSelection();

	const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const shouldShow = isSidebarPinned || isExternalHovered || isHovered || isViewMenuOpen;
	const selectedCount = selectedIds?.size || 0;

	// Grid Size Slider Logic (Inverted)
	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const MIN_COLS = 2,
			MAX_COLS = 8,
			SUM = MIN_COLS + MAX_COLS;
		setGridColumns(SUM - Number(e.target.value));
	};

	return (
		<>
			{/* Zone de survol invisible - toujours présente */}
			<div
				className="absolute top-0 left-0 right-0 h-32 z-30"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => {
					setIsHovered(false);
					setIsViewMenuOpen(false);
				}}
			/>

			<AnimatePresence>
				{shouldShow && (
					<motion.div
						initial={{ y: "-100%", opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: "-100%", opacity: 0 }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						className="flex top-0 left-0 right-0 z-40 h-24 flex flex-col items-center transition-all duration-300 pointer-events-auto"
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => {
							setIsHovered(false);
							setIsViewMenuOpen(false);
						}}
					>
						<div className="w-full flex justify-center p-4 pointer-events-none">
							<GlassCard className="rounded-2xl shadow-xl p-2 sm:p-3 max-w-[70vw] pointer-events-auto">
								<Flex align="center">
									{/* --- LEFT SECTION --- */}
									<Flex align="center" gap="xs" className="shrink-0">
										<Button
											variant="ghost"
											size="icon"
											onClick={onToggleTopBarPin || onOpenFolders}
											icon={
												isSidebarPinned ? (
													<Icon action="pin" size={16} fill="currentColor" />
												) : (
													<Icon action="unpin" size={16} />
												)
											}
											className={
												isSidebarPinned ? "text-primary bg-glass-bg-accent" : "text-gray-500"
											}
											title={isSidebarPinned ? t("navigation:unpin") : t("navigation:pin")}
										/>
										<div className="h-6 w-px bg-glass-border/10 mx-1 hidden sm:block" />
										<Button
											variant="ghost"
											onClick={onOpenFolders}
											icon={<Icon action="library" size={18} />}
											iconPosition="left"
											className="text-primary hover:text-white"
										>
											<span className="hidden md:inline max-w-[100px] truncate">
												{folderName || t("navigation:library")}
											</span>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={onOpenSettings}
											className="text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
											title={t("navigation:settings")}
											icon={<Icon action="settings" size={18} />}
										/>
									</Flex>

									{/* AUTO-ANALYZE SAFETY INDICATOR */}
									{autoAnalyzeEnabled && (
										<Flex
											align="center"
											gap="sm"
											className="px-3 py-1.5 bg-red-500/10 border border-red-500/50 rounded-full animate-pulse mx-2 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
										>
											<Icon action="alert" size={14} className="text-red-500" />
											<span className="text-[10px] font-bold text-red-500 hidden lg:inline tracking-wider uppercase">
												{t("navigation:autoAnalyzeActive")}
											</span>
										</Flex>
									)}

									<div className="h-6 w-px bg-glass-border/10 mx-2 hidden sm:block shrink-0" />

									{/* --- MIDDLE SECTION (Search, Colors, Slider) --- */}
									<Flex
										align="center"
										gap="sm"
										className="flex-1 overflow-x-auto no-scrollbar px-1 min-w-0"
									>
										<SearchField
											value={searchTerm}
											onChange={setSearchTerm}
											availableTags={availableTags}
											activeTags={activeTags}
											onTagToggle={toggleTag}
											onClearTags={clearTags}
										/>

										{/* Filtered Count Indicator */}
										{isFiltered && (
											<Flex
												align="center"
												gap="xs"
												className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-medium text-blue-300 animate-in fade-in zoom-in duration-300"
											>
												<span className="text-blue-400">{filteredCount}</span>
												<span className="text-blue-500/70">items</span>
											</Flex>
										)}

										<ColorPicker
											activeColorFilter={activeColorFilter}
											onColorAction={setActiveColorFilter}
											showColorTags={showColorTags}
											onToggleColorTags={onToggleColorTags}
											selectionMode={selectionMode}
										/>

										{viewMode === ViewMode.GRID && (
											<GlassCard
												variant="accent"
												padding="sm"
												border
												className="hidden sm:flex mx-2 shrink-0"
											>
												<Flex align="center" gap="sm">
													<input
														type="range"
														min={2}
														max={8}
														step="1"
														value={10 - gridColumns}
														onChange={handleSliderChange}
														className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-text-primary [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
													/>
												</Flex>
											</GlassCard>
										)}
									</Flex>

									{/* --- ACTIONS SECTION (Tags, Sort, Select) --- */}
									<Flex align="center" gap="xs" className="shrink-0 ml-2">
										<BatchActions
											selectionMode={selectionMode}
											selectedCount={selectedCount}
											onMoveSelected={onMoveSelected}
											onShareSelected={onShareSelected}
											onOpenBatchTagPanel={onOpenBatchTagPanel}
										/>

										{!selectionMode && (
											<Flex align="center" gap="xs">
												<Button
													variant="ghost"
													size="icon"
													onClick={onOpenTagHub}
													className="text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
													title="Tag Hub (Ctrl+T)"
												>
													<Icon action="tag" size={18} />
												</Button>
												<SortControls
													sortOption={sortOption}
													sortDirection={sortDirection}
													onSortChange={setSortOption}
													onSortDirectionChange={() =>
														setSortDirection(sortDirection === "asc" ? "desc" : "asc")
													}
												/>
											</Flex>
										)}
									</Flex>

									{/* --- RIGHT SECTION (View Toggle) --- */}
									<Flex
										align="center"
										gap="xs"
										className="shrink-0 pl-1 ml-1 border-l border-glass-border/10 relative z-50"
									>
										<ViewToggle
											currentViewMode={viewMode}
											onModeChange={setViewMode}
											isViewMenuOpen={isViewMenuOpen}
											setIsViewMenuOpen={setIsViewMenuOpen}
											useCinematicCarousel={useCinematicCarousel}
										/>
									</Flex>
								</Flex>
							</GlassCard>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};
