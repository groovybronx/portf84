import React, { useState } from "react";
import { Tag, Plus, X } from "lucide-react";
import { PortfolioItem } from "../../../shared/types";
import { storageService } from "../../../services/storageService";

interface TagManagerProps {
	item: PortfolioItem;
	onUpdateItem: (item: PortfolioItem) => void;
	availableTags: string[];
}

export const TagManager: React.FC<TagManagerProps> = ({
	item,
	onUpdateItem,
	availableTags,
}) => {
	const [newTag, setNewTag] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);

	const suggestions = availableTags
		.filter(
			(tag) =>
				tag.toLowerCase().includes(newTag.toLowerCase()) &&
				!item.manualTags?.includes(tag)
		)
		.slice(0, 5); // Limit to 5 suggestions

	const handleAddTag = async (tagValue?: string) => {
		const tagToAdd = (tagValue || newTag).trim();
		if (!tagToAdd) return;

		const updatedTags = [...(item.manualTags || [])];
		if (!updatedTags.includes(tagToAdd)) {
			updatedTags.push(tagToAdd);
			const updatedItem = { ...item, manualTags: updatedTags };

			// Persist
			await storageService.saveMetadata(updatedItem, item.id);

			// Update UI
			onUpdateItem(updatedItem);
		}
		setNewTag("");
		setShowSuggestions(false);
	};

	const handleRemoveTag = async (tagToRemove: string) => {
		const updatedTags = (item.manualTags || []).filter(
			(t) => t !== tagToRemove
		);
		const updatedItem = { ...item, manualTags: updatedTags };

		// Persist
		await storageService.saveMetadata(updatedItem, item.id);

		// Update UI
		onUpdateItem(updatedItem);
	};

	return (
		<div className="bg-glass-bg-accent rounded-lg p-4 space-y-3 border border-glass-border-light relative">
			<div className="flex items-center gap-2 mb-2">
				<Tag size={16} className="text-blue-400" />
				<h4 className="text-sm font-medium text-white">Tags</h4>
			</div>

			<div className="flex flex-wrap gap-2">
				{/* Manual Tags */}
				{item.manualTags?.map((tag, idx) => (
					<span
						key={`manual-${idx}`}
						className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 flex items-center gap-1 group"
					>
						{tag}
						<button
							onClick={() => handleRemoveTag(tag)}
							className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
						>
							<X size={10} />
						</button>
					</span>
				))}

				{/* AI Tags (Visual only, distinct style) */}
				{item.aiTags?.map((tag, idx) => (
					<span
						key={`ai-${idx}`}
						className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/5"
						title="AI Generated"
					>
						{tag}
					</span>
				))}

				{!item.manualTags?.length && !item.aiTags?.length && (
					<span className="text-xs text-gray-500 italic">No tags yet.</span>
				)}
			</div>

			{/* Add Tag Input */}
			<div className="relative mt-3">
				<div className="flex gap-2">
					<input
						type="text"
						value={newTag}
						onChange={(e) => {
							setNewTag(e.target.value);
							setShowSuggestions(true);
						}}
						onFocus={() => setShowSuggestions(true)}
						onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault(); // Prevent form submission if in form
								handleAddTag();
							}
						}}
						placeholder="Add manual tag..."
						className="flex-1 bg-black/50 border border-glass-border text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500/50"
					/>
					<button
						onClick={() => handleAddTag()}
						disabled={!newTag.trim()}
						className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
					>
						<Plus size={14} />
					</button>
				</div>

				{/* Suggestions Dropdown */}
				{showSuggestions && newTag && suggestions.length > 0 && (
					<div className="absolute top-full left-0 right-10 mt-1 bg-gray-900 border border-glass-border rounded-lg shadow-xl z-10 overflow-hidden">
						{suggestions.map((suggestion) => (
							<button
								key={suggestion}
								className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
								onMouseDown={() => handleAddTag(suggestion)}
							>
								<Tag size={10} className="text-gray-500" />
								{suggestion}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
