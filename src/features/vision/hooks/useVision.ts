import { useState, useCallback } from "react";
import { PortfolioItem, AiTagDetailed } from "../../../shared/types";
import { analyzeImageStream } from "../services/geminiService";

interface UseVisionReturn {
	analyzing: boolean;
	thinkingText: string;
	error: string | null;
	analyze: (item: PortfolioItem, enableThinking?: boolean) => Promise<void>;
	reset: () => void;
}

export const useVision = (
	onUpdateItem: (item: PortfolioItem) => void
): UseVisionReturn => {
	const [analyzing, setAnalyzing] = useState(false);
	const [thinkingText, setThinkingText] = useState("");
	const [error, setError] = useState<string | null>(null);

	const reset = useCallback(() => {
		setAnalyzing(false);
		setThinkingText("");
		setError(null);
	}, []);

	const analyze = useCallback(
		async (item: PortfolioItem, enableThinking: boolean = false) => {
			setAnalyzing(true);
			setError(null);
			setThinkingText("");

			try {
				const result = await analyzeImageStream(
					item,
					(text) => setThinkingText(text), // Update thinking text as it streams
					enableThinking
				);

				onUpdateItem({
					...item,
					aiDescription: result.description,
					aiTags: result.tags,
					aiTagsDetailed: result.tagsDetailed,
				});
			} catch (e: any) {
				console.error("Vision Analysis Failed:", e);
				setError(e.message || "AI Analysis unavailable. Check API Key.");
			} finally {
				setAnalyzing(false);
			}
		},
		[onUpdateItem]
	);

	return {
		analyzing,
		thinkingText,
		error,
		analyze,
		reset,
	};
};
