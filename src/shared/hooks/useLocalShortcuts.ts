import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "../constants";

export interface ShortcutMap {
	NAV_UP: string[];
	NAV_DOWN: string[];
	NAV_LEFT: string[];
	NAV_RIGHT: string[];
	OPEN_VIEW: string[]; // Space / Enter
	TAG_RED: string[];
	TAG_ORANGE: string[];
	TAG_YELLOW: string[];
	TAG_GREEN: string[];
	TAG_BLUE: string[];
	TAG_PURPLE: string[];
	TAG_REMOVE: string[];
}

const DEFAULT_SHORTCUTS: ShortcutMap = {
	NAV_UP: ["ArrowUp"],
	NAV_DOWN: ["ArrowDown"],
	NAV_LEFT: ["ArrowLeft"],
	NAV_RIGHT: ["ArrowRight"],
	OPEN_VIEW: [" ", "Enter"],
	TAG_RED: ["1"],
	TAG_ORANGE: ["2"],
	TAG_YELLOW: ["3"],
	TAG_GREEN: ["4"],
	TAG_BLUE: ["5"],
	TAG_PURPLE: ["6"],
	TAG_REMOVE: ["0"],
};

export const useLocalShortcuts = () => {
	const [shortcuts, setShortcuts] = useState<ShortcutMap>(DEFAULT_SHORTCUTS);

	// Load from storage on mount
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEYS.SHORTCUTS);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				// Merge with defaults to ensure all keys exist (in case of updates)
				setShortcuts((prev) => ({ ...prev, ...parsed }));
			} catch (e) {
				console.error("Failed to parse local shortcuts", e);
			}
		}
	}, []);

	const updateShortcut = (action: keyof ShortcutMap, keys: string[]) => {
		setShortcuts((prev) => {
			const updated = { ...prev, [action]: keys };
			localStorage.setItem(STORAGE_KEYS.SHORTCUTS, JSON.stringify(updated));
			return updated;
		});
	};

	const resetToDefaults = () => {
		setShortcuts(DEFAULT_SHORTCUTS);
		localStorage.removeItem(STORAGE_KEYS.SHORTCUTS);
	};

	return { shortcuts, updateShortcut, resetToDefaults };
};
