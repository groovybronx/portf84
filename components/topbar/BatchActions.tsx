import React from "react";
import { Share2, FolderInput, X, Sparkles } from "lucide-react";

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
    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-300 flex-shrink-0">
      <span className="text-xs font-mono text-white/50 bg-glass-bg-accent px-2 py-1 rounded hidden md:block">
        {selectedCount} Selected
      </span>
      <button
        onClick={onMoveSelected}
        disabled={selectedCount === 0}
        className="p-2 bg-glass-bg-accent border border-glass-border-light rounded-lg hover:bg-glass-bg-active disabled:opacity-30 disabled:cursor-not-allowed text-white"
        title="Move"
      >
        <FolderInput size={18} />
      </button>
      <button
        onClick={onShareSelected}
        disabled={selectedCount === 0}
        className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/40 text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Share"
      >
        <Share2 size={18} />
      </button>
      <button
        onClick={onRunBatchAI}
        disabled={selectedCount === 0 || isBatchAIProcessing}
        className="p-2 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/40 text-purple-400 disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden"
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
      </button>
      <button
        onClick={onToggleSelectionMode}
        className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
      >
        <X size={18} />
        <span className="text-sm font-medium hidden sm:inline">Done</span>
      </button>
    </div>
  );
};
