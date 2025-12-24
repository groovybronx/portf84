/**
 * PhotoCardBack Component
 * Back face of the card showing metadata, tags, and file info
 */
import React, { useMemo } from "react";
import {
	Maximize2,
	Tag,
	Sparkles,
	HardDrive,
	FolderHeart,
} from "lucide-react";
import { PortfolioItem, Folder } from "../../../../shared/types";
import { GlassCard } from "../../../../shared/components/ui";

interface PhotoCardBackProps {
	item: PortfolioItem;
	folders: Folder[];
	selectedTag?: string | null;
	onFlip: (e: React.MouseEvent) => void;
	onTagClick?: (tag: string) => void;
}

export const PhotoCardBack: React.FC<PhotoCardBackProps> = ({
	item,
	folders,
	selectedTag,
	onFlip,
	onTagClick,
}) => {
	// Compute location name
	const locationInfo = useMemo(() => {
		if (!item.virtualFolderId) return null;
		const folder = folders.find((f) => f.id === item.virtualFolderId);
		if (!folder) return null;
		return {
			name: folder.name,
			isShadowFolder: !!folder.sourceFolderId,
		};
	}, [item.virtualFolderId, folders]);

	return (
		<GlassCard
			className="absolute inset-0 p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar border border-white/10 bg-slate-950/95"
			style={{
				backfaceVisibility: "hidden",
				WebkitBackfaceVisibility: "hidden",
				transform: "rotateY(180deg)",
			}}
			onClick={(e) => e.stopPropagation()}
		>
			{/* 1. File Name Header */}
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
					onClick={onFlip}
					className="p-1.5 -mr-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
					title="Close info"
				>
					<Maximize2 size={16} />
				</button>
			</div>

			{/* Location (Folder/Collection) */}
			{locationInfo && (
				<div className="flex items-center gap-2">
					<div
						className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
							locationInfo.isShadowFolder
								? "bg-blue-500/10 border border-blue-500/20"
								: "bg-purple-500/10 border border-purple-500/20"
						}`}
					>
						{locationInfo.isShadowFolder ? (
							<HardDrive size={14} className="text-blue-400" />
						) : (
							<FolderHeart size={14} className="text-purple-400" />
						)}
					</div>
					<span className="text-xs text-gray-400 truncate">
						{locationInfo.name}
					</span>
				</div>
			)}

			<div className="h-px bg-white/10 w-full shrink-0" />

			{/* 2. AI Description */}
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

			{/* 4. File Info */}
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
	);
};
