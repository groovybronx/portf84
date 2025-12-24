import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PortfolioItem } from "../../../shared/types";
import { GlassCard } from "../../../shared/components/ui";
import {
	CheckCircle2,
	Circle,
	Info,
	Tag,
	Sparkles,
	Maximize2,
} from "lucide-react";

interface PhotoCardProps {
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
}) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isFlipped, setIsFlipped] = useState(false);

	const handleFlip = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsFlipped(!isFlipped);
	};

	return (
		<div
			ref={(el) => registerItemRef?.(item.id, el)}
			data-item-id={item.id}
			className="relative perspective-1000 group cursor-pointer"
			onMouseEnter={() => onHover(item)}
			onMouseLeave={() => {
				onHover(null);
				setIsFlipped(false); // Auto-reset flip on leave for better UX
			}}
			onClick={(e) => {
				e.stopPropagation();
				if (selectionMode) {
					onToggleSelect(item.id);
				} else {
					onFocus(item.id);
				}
			}}
			onDoubleClick={(e) => {
				e.stopPropagation();
				if (!selectionMode) {
					onSelect(item);
				}
			}}
			onContextMenu={(e) => onContextMenu(e, item)}
		>
			<motion.div
				animate={{ rotateY: isFlipped ? 180 : 0 }}
				transition={{
					duration: 0.5,
					ease: [0.4, 0, 0.2, 1], // Custom smooth ease-in-out
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
				<GlassCard
					className="backface-hidden overflow-hidden h-full group border-0 bg-gray-900/50" // gray background for skeleton base
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
						onLoad={() => setIsLoaded(true)}
					/>

					{showColorTags && item.colorTag && (
						<>
							<div
								className="absolute bottom-0 left-0 right-0 h-1 z-20"
								style={{ backgroundColor: item.colorTag }}
							/>
							<div
								className="absolute top-3 left-3 w-3 h-3 rounded-full shadow-lg z-20 border border-black/20"
								style={{ backgroundColor: item.colorTag }}
							/>
						</>
					)}

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
									onClick={handleFlip}
									className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors border border-white/10"
									title="View Info"
								>
									<Info size={16} />
								</button>
							</div>
						</div>
					)}

					{selectionMode && (
					<div className="absolute top-3 right-3 z-20">
						{isSelected ? (
							<CheckCircle2
								className="text-blue-500 drop-shadow-lg bg-white rounded-full"
								size={24}
								fill="white"
							/>
						) : (
							<Circle className="text-white/70 drop-shadow-lg" size={24} />
						)}
					</div>
				)}
				</GlassCard>

				{/* Back Face */}
				<GlassCard
					className="absolute inset-0 p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar border border-white/10 bg-slate-950/95"
					style={{
						backfaceVisibility: "hidden",
						WebkitBackfaceVisibility: "hidden",
						transform: "rotateY(180deg)",
					}}
					onClick={(e) => e.stopPropagation()}
				>
					{/* 1. Nom du fichier */}
					<div className="flex items-start justify-between min-h-0">
						<div className="flex items-center gap-2 flex-1 pr-2 min-w-0">
							{item.colorTag && (
								<div
									className="w-3 h-3 rounded-full shrink-0 shadow-sm border border-white/20"
									style={{ backgroundColor: item.colorTag }}
									title="Color Tag"
								/>
							)}
							<h4 className="text-sm font-bold text-white line-clamp-2 leading-tight">
								{item.name}
							</h4>
						</div>
						<button
							onClick={handleFlip}
							className="p-1.5 -mr-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
							title="Close info"
						>
							<Maximize2 size={16} />
						</button>
					</div>

					<div className="h-px bg-white/10 w-full shrink-0" />

					{/* 2. Description IA */}
					<div className="min-h-0 shrink-0">
						{item.aiDescription ? (
							<div className="p-3.5 rounded-xl bg-white/5 border border-white/5 shadow-inner">
								<p className="text-xs text-blue-100/80 leading-relaxed italic line-clamp-6">
									"{item.aiDescription}"
								</p>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-6 border border-dashed border-white/10 rounded-xl bg-white/5">
								<Sparkles size={24} className="text-gray-600 mb-2 opacity-50" />
								<p className="text-xs text-gray-500">No AI analysis yet</p>
							</div>
						)}
					</div>

					<div className="h-px bg-white/10 w-full shrink-0" />

					{/* 3. Tags */}
					<div className="flex-1 min-h-0 flex flex-col gap-2">
						<span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
							Tags
						</span>
						<div className="flex flex-wrap gap-2">
							{(item.manualTags || []).length === 0 &&
								(item.aiTags || []).length === 0 && (
									<p className="text-xs text-gray-600 italic">No tags</p>
								)}
							{item.manualTags?.map((tag) => {
								const isSelected = selectedTag === tag;
								return (
									<button
										key={tag}
										onClick={() => onTagClick?.(tag)}
										className={`px-3 py-1 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
											isSelected
												? "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/20"
												: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40"
										}`}
									>
										<Tag size={12} /> {tag}
									</button>
								);
							})}
							{item.aiTags?.slice(0, 5).map((tag) => {
								const isSelected = selectedTag === tag;
								return (
									<button
										key={tag}
										onClick={() => onTagClick?.(tag)}
										className={`px-3 py-1 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
											isSelected
												? "bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/20"
												: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40"
										}`}
									>
										<Sparkles size={12} /> {tag}
									</button>
								);
							})}
						</div>
					</div>

					<div className="h-px bg-white/10 w-full shrink-0" />

					{/* 4. Taille et format */}
					<div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] font-mono shrink-0">
						<div className="flex flex-col gap-0.5">
							<span className="text-[9px] uppercase tracking-widest text-gray-500">
								Type
							</span>
							<span className="text-gray-300">
								{item.type.split("/")[1]?.toUpperCase() || "UNKNOWN"}
							</span>
						</div>
						<div className="flex flex-col gap-0.5">
							<span className="text-[9px] uppercase tracking-widest text-gray-500">
								Size
							</span>
							<span className="text-gray-300">
								{(item.size / 1024 / 1024).toFixed(2)} MB
							</span>
						</div>
						{item.width && (
							<div className="flex flex-col gap-0.5 col-span-2 pt-1">
								<span className="text-[9px] uppercase tracking-widest text-gray-500">
									Resolution
								</span>
								<span className="text-gray-300">
									{item.width} x {item.height} px
								</span>
							</div>
						)}
					</div>
				</GlassCard>
			</motion.div>
		</div>
	);
};

export const PhotoCard = React.memo(PhotoCardComponent, (prev, next) => {
	// Custom comparison to ignore function prop changes
	return (
		prev.item === next.item &&
		prev.isSelected === next.isSelected &&
		prev.isFocused === next.isFocused &&
		prev.selectionMode === next.selectionMode &&
		prev.showColorTags === next.showColorTags &&
		prev.selectedTag === next.selectedTag
	);
});
