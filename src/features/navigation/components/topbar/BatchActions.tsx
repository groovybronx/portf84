import React from "react";
import { useTranslation } from "react-i18next";
import { Share2, FolderInput, Tags } from "lucide-react";
import { Button, Flex, GlassCard } from "../../../../shared/components/ui";

interface BatchActionsProps {
	selectionMode: boolean;
	selectedCount: number;
	onMoveSelected: () => void;
	onShareSelected: () => void;
	onToggleSelectionMode: () => void;
	onOpenBatchTagPanel: () => void;
}

export const BatchActions: React.FC<BatchActionsProps> = ({
	selectionMode,
	selectedCount,
	onMoveSelected,
	onShareSelected,
	onToggleSelectionMode,
	onOpenBatchTagPanel,
}) => {
	const { t } = useTranslation("navigation");
	if (!selectionMode) return null;

	return (
		<Flex align="center" gap="sm" className="animate-in fade-in slide-in-from-right-5 duration-300 shrink-0">
			<GlassCard variant="accent" padding="sm" className="text-xs font-mono text-white/50 hidden md:block">
				{t('itemsSelected', { count: selectedCount })}
			</GlassCard>
			<Button
				variant="glass"
				size="icon"
				onClick={onMoveSelected}
				disabled={selectedCount === 0}
				aria-label={t('move')}
				icon={<FolderInput size={18} />}
			/>
			<Button
				variant="glass"
				size="icon"
				onClick={onShareSelected}
				disabled={selectedCount === 0}
				aria-label={t('share')}
				className="text-primary hover:border-primary/30"
				icon={<Share2 size={18} />}
			/>
			<Button
				variant="glass"
				size="icon"
				onClick={onOpenBatchTagPanel}
				disabled={selectedCount === 0}
				aria-label={t('batchTagHint')}
				title={t('batchTagHint')}
				className="text-purple-400 hover:border-purple-400/30"
				icon={<Tags size={18} />}
			/>
					</Flex>
	);
};
