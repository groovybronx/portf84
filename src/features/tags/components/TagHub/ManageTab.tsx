import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Merge, CheckSquare, Square, BarChart3, Plus } from "lucide-react";
import { Button, ConfirmDialog } from "@/shared/components/ui";
import { getAllTags, deleteTag, mergeTags } from "@/services/storage/tags";
import { ParsedTag } from "@/shared/types/database";

export const ManageTab: React.FC = () => {
    // ... existing hooks
	const { t } = useTranslation(["tags", "common"]);
	const [tags, setTags] = useState<ParsedTag[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
	const [showStats, setShowStats] = useState(true);
    
    // Dialog states
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showMergeConfirm, setShowMergeConfirm] = useState(false);

	useEffect(() => {
		loadTags();
	}, []);

	const loadTags = async () => {
		setLoading(true);
		try {
			const allTags = await getAllTags();
			setTags(allTags);
		} catch (error) {
			console.error("Failed to load tags:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSelectAll = useCallback(() => {
		if (selectedTagIds.size === tags.length) {
			setSelectedTagIds(new Set());
		} else {
			setSelectedTagIds(new Set(tags.map((t) => t.id)));
		}
	}, [selectedTagIds.size, tags]);

	const toggleSelection = (tagId: string) => {
		const newSelection = new Set(selectedTagIds);
		if (newSelection.has(tagId)) {
			newSelection.delete(tagId);
		} else {
			newSelection.add(tagId);
		}
		setSelectedTagIds(newSelection);
	};

    // Delete Logic
	const handleDeleteClick = () => {
		if (selectedTagIds.size === 0) return;
        setShowDeleteConfirm(true);
	};

	const executeDelete = async () => {
		try {
			for (const tagId of selectedTagIds) {
				await deleteTag(tagId);
			}
			setSelectedTagIds(new Set());
			await loadTags();
		} catch (error) {
			console.error("Failed to delete tags:", error);
		}
	};

    // Merge Logic
	const handleMergeClick = () => {
		if (selectedTagIds.size < 2) {
			alert(t("tags:selectAtLeastTwo"));
			return;
		}
        setShowMergeConfirm(true);
    };

	const executeMerge = async () => {
		const selectedTags = tags.filter((t) => selectedTagIds.has(t.id));
		const targetTag = selectedTags[0];
		if (!targetTag) return;

		const sourceTagIds = Array.from(selectedTagIds).filter((id) => id !== targetTag.id);

		try {
			await mergeTags(targetTag.id, sourceTagIds);
			setSelectedTagIds(new Set());
			await loadTags();
		} catch (error) {
			console.error("Failed to merge tags:", error);
		}
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return;
			}

			// Ctrl+A: Select all
			if (e.ctrlKey && e.key === "a") {
				e.preventDefault();
				handleSelectAll();
			}

			// Delete: Delete selected
			if (e.key === "Delete" && selectedTagIds.size > 0) {
				e.preventDefault();
				handleDeleteClick();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleSelectAll, selectedTagIds.size]); // Remove handleDeleteClick from dependency if stable, or include it if definition changes. It's defined in the component so it changes every render unless wrapped in useCallback. I didn't wrap handleDeleteClick in useCallback in previous steps. I should probably leave it out or wrap it. 
    // To match original code style which had handleDeleteSelected in deps.
    // I'll assume handleDeleteClick is not wrapped, so adding it to deps might cause frequent re-binds, but that's acceptable for now or I can wrap it.
    // The previous code had it.
    // Let's just update the call inside and deps.

	const manualTags = tags.filter((t) => t.type === "manual");
	const aiTags = tags.filter((t) => t.type === "ai");

	return (
		<div className="p-6 flex gap-6">
			{/* Main Content */}
			<div className="flex-1 space-y-4">
				{/* Bulk Actions Bar */}
				{selectedTagIds.size > 0 && (
					<div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between">
						<span className="text-sm text-blue-300">
							{t("tags:selected")}: {selectedTagIds.size} {t("tags:tags").toLowerCase()}
						</span>
						<div className="flex gap-2">
							{selectedTagIds.size >= 2 && (
								<Button
									onClick={handleMergeClick}
									className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg flex items-center gap-2"
								>
									<Merge size={14} />
									{t("tags:mergeSelected")}
								</Button>
							)}
							<Button
								onClick={handleDeleteClick}
								className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg flex items-center gap-2"
							>
								<Trash2 size={14} />
								{t("tags:deleteSelected")}
							</Button>
						</div>
					</div>
				)}

				{/* Select All Button */}
				<div className="flex items-center justify-between">
					<Button
						onClick={handleSelectAll}
						className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-2"
					>
						{selectedTagIds.size === tags.length ? (
							<CheckSquare size={14} />
						) : (
							<Square size={14} />
						)}
						{selectedTagIds.size === tags.length
							? t("tags:deselectAll")
							: t("tags:selectAllWithShortcut")}
					</Button>
					<span className="text-xs text-gray-500">
						{t("tags:allTags")} ({tags.length})
					</span>
				</div>

				{/* Tags List */}
				{loading ? (
					<div className="flex items-center justify-center py-12 text-gray-500">
						<div className="animate-spin mr-2">⏳</div>
						{t("common:loading")}
					</div>
				) : (
					<div className="space-y-2">
						{tags.map((tag) => {
							const isSelected = selectedTagIds.has(tag.id);
							return (
								<div
									key={tag.id}
									onClick={() => toggleSelection(tag.id)}
									className={`bg-glass-bg-accent border rounded-lg p-3 cursor-pointer transition-all flex items-center gap-3 ${
										isSelected
											? "border-blue-500/50 bg-blue-500/10"
											: "border-glass-border hover:border-glass-border-light"
									}`}
								>
									<div className="flex items-center gap-3 flex-1">
										{isSelected ? (
											<CheckSquare size={16} className="text-blue-400" />
										) : (
											<Square size={16} className="text-gray-500" />
										)}
										<span className="text-sm font-medium text-white">{tag.name}</span>
										<span
											className={`px-2 py-0.5 text-[10px] rounded-full ${
												tag.type === "manual"
													? "bg-blue-500/20 text-blue-300"
													: "bg-purple-500/20 text-purple-300"
											}`}
										>
											{tag.type === "manual" ? t("tags:manualTags") : t("tags:aiTags")}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Statistics Sidebar */}
			{showStats && (
				<div className="w-64 space-y-4">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-sm font-semibold text-white flex items-center gap-2">
							<BarChart3 size={16} className="text-blue-400" />
							{t("tags:statistics")}
						</h3>
					</div>

					<div className="bg-glass-bg-accent border border-glass-border rounded-lg p-4 space-y-3">
						<div>
							<div className="text-xs text-gray-500 uppercase tracking-wider">
								{t("tags:totalTags")}
							</div>
							<div className="text-2xl font-bold text-white">{tags.length}</div>
						</div>

						<div className="h-px bg-white/10" />

						<div>
							<div className="text-xs text-gray-500 uppercase tracking-wider">
								{t("tags:manualTags")}
							</div>
							<div className="text-xl font-bold text-blue-300">{manualTags.length}</div>
						</div>

						<div>
							<div className="text-xs text-gray-500 uppercase tracking-wider">
								{t("tags:aiTags")}
							</div>
							<div className="text-xl font-bold text-purple-300">{aiTags.length}</div>
						</div>

						{selectedTagIds.size > 0 && (
							<>
								<div className="h-px bg-white/10" />
								<div>
									<div className="text-xs text-gray-500 uppercase tracking-wider">
										{t("tags:selected")}
									</div>
									<div className="text-xl font-bold text-green-300">{selectedTagIds.size}</div>
								</div>
							</>
						)}
					</div>

					<div className="text-[10px] text-gray-600 text-center px-2">
						{t("tags:keyboardShortcutTip")}
					</div>
				</div>
			)}
            
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={executeDelete}
                title={t("tags:deleteSelected")}
                message={t("tags:deleteConfirm", { count: selectedTagIds.size })}
                variant="danger"
                confirmText={t("tags:delete" as any)}
            />

            <ConfirmDialog
                isOpen={showMergeConfirm}
                onClose={() => setShowMergeConfirm(false)}
                onConfirm={executeMerge}
                title={t("tags:mergeSelected")}
                message={t("tags:mergeItemsConfirm" as any, { count: selectedTagIds.size })} 
                variant="warning"
                confirmText={t("tags:merge")}
            />
		</div>
	);
};
