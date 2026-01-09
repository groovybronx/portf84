import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
	Sparkles,
	Trash2,
	Eye,
	Palette,
	Copy,
	X,
	Tag,
	FolderInput,
	FolderPlus,
} from "lucide-react";
import { PortfolioItem, COLOR_PALETTE } from "../types";
import { getColorName } from "../../services/storage/folders";
import { Button } from "./ui/Button";

import { logger } from '../utils/logger';
interface ContextMenuProps {
	x: number;
	y: number;
	item: PortfolioItem;
	onClose: () => void;
	onAnalyze: (item: PortfolioItem) => void;
	onDelete: (id: string) => void;
	onAddTags: (item: PortfolioItem) => void;
	onOpen: (item: PortfolioItem) => void;
	onMove: (item: PortfolioItem) => void;
	onColorTag: (item: PortfolioItem, color: string | undefined) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
	x,
	y,
	item,
	onClose,
	onAnalyze,
	onDelete,
	onAddTags,
	onOpen,
	onMove,
	onColorTag,
}) => {
	const { t } = useTranslation("library");
	const menuRef = useRef<HTMLDivElement>(null);
	const [hoveredAction, setHoveredAction] = useState<string | null>(null);

	// Close on click outside
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClick, { capture: true });
		return () =>
			document.removeEventListener("mousedown", handleClick, { capture: true });
	}, [onClose]);

	// Adjust position if close to edge
	const adjustedX = Math.min(x, window.innerWidth - 240);
	const adjustedY = Math.min(y, window.innerHeight - 350);

	const menuItems = [
		{
			id: "open",
			label: t('openFullscreen'),
			icon: Eye,
			color: "text-primary",
			action: () => onOpen(item),
		},
		{
			id: "analyze",
			label: t('analyzeAI'),
			icon: Sparkles,
			color: "text-purple-400",
			action: () => onAnalyze(item),
		},
		{
			id: "tags",
			label: t('addTag'),
			icon: Tag,
			color: "text-green-400",
			action: () => onAddTags(item),
		},
		{
			id: "move",
			label: t('moveToCollection'),
			icon: FolderInput,
			color: "text-primary",
			action: () => onMove(item),
		},
	];

	return (
		<motion.div
			ref={menuRef}
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.1 }}
			style={{ top: adjustedY, left: adjustedX }}
			onMouseDown={(e) => e.stopPropagation()}
			onContextMenu={(e) => e.preventDefault()}
			className="fixed z-(--z-context-menu) w-60 glass-surface border border-glass-border rounded-xl shadow-2xl py-2 overflow-hidden"
		>
			<div className="px-4 py-2 border-b border-glass-border/10 mb-1 flex items-center justify-between">
				<p
					className="text-xs font-mono text-gray-500 truncate max-w-[150px]"
					title={item.name}
				>
					{item.name}
				</p>
				<Button
					onClick={onClose}
					variant="close"
					size="icon-sm"
					aria-label={t('closeMenu')}
				>
					<X size={14} />
				</Button>
			</div>

			<div className="relative">
				{menuItems.map((menuItem) => (
					<Button
						key={menuItem.id}
						onMouseEnter={() => setHoveredAction(menuItem.id)}
						onMouseLeave={() => setHoveredAction(null)}
						onClick={() => {
							menuItem.action();
							onClose();
						}}
						variant="ghost"
						className="w-full text-left px-4 py-2 text-sm text-gray-200 gap-3 transition-colors relative group justify-start h-auto rounded-none"
					>
						{hoveredAction === menuItem.id && (
							<motion.div
								layoutId="menu-hover-bg"
								initial={false}
								className="absolute inset-0 bg-white/10 z-0"
								transition={{
									type: "spring",
									bounce: 0.15,
									duration: 0.35,
								}}
							/>
						)}
						<menuItem.icon
							size={16}
							className={`${menuItem.color} relative z-10 transition-transform group-hover:scale-110`}
						/>
						<span className="relative z-10 font-medium">{menuItem.label}</span>
					</Button>
				))}
			</div>

			<div className="my-1 border-t border-glass-border/10" />

			<div className="px-4 py-2">
				<p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-2">
					<Palette size={12} /> {t('colorTag')}
				</p>
				<div className="flex justify-between">
					{Object.entries(COLOR_PALETTE).map(([key, hex]) => (
						<Button
							key={key}
							onClick={() => {
								onColorTag(item, hex);
								onClose();
							}}
							variant="ghost"
							size="icon-sm"
							className={`rounded-full border border-transparent hover:scale-125 hover:border-white transition-all ${
								item.colorTag === hex ? "ring-2 ring-white/50" : ""
							}`}
							style={{ backgroundColor: hex }}
						/>
					))}
					<Button
						onClick={() => {
							onColorTag(item, undefined);
							onClose();
						}}
						variant="ghost"
						size="icon-sm"
						className="rounded-full border border-white/20 text-gray-500 hover:text-white hover:border-white transition-all hover:scale-125"
						title={t('removeTag')}
					>
						<X size={12} />
					</Button>
				</div>
			</div>

			{/* Group by Color action removed */}

			<div className="my-1 border-t border-glass-border/10" />

			<Button
				onMouseEnter={() => setHoveredAction("delete")}
				onMouseLeave={() => setHoveredAction(null)}
				onClick={() => {
					onDelete(item.id);
					onClose();
				}}
				variant="ghost"
				className="w-full text-left px-4 py-2 text-sm text-red-500/80 gap-3 transition-colors relative group justify-start h-auto rounded-none"
			>
				{hoveredAction === "delete" && (
					<motion.div
						layoutId="menu-hover-bg"
						initial={false}
						className="absolute inset-0 bg-red-500/10 z-0"
						transition={{
							type: "spring",
							bounce: 0.15,
							duration: 0.35,
						}}
					/>
				)}
				<Trash2
					size={16}
					className="relative z-10 transition-transform group-hover:scale-110"
				/>
				<span className="relative z-10 font-medium">{t('deleteItem')}</span>
			</Button>
		</motion.div>
	);
};

