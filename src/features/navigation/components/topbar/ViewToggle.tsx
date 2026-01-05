import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
	ChevronDown,
	LayoutGrid,
	Layers,
	LayoutList,
	LucideIcon,
} from "lucide-react";
import { ViewMode } from "../../../../shared/types";
import { Button, GlassCard, Flex } from "../../../../shared/components/ui";

interface ViewToggleProps {
	currentViewMode: ViewMode;
	onModeChange: (mode: ViewMode) => void;
	isViewMenuOpen: boolean;
	setIsViewMenuOpen: (open: boolean) => void;
	useCinematicCarousel?: boolean;
}



export const ViewToggle: React.FC<ViewToggleProps> = ({
	currentViewMode,
	onModeChange,
	isViewMenuOpen,
	setIsViewMenuOpen,
	useCinematicCarousel = false,
}) => {
	const { t } = useTranslation("navigation");

	const viewModes: { id: ViewMode; icon: LucideIcon; label: string }[] = [
		{ id: ViewMode.GRID, icon: LayoutGrid, label: t('viewGrid') },
		{ id: ViewMode.CAROUSEL, icon: Layers, label: t('viewFlow') },
		{ id: ViewMode.LIST, icon: LayoutList, label: t('viewDetail') },
	];

	const currentModeData = viewModes.find((m) => m.id === currentViewMode) || viewModes[0];
	if (!currentModeData) return null; // Defensive check for TypeScript

	return (
		<div className="relative">
			<GlassCard
				variant="accent"
				border
				padding="sm"
				as={Button}
				onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
				className="hover:bg-glass-bg-active transition-colors min-w-[120px] justify-between cursor-pointer"
			>
				<Flex align="center" gap="sm">
					<currentModeData.icon size={16} className="text-blue-400" />
					<span className="text-sm font-medium">{currentModeData.label}</span>
				</Flex>
				<ChevronDown
					size={14}
					className={`text-gray-400 transition-transform ${
						isViewMenuOpen ? "rotate-180" : ""
					}`}
				/>
			</GlassCard>

			<AnimatePresence>
				{isViewMenuOpen && (
					<GlassCard
						variant="overlay"
						className="absolute top-full mt-2 right-0 w-32 border border-glass-border rounded-xl shadow-2xl overflow-hidden z-50 p-1"
					>
						<motion.div
							initial={{ opacity: 0, y: 10, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 10, scale: 0.95 }}
						>
						{viewModes.map((mode) => (
							<Button
								key={mode.id}
								variant="ghost"
								onClick={() => {
									onModeChange(mode.id);
									setIsViewMenuOpen(false);
								}}
								className={`w-full justify-start gap-3 px-3 py-2 text-sm ${
									currentViewMode === mode.id
										? "text-blue-400 bg-blue-500/10"
										: "text-gray-300 hover:text-white"
								}`}
							>
								<mode.icon size={16} />
								<span className="flex-1">{mode.label}</span>
								{mode.id === ViewMode.CAROUSEL && useCinematicCarousel && (
									<span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/30 text-blue-300 rounded border border-blue-400/30">
										3D
									</span>
								)}
							</Button>
						))}
					</motion.div>
					</GlassCard>
				)}
			</AnimatePresence>
		</div>
	);
};
