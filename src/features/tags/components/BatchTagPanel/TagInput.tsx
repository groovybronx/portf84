import React, { useState, useEffect, useRef } from "react";
import { Plus, Tag as TagIcon } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { useTranslation } from "react-i18next";

// Constants
const SUGGESTION_BLUR_DELAY = 200; // Allow click events on suggestions before blur hides dropdown

interface TagInputProps {
	availableTags: string[];
	existingTags: Set<string>;
	onAddTags: (tags: string[]) => void;
	placeholder?: string;
}

/**
 * TagInput - Multi-tag input with autocomplete
 * Supports comma-separated input for adding multiple tags at once
 */
export const TagInput: React.FC<TagInputProps> = ({
	availableTags,
	existingTags,
	onAddTags,
	placeholder,
}) => {
	const { t } = useTranslation("tags");
	const [input, setInput] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Get suggestions based on current input
	const suggestions = React.useMemo(() => {
		if (!input.trim()) return [];

		// Get the last comma-separated value being typed
		const parts = input.split(",");
		const currentPart = parts[parts.length - 1].trim().toLowerCase();

		if (currentPart.length < 1) return [];

		return availableTags
			.filter(
				(tag) =>
					tag.toLowerCase().includes(currentPart) &&
					!existingTags.has(tag)
			)
			.slice(0, 5);
	}, [input, availableTags, existingTags]);

	// Handle tag submission
	const handleSubmit = (e?: React.FormEvent) => {
		if (e) e.preventDefault();

		if (!input.trim()) return;

		// Parse comma-separated tags
		const tags = input
			.split(",")
			.map((t) => t.trim())
			.filter((t) => t.length > 0)
			.filter((t) => !existingTags.has(t)); // Filter out duplicates

		if (tags.length > 0) {
			onAddTags(tags);
			setInput("");
			setShowSuggestions(false);
		}
	};

	// Handle suggestion selection
	const handleSuggestionClick = (suggestion: string) => {
		// Replace the last part with the suggestion
		const parts = input.split(",");
		parts[parts.length - 1] = suggestion;
		const newInput = parts.join(", ") + ", ";
		setInput(newInput);
		inputRef.current?.focus();
		setShowSuggestions(true); // Keep suggestions open for next tag
	};

	// Handle keyboard shortcuts
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		} else if (e.key === "Escape") {
			setShowSuggestions(false);
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-white">
					➕ {t("addTags")}
				</span>
			</div>
			<div className="relative">
				<div className="flex gap-2">
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={(e) => {
							setInput(e.target.value);
							setShowSuggestions(true);
						}}
						onFocus={() => setShowSuggestions(true)}
						onBlur={() => setTimeout(() => setShowSuggestions(false), SUGGESTION_BLUR_DELAY)}
						onKeyDown={handleKeyDown}
						placeholder={
							placeholder || t("tagInputPlaceholder")
						}
						className="flex-1 bg-black/40 border border-glass-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
					/>
					<Button
						onClick={() => handleSubmit()}
						disabled={!input.trim()}
						size="icon"
						className="shrink-0"
						title={t("addTag")}
					>
						<Plus size={18} />
					</Button>
				</div>

				{/* Suggestions dropdown */}
				{showSuggestions && suggestions.length > 0 && (
					<div className="absolute top-full left-0 right-12 mt-1 bg-gray-900 border border-glass-border rounded-lg shadow-xl z-20 overflow-hidden max-h-48 overflow-y-auto">
						{suggestions.map((suggestion) => (
							<button
								key={suggestion}
								onMouseDown={() =>
									handleSuggestionClick(suggestion)
								}
								className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
							>
								<TagIcon size={12} className="text-gray-500" />
								{suggestion}
							</button>
						))}
					</div>
				)}

				{/* Helper text */}
				<p className="text-xs text-gray-500 mt-1.5 px-1">
					{t("tagInputHint")}
				</p>
			</div>
		</div>
	);
};
