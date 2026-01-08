/**
 * PhotoCardBack Component
 * Back face of the card showing metadata, tags, and file info
 */
import React, { useMemo } from "react";
import { Button, Flex, Stack } from "../../../../shared/components/ui";
import { useTranslation } from "react-i18next";
import {
	RotateCcw,
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
			<Flex align="start" justify="between" className="min-h-0">
				<Flex align="center" gap="sm" className="flex-1 pr-2 min-w-0">
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
				</Flex>
				<Button
					onClick={onFlip}
					variant="ghost"
					className="p-1.5 -mr-1 text-gray-400 hover:text-primary/80 hover:bg-white/5 rounded-full transition-colors shrink-0"
					title={t('closeInfo')}
				>
					<RotateCcw size={16} />
				</Button>
			</Flex>

			{/* Location (Folder/Collection) */}
			{locationInfo && (
				<Flex align="center" gap="sm">
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
				</Flex>
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
			<Stack spacing="sm" className="flex-1 min-h-0">
				<span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
					{t('tags')}
				</span>
				<Flex wrap="wrap" gap="sm">
					{(item.manualTags || []).length === 0 &&
						(item.aiTags || []).length === 0 && (
							<p className="text-xs text-gray-600 italic">{t('noTags')}</p>
						)}
					{item.manualTags?.map((tag) => {
						const isSelected = selectedTag === tag;
						return (
							<Button
								key={tag}
								onClick={() => onTagClick?.(tag)}
								className={`px-3 py-1 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
									isSelected
										? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
										: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/40"
								}`}
							>
								<Tag size={12} /> {tag}
							</Button>
						);
					})}
					{item.aiTags?.slice(0, 5).map((tag) => {
						const isSelected = selectedTag === tag;
						return (
							<Button
								key={tag}
								onClick={() => onTagClick?.(tag)}
								className={`px-3 py-1 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
									isSelected
										? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20"
										: "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 hover:border-secondary/40"
								}`}
							>
								<Sparkles size={12} /> {tag}
							</Button>
						);
					})}
				</Flex>
			</Stack>

			<div className="h-px bg-white/10 w-full shrink-0" />

			<div className="h-px bg-white/10 w-full shrink-0" />


			{/* 4. File Info */}
			<div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] font-mono shrink-0">
				<Stack spacing="xs">
					<span className="text-[9px] uppercase tracking-widest text-gray-500">
						{t('type')}
					</span>
					<span className="text-gray-300">
						{item.type.split("/")[1]?.toUpperCase() || "UNKNOWN"}
					</span>
				</Stack>
				<Stack spacing="xs">
					<span className="text-[9px] uppercase tracking-widest text-gray-500">
						{t('size')}
					</span>
					<span className="text-gray-300">
						{(item.size / 1024 / 1024).toFixed(2)} MB
					</span>
				</Stack>
				{item.width && (
					<Stack spacing="xs" className="col-span-2 pt-1">
						<span className="text-[9px] uppercase tracking-widest text-gray-500">
							{t('resolution')}
						</span>
						<span className="text-gray-300">
							{item.width} x {item.height} px
						</span>
					</Stack>
				)}
			</div>
		</GlassCard>
	);
};
