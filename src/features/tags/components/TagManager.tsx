import React, { useState, useEffect, useCallback } from "react";
import { Tag, Plus, X, Sparkles, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PortfolioItem } from "../../../shared/types";
import { storageService } from "../../../services/storageService";
import { getTagByAlias, getMostUsedTags } from "../../../services/storage/tags";
import { ParsedTag } from "../../../shared/types/database";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../shared/components/ui";
import {
	suggestTagsFromSimilar,
	extractTagsFromDescription,
} from "../../../services/tagSuggestionService";

// Constants
const ALIAS_CHECK_DEBOUNCE_MS = 300;

interface TagManagerProps {
	item: PortfolioItem;
	onUpdateItem: (item: PortfolioItem) => void;
	availableTags: string[];
	allItems?: PortfolioItem[]; // Optional: for smart suggestions from similar images
}

export const TagManager: React.FC<TagManagerProps> = ({
	item,
	onUpdateItem,
	availableTags,
	allItems = [],
}) => {
	const { t } = useTranslation(["tags", "library"]);
	const [newTag, setNewTag] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [aliasSuggestion, setAliasSuggestion] = useState<string | null>(null);
	const [quickTags, setQuickTags] = useState<ParsedTag[]>([]);
	const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
	const [extractedTags, setExtractedTags] = useState<string[]>([]);

	// Load quick tags (most used)
	useEffect(() => {
		const loadQuickTags = async () => {
			const used = await getMostUsedTags(9); // Top 9 for shortcuts 1-9
			setQuickTags(used);
		};
		loadQuickTags();
	}, [item.manualTags]);

	// Load smart suggestions from similar images
	useEffect(() => {
		const loadSuggestions = async () => {
			if (item.aiDescription && allItems.length > 0) {
				const suggestions = await suggestTagsFromSimilar(
					item,
					allItems,
					5
				);
				setSuggestedTags(suggestions);
			}
		};
		loadSuggestions();
	}, [item.id, item.aiDescription, allItems]);

	// Extract tags from AI description
	useEffect(() => {
		if (item.aiDescription) {
			const extracted = extractTagsFromDescription(item.aiDescription);
			// Filter out tags already applied
			const filtered = extracted.filter(
				(tag) => !(item.manualTags || []).includes(tag)
			);
			setExtractedTags(filtered);
		}
	}, [item.aiDescription, item.manualTags]);


	// Check for alias suggestions when user types
	useEffect(() => {
		const checkAlias = async () => {
			if (newTag.trim().length < 2) {
				setAliasSuggestion(null);
				return;
			}

			try {
				const aliasTag = await getTagByAlias(newTag.trim());
				if (aliasTag && !item.manualTags?.includes(aliasTag.name)) {
					setAliasSuggestion(aliasTag.name);
				} else {
					setAliasSuggestion(null);
				}
			} catch {
				setAliasSuggestion(null);
			}
		};

		const timer = setTimeout(checkAlias, ALIAS_CHECK_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [newTag, item.manualTags]);

	const suggestions = availableTags
		.filter(
			(tag) =>
				tag.toLowerCase().includes(newTag.toLowerCase()) &&
				!item.manualTags?.includes(tag)
		)
		.slice(0, 5); // Limit to 5 suggestions

	const handleAddTag = useCallback(async (tagValue?: string) => {
		const tagToAdd = (tagValue || newTag).trim();
		if (!tagToAdd) return;

		const updatedTags = [...(item.manualTags || [])];
		if (!updatedTags.includes(tagToAdd)) {
			updatedTags.push(tagToAdd);
			const updatedItem = { ...item, manualTags: updatedTags };

			await storageService.saveMetadata(updatedItem, item.id);
			onUpdateItem(updatedItem);
		}
		setNewTag("");
		setShowSuggestions(false);
		setAliasSuggestion(null);
	}, [newTag, item, onUpdateItem]);

	const handleRemoveTag = useCallback(async (tagToRemove: string) => {
		const updatedTags = (item.manualTags || []).filter(
			(t) => t !== tagToRemove
		);
		const updatedItem = { ...item, manualTags: updatedTags };

		await storageService.saveMetadata(updatedItem, item.id);
		onUpdateItem(updatedItem);
	}, [item, onUpdateItem]);

	// Keyboard shortcuts for quick tags (1-9)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore if typing in input
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			// Check for number keys 1-9
			const key = parseInt(e.key);
			if (!isNaN(key) && key >= 1 && key <= 9) {
				e.preventDefault();
				const tagIndex = key - 1;
				if (quickTags[tagIndex]) {
					const tag = quickTags[tagIndex];
					const isApplied = item.manualTags?.includes(tag.name);
					if (isApplied) {
						handleRemoveTag(tag.name);
					} else {
						handleAddTag(tag.name);
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [quickTags, item.manualTags, handleAddTag, handleRemoveTag]);


	return (
		<div className="bg-glass-bg-accent rounded-lg p-4 space-y-3 border border-glass-border-light relative">
			<div className="flex items-center gap-2 mb-2">
				<Tag size={16} className="text-blue-400" />
				<h4 className="text-sm font-medium text-white">{t('tags')}</h4>
			</div>

			<div className="flex flex-wrap gap-2">
				{/* Manual Tags */}
				{item.manualTags?.map((tag, idx) => (
					<span
						key={`manual-${idx}`}
						className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 flex items-center gap-1 group"
					>
						{tag}
						<Button
							variant="close"
							size="icon-sm"
							onClick={() => handleRemoveTag(tag)}
							className="opacity-0 group-hover:opacity-100 p-0"
						>
							<X size={10} />
						</Button>
					</span>
				))}

				{/* AI Tags (Visual only, distinct style) */}
				{item.aiTags?.map((tag, idx) => (
					<span
						key={`ai-${idx}`}
						className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/5"
						title={t('tags:aiGenerated')}
					>
						{tag}
					</span>
				))}

				{!item.manualTags?.length && !item.aiTags?.length && (
					<span className="text-xs text-gray-500 italic">{t('tags:noTagsYet')}</span>
				)}
			</div>

			{/* Quick Tags (Most Used) with Keyboard Shortcuts */}
			{quickTags.length > 0 && (
				<div className="space-y-1">
					<span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-1">
						{t('tags:quickTags')} (1-9)
					</span>
					<div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
						{quickTags.map((tag, idx) => {
							const isApplied = item.manualTags?.includes(tag.name);
							const shortcutKey = idx + 1;
							return (
								<Button
									key={tag.id}
									variant="ghost"
									size="sm"
									onClick={() => isApplied ? handleRemoveTag(tag.name) : handleAddTag(tag.name)}
									className={`px-2.5 py-1 text-[11px] rounded-md border shrink-0 h-auto ${
										isApplied 
											? 'bg-blue-500/30 border-blue-500/50 text-blue-200' 
											: 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
									}`}
									title={`Press ${shortcutKey} to toggle`}
								>
									<span className="opacity-50 mr-1">{shortcutKey}</span>
									{tag.name}
								</Button>
							);
						})}
					</div>
				</div>
			)}

			{/* Suggested Tags from Similar Images */}
			{suggestedTags.length > 0 && (
				<div className="space-y-1.5">
					<div className="flex items-center gap-1.5">
						<Lightbulb size={12} className="text-purple-400" />
						<span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
							{t('tags:suggestedFromSimilar')}
						</span>
					</div>
					<div className="flex flex-wrap gap-1.5 p-2 bg-purple-500/5 border border-purple-500/20 rounded">
						{suggestedTags.map((tag) => (
							<Button
								key={tag}
								variant="ghost"
								size="sm"
								onClick={() => handleAddTag(tag)}
								className="px-2 py-1 text-[11px] rounded border border-purple-400/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/50 h-auto"
							>
								<Plus size={10} className="mr-1" />
								{tag}
							</Button>
						))}
					</div>
				</div>
			)}

			{/* Extract Tags from AI Description */}
			{extractedTags.length > 0 && (
				<div className="space-y-1.5">
					<div className="flex items-center gap-1.5">
						<Sparkles size={12} className="text-green-400" />
						<span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
							{t('tags:extractFromAI')}
						</span>
					</div>
					<div className="flex flex-wrap gap-1.5 p-2 bg-green-500/5 border border-green-500/20 rounded">
						{extractedTags.slice(0, 6).map((tag) => (
							<Button
								key={tag}
								variant="ghost"
								size="sm"
								onClick={() => handleAddTag(tag)}
								className="px-2 py-1 text-[11px] rounded border border-green-400/30 bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:border-green-400/50 h-auto"
							>
								<Plus size={10} className="mr-1" />
								{tag}
							</Button>
						))}
						{extractedTags.length > 6 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									// Add all extracted tags
									extractedTags.forEach((tag) => handleAddTag(tag));
								}}
								className="px-2 py-1 text-[11px] rounded border border-green-400/30 bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:border-green-400/50 h-auto"
							>
								{t('tags:extractAll')} ({extractedTags.length})
							</Button>
						)}
					</div>
				</div>
			)}

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
						onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleAddTag();
							}
						}}
						placeholder={t('tags:addManualTag')}
						className="flex-1 bg-black/50 border border-glass-border text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500/50"
					/>
					<Button
						onClick={() => handleAddTag()}
						disabled={!newTag.trim()}
						size="icon-sm"
					>
						<Plus size={14} />
					</Button>
				</div>

				{/* Alias Suggestion Banner */}
				{aliasSuggestion && newTag && (
					<div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center gap-2">
						<Sparkles size={14} className="text-purple-400 shrink-0" />
						<div className="flex-1 text-xs">
							<span className="text-gray-400">{t('tags:didYouMean')}</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleAddTag(aliasSuggestion)}
								className="text-purple-300 hover:text-purple-200 font-medium underline h-auto py-0 px-1"
							>
								{aliasSuggestion}
							</Button>
						</div>
					</div>
				)}

				{/* Suggestions Dropdown */}
				{showSuggestions && newTag && suggestions.length > 0 && !aliasSuggestion && (
					<div className="absolute top-full left-0 right-10 mt-1 bg-gray-900 border border-glass-border rounded-lg shadow-xl z-10 overflow-hidden">
						{suggestions.map((suggestion) => (
							<Button
								key={suggestion}
								variant="ghost"
								className="w-full justify-start gap-2 rounded-none text-xs"
								onMouseDown={() => handleAddTag(suggestion)}
							>
								<Tag size={10} className="text-gray-500" />
								{suggestion}
							</Button>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
