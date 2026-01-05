import React from "react";
import { useTranslation } from "react-i18next";
import { Share2, FolderInput, Sparkles } from "lucide-react";
import { Button, Flex, GlassCard } from "../../../../shared/components/ui";

interface BatchActionsProps {
	selectionMode: boolean;
	selectedCount: number;
	onMoveSelected: () => void;
	onShareSelected: () => void;
	onToggleSelectionMode: () => void;
	onRunBatchAI: () => void;
	isBatchAIProcessing: boolean;
	batchAIProgress: number;
}

export const BatchActions: React.FC<BatchActionsProps> = ({
	selectionMode,
	selectedCount,
	onMoveSelected,
	onShareSelected,
	onToggleSelectionMode,
	onRunBatchAI,
	isBatchAIProcessing,
	batchAIProgress,
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
			>
				<FolderInput size={18} />
			</Button>
			<Button
				variant="glass"
				size="icon"
				onClick={onShareSelected}
				disabled={selectedCount === 0}
				aria-label={t('share')}
				className="text-primary hover:border-primary/30"
			>
				<Share2 size={18} />
			</Button>
			<Button
				variant="glass"
				size="icon"
				onClick={onRunBatchAI}
				disabled={selectedCount === 0 || isBatchAIProcessing}
				aria-label={t('analyzeSelected')}
				className="text-secondary hover:border-secondary/30 relative overflow-hidden"
			>
				{isBatchAIProcessing ? (
					<div
						className="absolute inset-0 bg-secondary/20"
						style={{ width: `${batchAIProgress * 100}%` }}
					/>
				) : (
					<Sparkles size={18} />
				)}
			</Button>
		</Flex>
	);
};
