import React from "react";
import { useTranslation } from "react-i18next";
import { Share2, FolderInput, X, Sparkles } from "lucide-react";
import { Button } from "../../../../shared/components/ui";

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
		<div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-300 shrink-0">
			<span className="text-xs font-mono text-white/50 bg-glass-bg-accent px-2 py-1 rounded hidden md:block">
				{t('itemsSelected', { count: selectedCount })}
			</span>
			<Button
				variant="ghost"
				size="icon"
				onClick={onMoveSelected}
				disabled={selectedCount === 0}
				className="bg-glass-bg-accent border-glass-border-light hover:bg-glass-bg-active text-white"
				title={t('move')}
			>
				<FolderInput size={18} />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={onShareSelected}
				disabled={selectedCount === 0}
				className="bg-glass-bg-accent border-glass-border-light hover:bg-primary/10 hover:border-primary/30 text-primary"
				title={t('share')}
			>
				<Share2 size={18} />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={onRunBatchAI}
				disabled={selectedCount === 0 || isBatchAIProcessing}
				className="bg-glass-bg-accent border-glass-border-light hover:bg-secondary/10 hover:border-secondary/30 text-secondary relative overflow-hidden"
				title={t('analyzeSelected')}
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
		</div>
	);
};
