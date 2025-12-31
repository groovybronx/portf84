/**
 * PhotoCardBack Component
 * Back face of the card showing metadata, tags, and file info
 */
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	Maximize2,
	Tag,
	Sparkles,
	HardDrive,
	FolderHeart,
	Camera,
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
	const { t } = useTranslation("library");
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
							title={t('colorTag')}
						/>
					)}
					<h4 className="text-[10px] font-medium text-white/80 line-clamp-1 leading-tight">
						{item.name}
					</h4>
				</div>
				<button
					onClick={onFlip}
					className="p-1.5 -mr-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
					title={t('closeInfo')}
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
								? "bg-quaternary/10 border border-quaternary/20"
								: "bg-tertiary/10 border border-tertiary/20"
						}`}
					>
						{locationInfo.isShadowFolder ? (
							<HardDrive size={14} className="text-quaternary" />
						) : (
							<FolderHeart size={14} className="text-tertiary" />
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
						<p className="text-xs text-gray-500">{t('noAiAnalysis')}</p>
					</div>
				)}
			</div>

			<div className="h-px bg-white/10 w-full shrink-0" />

			{/* 3. Tags */}
			<div className="flex-1 min-h-0 flex flex-col gap-2">
				<span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
					{t('tags')}
				</span>
				<div className="flex flex-wrap gap-2">
					{(item.manualTags || []).length === 0 &&
						(item.aiTags || []).length === 0 && (
							<p className="text-xs text-gray-600 italic">{t('noTags')}</p>
						)}
					{item.manualTags?.map((tag) => {
						const isSelected = selectedTag === tag;
						return (
							<button
								key={tag}
								onClick={() => onTagClick?.(tag)}
								className={`px-3 py-1 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
									isSelected
										? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
										: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/40"
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
										? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20"
										: "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 hover:border-secondary/40"
								}`}
							>
								<Sparkles size={12} /> {tag}
							</button>
						);
					})}
				</div>
			</div>

			<div className="h-px bg-white/10 w-full shrink-0" />

			<div className="h-px bg-white/10 w-full shrink-0" />

			{/* RAW Metadata */}
			{item.isRaw && (
				<>
					<div className="flex flex-col gap-2 shrink-0">
						<span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold flex items-center gap-1.5">
							<Camera size={12} /> {t('cameraSettings')}
						</span>
						<div className="bg-white/5 rounded-lg p-3 border border-white/5 space-y-2">
							{item.cameraModel && (
								<div className="text-xs text-white/90 font-medium border-b border-white/10 pb-1.5 mb-1.5">
									{item.cameraModel}
								</div>
							)}
							<div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-gray-400">
								{item.iso && (
									<div className="flex flex-col">
										<span className="text-[8px] uppercase tracking-widest text-gray-600">
											{t('iso')}
										</span>
										<span className="text-white/80">{item.iso}</span>
									</div>
								)}
								{item.aperture && (
									<div className="flex flex-col">
										<span className="text-[8px] uppercase tracking-widest text-gray-600">
											{t('aperture')}
										</span>
										<span className="text-white/80">{item.aperture}</span>
									</div>
								)}
								{item.shutterSpeed && (
									<div className="flex flex-col">
										<span className="text-[8px] uppercase tracking-widest text-gray-600">
											{t('shutter')}
										</span>
										<span className="text-white/80">{item.shutterSpeed}</span>
									</div>
								)}
							</div>
						</div>
					</div>
					<div className="h-px bg-white/10 w-full shrink-0" />
				</>
			)}

			{/* 4. File Info */}
			<div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] font-mono shrink-0">
				<div className="flex flex-col gap-0.5">
					<span className="text-[9px] uppercase tracking-widest text-gray-500">
						{t('type')}
					</span>
					<span className="text-gray-300">
						{item.type.split("/")[1]?.toUpperCase() || "UNKNOWN"}
					</span>
				</div>
				<div className="flex flex-col gap-0.5">
					<span className="text-[9px] uppercase tracking-widest text-gray-500">
						{t('size')}
					</span>
					<span className="text-gray-300">
						{(item.size / 1024 / 1024).toFixed(2)} MB
					</span>
				</div>
				{item.width && (
					<div className="flex flex-col gap-0.5 col-span-2 pt-1">
						<span className="text-[9px] uppercase tracking-widest text-gray-500">
							{t('resolution')}
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
