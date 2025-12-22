import React from "react";
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
	if (!selectionMode) return null;

	return (
		<div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-300 shrink-0">
			<span className="text-xs font-mono text-white/50 bg-glass-bg-accent px-2 py-1 rounded hidden md:block">
				{selectedCount} Selected
			</span>
			<Button
				variant="ghost"
				size="icon"
				onClick={onMoveSelected}
				disabled={selectedCount === 0}
				className="bg-glass-bg-accent border-glass-border-light hover:bg-glass-bg-active text-white"
				title="Move"
			>
				<FolderInput size={18} />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={onShareSelected}
				disabled={selectedCount === 0}
				className="bg-blue-600/20 border-blue-500/30 hover:bg-blue-600/40 text-blue-400"
				title="Share"
			>
				<Share2 size={18} />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={onRunBatchAI}
				disabled={selectedCount === 0 || isBatchAIProcessing}
				className="bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/40 text-purple-400 relative overflow-hidden"
				title="Analyze Selected"
			>
				{isBatchAIProcessing ? (
					<div
						className="absolute inset-0 bg-purple-500/20"
						style={{ width: `${batchAIProgress * 100}%` }}
					/>
				) : (
					<Sparkles size={18} />
				)}
			</Button>
			<Button
				variant="danger"
				onClick={onToggleSelectionMode}
				leftIcon={<X size={18} />}
				className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
			>
				<span className="hidden sm:inline">Done</span>
			</Button>
		</div>
	);
};
