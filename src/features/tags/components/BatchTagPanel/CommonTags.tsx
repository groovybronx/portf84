import React from "react";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { useTranslation } from "react-i18next";

interface CommonTagsProps {
	tags: string[];
	onRemove: (tag: string) => void;
}

/**
 * CommonTags - Shows tags that are present on ALL selected items
 * These tags can be removed from all items at once
 */
export const CommonTags: React.FC<CommonTagsProps> = ({ tags, onRemove }) => {
	const { t } = useTranslation("tags");

	if (tags.length === 0) return null;

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-white">
					✅ {t("commonTags")}
				</span>
				<span className="text-xs text-gray-400">
					({tags.length})
				</span>
			</div>
			<div className="flex flex-wrap gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
				{tags.map((tag) => (
					<span
						key={tag}
						className="px-3 py-1.5 bg-blue-500/30 text-blue-200 text-sm rounded-full border border-blue-500/50 flex items-center gap-2 font-medium"
					>
						{tag}
						<Button
							variant="close"
							size="icon-sm"
							onClick={() => onRemove(tag)}
							className="hover:bg-blue-500/20 p-0.5"
							title={t("removeFromAll")}
						>
							<X size={12} />
						</Button>
					</span>
				))}
			</div>
		</div>
	);
};
