import React from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { useTranslation } from "react-i18next";

interface PartialTag {
	name: string;
	count: number;
	total: number;
}

interface PartialTagsProps {
	tags: PartialTag[];
	onAddToAll: (tag: string) => void;
	onRemoveFromAll: (tag: string) => void;
}

/**
 * PartialTags - Shows tags that are present on SOME (but not all) selected items
 * Shows count and percentage with progress bar
 * Can be added to all or removed from all
 */
export const PartialTags: React.FC<PartialTagsProps> = ({
	tags,
	onAddToAll,
	onRemoveFromAll,
}) => {
	const { t } = useTranslation("tags");

	if (tags.length === 0) return null;

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-white">
					⚠️ {t("partialTags")}
				</span>
				<span className="text-xs text-gray-400">
					({tags.length})
				</span>
			</div>
			<div className="space-y-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
				{tags.map((tag) => {
					const percentage = Math.round((tag.count / tag.total) * 100);
					return (
						<div
							key={tag.name}
							className="space-y-1.5 p-2 bg-black/20 rounded border border-white/5"
						>
							<div className="flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 flex-1 min-w-0">
									<span className="text-sm text-gray-300 font-medium truncate">
										{tag.name}
									</span>
									<span className="text-xs text-gray-500 shrink-0">
										{tag.count}/{tag.total} ({percentage}%)
									</span>
								</div>
								<div className="flex gap-1 shrink-0">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onAddToAll(tag.name)}
										className="h-7 px-2 text-xs text-green-400 hover:bg-green-500/20 border border-green-500/30"
										title={t("addToAll")}
									>
										<Plus size={12} />
										<span className="hidden sm:inline ml-1">{t("addToAll")}</span>
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onRemoveFromAll(tag.name)}
										className="h-7 px-2 text-xs text-red-400 hover:bg-red-500/20 border border-red-500/30"
										title={t("removeFromAll")}
									>
										<Minus size={12} />
										<span className="hidden sm:inline ml-1">{t("removeFromAll")}</span>
									</Button>
								</div>
							</div>
							{/* Progress bar */}
							<div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
								<div
									className="bg-yellow-500/60 h-full transition-all"
									style={{ width: `${percentage}%` }}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
