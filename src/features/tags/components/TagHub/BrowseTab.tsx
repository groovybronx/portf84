import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Grid, List, Tag as TagIcon, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { getAllTags } from "@/services/storage/tags";
import { ParsedTag } from "@/shared/types/database";

type ViewMode = "grid" | "list";
type FilterMode = "all" | "manual" | "ai" | "unused" | "mostUsed";

export const BrowseTab: React.FC = () => {
	const { t } = useTranslation(["tags", "common"]);
	const [tags, setTags] = useState<ParsedTag[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [filterMode, setFilterMode] = useState<FilterMode>("all");

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

	// Filter tags based on search and filter mode
	const filteredTags = tags.filter((tag) => {
		// Search filter
		if (searchTerm && !tag.name.toLowerCase().includes(searchTerm.toLowerCase())) {
			return false;
		}

		// Type filter
		if (filterMode === "manual" && tag.type !== "manual") return false;
		if (filterMode === "ai" && tag.type !== "ai") return false;

		return true;
	});

	const handleSearchFocus = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") {
			e.currentTarget.blur();
		}
	};

	// Keyboard shortcut for search focus
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "/" && !(e.target instanceof HTMLInputElement)) {
				e.preventDefault();
				document.getElementById("tag-search")?.focus();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<div className="p-6 space-y-4">
			{/* Search and View Controls */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
					<input
						id="tag-search"
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						onKeyDown={handleSearchFocus}
						placeholder={t("tags:searchTags")}
						className="w-full bg-glass-bg-accent border border-glass-border text-white text-sm px-10 py-2 rounded-lg focus:outline-none focus:border-blue-500/50"
					/>
					<span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 bg-glass-bg px-1.5 py-0.5 rounded">
						/
					</span>
				</div>

				{/* View Mode Toggle */}
				<div className="flex gap-1 bg-glass-bg-accent rounded-lg p-1">
					<Button
						onClick={() => setViewMode("grid")}
						aria-label={t("tags:gridView")}
						className={`p-2 rounded ${
							viewMode === "grid"
								? "bg-blue-500/20 text-blue-300"
								: "text-gray-500 hover:text-gray-300"
						}`}
					>
						<Grid size={16} />
					</Button>
					<Button
						onClick={() => setViewMode("list")}
						aria-label={t("tags:listView")}
						className={`p-2 rounded ${
							viewMode === "list"
								? "bg-blue-500/20 text-blue-300"
								: "text-gray-500 hover:text-gray-300"
						}`}
					>
						<List size={16} />
					</Button>
				</div>
			</div>

			{/* Filters */}
			<div className="flex gap-2 overflow-x-auto pb-2">
				{[
					{ id: "all" as FilterMode, label: t("tags:allTags") },
					{ id: "manual" as FilterMode, label: t("tags:manualTags") },
					{ id: "ai" as FilterMode, label: t("tags:aiTags") },
					{ id: "unused" as FilterMode, label: t("tags:unusedTags") },
					{ id: "mostUsed" as FilterMode, label: t("tags:mostUsed") },
				].map((filter) => (
					<Button
						key={filter.id}
						onClick={() => setFilterMode(filter.id)}
						className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap ${
							filterMode === filter.id
								? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
								: "bg-glass-bg-accent text-gray-400 hover:bg-glass-bg-accent-hover"
						}`}
					>
						{filter.label}
					</Button>
				))}
			</div>

			{/* Tags Display */}
			{loading ? (
				<div className="flex items-center justify-center py-12 text-gray-500">
					<div className="animate-spin mr-2">⏳</div>
					{t("common:loading")}
				</div>
			) : filteredTags.length === 0 ? (
				<div className="text-center py-12 space-y-3">
					<div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto">
						<TagIcon className="w-8 h-8 text-gray-500" />
					</div>
					<h3 className="text-lg font-medium text-white">{t("tags:noTagsYet")}</h3>
					<p className="text-sm text-white/40">{t("tags:noSimilarTags")}</p>
				</div>
			) : viewMode === "grid" ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					{filteredTags.map((tag) => (
						<div
							key={tag.id}
							className="bg-glass-bg-accent border border-glass-border rounded-lg p-4 hover:border-blue-500/50 transition-all cursor-pointer group"
						>
							<div className="flex items-start justify-between mb-2">
								<span className="text-sm font-medium text-white truncate flex-1">
									{tag.name}
								</span>
								{tag.type === "ai" && (
									<Sparkles className="w-3 h-3 text-purple-400 shrink-0 ml-1" />
								)}
							</div>
							<div className="text-xs text-gray-500">
								{tag.type === "manual" ? t("tags:manualTags") : t("tags:aiTags")}
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="space-y-2">
					{filteredTags.map((tag) => (
						<div
							key={tag.id}
							className="bg-glass-bg-accent border border-glass-border rounded-lg p-3 hover:border-blue-500/50 transition-all cursor-pointer flex items-center justify-between group"
						>
							<div className="flex items-center gap-3">
								<TagIcon className="w-4 h-4 text-gray-500" />
								<span className="text-sm font-medium text-white">{tag.name}</span>
								{tag.type === "ai" && (
									<Sparkles className="w-3 h-3 text-purple-400" />
								)}
							</div>
							<div className="text-xs text-gray-500">
								{tag.type === "manual" ? t("tags:manualTags") : t("tags:aiTags")}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Results Count */}
			{!loading && filteredTags.length > 0 && (
				<div className="text-xs text-gray-500 text-center pt-2">
					{t("tags:showingEntries", {
						start: 1,
						end: filteredTags.length,
						total: tags.length,
					})}
				</div>
			)}
		</div>
	);
};
