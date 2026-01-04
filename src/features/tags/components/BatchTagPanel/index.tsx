import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag as TagIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, GlassCard } from "@/shared/components/ui";
import { PortfolioItem } from "@/shared/types";
import { CommonTags } from "./CommonTags";
import { PartialTags } from "./PartialTags";
import { TagInput } from "./TagInput";
import { QuickTags } from "./QuickTags";
import { PreviewSection } from "./PreviewSection";
import { getMostUsedTags } from "@/services/storage/tags";
import { ParsedTag } from "@/shared/types/database";

interface BatchTagPanelProps {
	isOpen: boolean;
	onClose: () => void;
	selectedItems: PortfolioItem[];
	availableTags: string[];
	onApplyChanges: (changes: TagChanges) => void;
}

export interface TagChanges {
	add: Set<string>;
	remove: Set<string>;
}

interface PartialTag {
	name: string;
	count: number;
	total: number;
}

/**
 * BatchTagPanel - Unified batch tagging interface
 * Replaces AddTagModal with enhanced features:
 * - Shows common tags (on all items)
 * - Shows partial tags (on some items) with progress bars
 * - Multi-tag input (comma-separated)
 * - Quick tags from frequently used
 * - Preview changes before applying
 */
export const BatchTagPanel: React.FC<BatchTagPanelProps> = ({
	isOpen,
	onClose,
	selectedItems,
	availableTags,
	onApplyChanges,
}) => {
	const { t } = useTranslation(["tags", "common"]);
	const [quickTags, setQuickTags] = useState<ParsedTag[]>([]);
	const [pendingChanges, setPendingChanges] = useState<TagChanges>({
		add: new Set(),
		remove: new Set(),
	});

	// Load quick tags (most used)
	useEffect(() => {
		const loadQuickTags = async () => {
			const tags = await getMostUsedTags(9); // Top 9 for keyboard shortcuts 1-9
			setQuickTags(tags);
		};
		if (isOpen) {
			loadQuickTags();
		}
	}, [isOpen]);

	// Reset pending changes when modal opens
	useEffect(() => {
		if (isOpen) {
			setPendingChanges({ add: new Set(), remove: new Set() });
		}
	}, [isOpen]);

	// Analyze tags across selected items
	const tagAnalysis = useMemo(() => {
		const tagCounts = new Map<string, number>();
		const totalItems = selectedItems.length;

		// Count how many items have each tag
		selectedItems.forEach((item) => {
			const tags = item.manualTags || [];
			tags.forEach((tag) => {
				tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
			});
		});

		// Separate into common (all items) and partial (some items)
		const common: string[] = [];
		const partial: PartialTag[] = [];

		tagCounts.forEach((count, tag) => {
			if (count === totalItems) {
				common.push(tag);
			} else {
				partial.push({ name: tag, count, total: totalItems });
			}
		});

		// Sort partial tags by count (descending)
		partial.sort((a, b) => b.count - a.count);

		return { common, partial };
	}, [selectedItems]);

	// Calculate effective tags (after pending changes)
	const effectiveTags = useMemo(() => {
		const common = new Set(tagAnalysis.common);

		// Apply pending changes
		pendingChanges.add.forEach((tag) => common.add(tag));
		pendingChanges.remove.forEach((tag) => common.delete(tag));

		return common;
	}, [tagAnalysis.common, pendingChanges]);

	// Generate preview changes
	const previewChanges = useMemo(() => {
		const changes: Array<{
			type: "add" | "remove";
			tag: string;
			itemCount: number;
		}> = [];

		pendingChanges.add.forEach((tag) => {
			// Count how many items don't have this tag
			const itemsWithoutTag = selectedItems.filter(
				(item) => !(item.manualTags || []).includes(tag)
			).length;
			if (itemsWithoutTag > 0) {
				changes.push({ type: "add", tag, itemCount: itemsWithoutTag });
			}
		});

		pendingChanges.remove.forEach((tag) => {
			// Count how many items have this tag
			const itemsWithTag = selectedItems.filter((item) =>
				(item.manualTags || []).includes(tag)
			).length;
			if (itemsWithTag > 0) {
				changes.push({ type: "remove", tag, itemCount: itemsWithTag });
			}
		});

		return changes;
	}, [pendingChanges, selectedItems]);

	// Handlers
	const handleRemoveCommonTag = (tag: string) => {
		setPendingChanges((prev) => {
			const newChanges = { ...prev };
			newChanges.remove.add(tag);
			newChanges.add.delete(tag); // Cancel any pending add
			return newChanges;
		});
	};

	const handleAddToAll = (tag: string) => {
		setPendingChanges((prev) => {
			const newChanges = { ...prev };
			newChanges.add.add(tag);
			newChanges.remove.delete(tag); // Cancel any pending remove
			return newChanges;
		});
	};

	const handleRemoveFromAll = (tag: string) => {
		setPendingChanges((prev) => {
			const newChanges = { ...prev };
			newChanges.remove.add(tag);
			newChanges.add.delete(tag); // Cancel any pending add
			return newChanges;
		});
	};

	const handleAddTags = (tags: string[]) => {
		setPendingChanges((prev) => {
			const newChanges = { ...prev };
			tags.forEach((tag) => {
				newChanges.add.add(tag);
				newChanges.remove.delete(tag); // Cancel any pending remove
			});
			return newChanges;
		});
	};

	const handleQuickTagToggle = (tag: string) => {
		if (effectiveTags.has(tag)) {
			handleRemoveFromAll(tag);
		} else {
			handleAddToAll(tag);
		}
	};

	const handleApply = () => {
		onApplyChanges(pendingChanges);
		onClose();
	};

	const handleCancel = () => {
		setPendingChanges({ add: new Set(), remove: new Set() });
		onClose();
	};

	// Keyboard shortcuts
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				handleCancel();
			} else if (e.key === "Enter" && e.ctrlKey) {
				handleApply();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, pendingChanges]);

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={handleCancel}
					className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				/>

				<GlassCard
					variant="overlay"
					padding="lg"
					border
					className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="space-y-4"
					>
						{/* Header */}
						<div className="flex items-center justify-between pb-3 border-b border-white/10">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
									<TagIcon size={20} />
								</div>
								<div>
									<h2 className="text-xl font-bold text-white">
										{t("tags:batchTagging")}
									</h2>
									<p className="text-sm text-gray-400">
										{t("tags:itemsSelected", {
											count: selectedItems.length,
										})}
									</p>
								</div>
							</div>
							<Button variant="close" size="icon" onClick={handleCancel}>
								<X size={20} />
							</Button>
						</div>

						{/* Common Tags */}
						<CommonTags
							tags={tagAnalysis.common.filter(
								(tag) => !pendingChanges.remove.has(tag)
							)}
							onRemove={handleRemoveCommonTag}
						/>

						{/* Partial Tags */}
						<PartialTags
							tags={tagAnalysis.partial}
							onAddToAll={handleAddToAll}
							onRemoveFromAll={handleRemoveFromAll}
						/>

						{/* Tag Input */}
						<TagInput
							availableTags={availableTags}
							existingTags={effectiveTags}
							onAddTags={handleAddTags}
						/>

						{/* Quick Tags */}
						<QuickTags
							tags={quickTags.map((t) => t.name)}
							appliedTags={effectiveTags}
							onToggle={handleQuickTagToggle}
						/>

						{/* Preview */}
						<PreviewSection
							changes={previewChanges}
							totalItems={selectedItems.length}
						/>

						{/* Actions */}
						<div className="flex justify-end gap-3 pt-3 border-t border-white/10">
							<Button variant="ghost" onClick={handleCancel}>
								{t("common:cancel")}
							</Button>
							<Button
								onClick={handleApply}
								disabled={
									pendingChanges.add.size === 0 &&
									pendingChanges.remove.size === 0
								}
								className="min-w-32"
							>
								{t("tags:applyChanges")}
							</Button>
						</div>

						{/* Keyboard shortcuts hint */}
						<div className="text-xs text-gray-500 text-center">
							<kbd className="px-1.5 py-0.5 bg-white/5 rounded">Esc</kbd>{" "}
							{t("common:toCancel")} •{" "}
							<kbd className="px-1.5 py-0.5 bg-white/5 rounded">
								Ctrl+Enter
							</kbd>{" "}
							{t("tags:toApply")}
						</div>
					</motion.div>
				</GlassCard>
			</div>
		</AnimatePresence>
	);
};
