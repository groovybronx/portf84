import React, {
	createContext,
	useContext,
	useReducer,
	useCallback,
	useRef,
} from "react";
import { PortfolioItem, ViewMode } from "../shared/types";

// Types
interface SelectionState {
	selectionMode: boolean;
	selectedIds: Set<string>;
	isDragSelecting: boolean;
	dragBox: { x: number; y: number; w: number; h: number } | null;
}

type SelectionAction =
	| { type: "SET_SELECTION_MODE"; payload: boolean }
	| { type: "SET_SELECTED_IDS"; payload: Set<string> }
	| { type: "TOGGLE_SELECTION"; payload: string }
	| { type: "CLEAR_SELECTION" }
	| { type: "SET_IS_DRAG_SELECTING"; payload: boolean }
	| {
			type: "SET_DRAG_BOX";
			payload: { x: number; y: number; w: number; h: number } | null;
	  };

interface SelectionContextType extends SelectionState {
	setSelectionMode: (mode: boolean) => void;
	setSelectedIds: (ids: Set<string>) => void;
	toggleSelection: (id: string) => void;
	clearSelection: () => void;
	handleMouseDown: (
		e: React.MouseEvent,
		viewMode: ViewMode,
		processedItems: PortfolioItem[]
	) => void;
	handleMouseMove: (
		e: React.MouseEvent,
		processedItems: PortfolioItem[]
	) => void;
	handleMouseUp: () => void;
	registerItemRef: (id: string, el: HTMLElement | null) => void;
}

// Reducer
function selectionReducer(
	state: SelectionState,
	action: SelectionAction
): SelectionState {
	switch (action.type) {
		case "SET_SELECTION_MODE":
			return { ...state, selectionMode: action.payload };
		case "SET_SELECTED_IDS":
			return { ...state, selectedIds: action.payload };
		case "TOGGLE_SELECTION": {
			const newSet = new Set(state.selectedIds);
			if (newSet.has(action.payload)) {
				newSet.delete(action.payload);
			} else {
				newSet.add(action.payload);
			}
			return { ...state, selectedIds: newSet };
		}
		case "CLEAR_SELECTION":
			return { ...state, selectedIds: new Set(), selectionMode: false };
		case "SET_IS_DRAG_SELECTING":
			return { ...state, isDragSelecting: action.payload };
		case "SET_DRAG_BOX":
			return { ...state, dragBox: action.payload };
		default:
			return state;
	}
}

// Context
const SelectionContext = createContext<SelectionContextType | undefined>(
	undefined
);

// Provider
export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(selectionReducer, {
		selectionMode: false,
		selectedIds: new Set<string>(),
		isDragSelecting: false,
		dragBox: null,
	});

	// Refs for drag selection
	const dragStartPos = useRef<{ x: number; y: number } | null>(null);
	const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
	const rectCache = useRef<Map<string, DOMRect>>(new Map());
	const rafId = useRef<number | null>(null);

	// Actions
	const setSelectionMode = useCallback((mode: boolean) => {
		dispatch({ type: "SET_SELECTION_MODE", payload: mode });
	}, []);

	const setSelectedIds = useCallback((ids: Set<string>) => {
		dispatch({ type: "SET_SELECTED_IDS", payload: ids });
	}, []);

	const toggleSelection = useCallback((id: string) => {
		dispatch({ type: "TOGGLE_SELECTION", payload: id });
	}, []);

	const clearSelection = useCallback(() => {
		dispatch({ type: "CLEAR_SELECTION" });
	}, []);

	const registerItemRef = useCallback((id: string, el: HTMLElement | null) => {
		if (el) {
			itemRefs.current.set(id, el);
		} else {
			itemRefs.current.delete(id);
		}
	}, []);

	// Drag selection handlers
	const handleMouseDown = useCallback(
		(
			e: React.MouseEvent,
			viewMode: ViewMode,
			processedItems: PortfolioItem[]
		) => {
			if (viewMode === ViewMode.CAROUSEL) return;
			if (
				(e.target as HTMLElement).closest(
					"button, input, select, a, .top-bar-area, .drawer-area, .modal-area"
				)
			)
				return;
			if (e.button !== 0) return;

			// Check if click is on an item
			const clickedOnItem = (e.target as HTMLElement).closest("[data-item-id]");
			const itemId = clickedOnItem?.getAttribute("data-item-id");
			const isModifierKey = e.shiftKey || e.ctrlKey || e.metaKey;

			if (state.selectedIds.size > 0 && !isModifierKey) {
				// If clicking in the void OR on an item that isn't selected -> reset selection
				if (!itemId || !state.selectedIds.has(itemId)) {
					dispatch({ type: "CLEAR_SELECTION" });
					// If it was the void, we return to prevent immediate drag start if preferred
					// but usually we want to allow drag even after a reset.
					if (!itemId) return;
				}
			}

			dragStartPos.current = { x: e.clientX, y: e.clientY };

			// Pre-calculate rects when starting drag to avoid per-frame DOM reads
			rectCache.current.clear();
			processedItems.forEach((item) => {
				const el = itemRefs.current.get(item.id);
				if (el) rectCache.current.set(item.id, el.getBoundingClientRect());
			});
		},
		[state.selectedIds.size]
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent, processedItems: PortfolioItem[]) => {
			if (!dragStartPos.current) return;

			const currentX = e.clientX;
			const currentY = e.clientY;
			const startX = dragStartPos.current.x;
			const startY = dragStartPos.current.y;
			const width = Math.abs(currentX - startX);
			const height = Math.abs(currentY - startY);
			const x = Math.min(currentX, startX);
			const y = Math.min(currentY, startY);

			if (!state.isDragSelecting && (width > 5 || height > 5)) {
				dispatch({ type: "SET_IS_DRAG_SELECTING", payload: true });
				if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
					dispatch({ type: "SET_SELECTED_IDS", payload: new Set() });
					dispatch({ type: "SET_SELECTION_MODE", payload: true });
				}
			}

			if (state.isDragSelecting) {
				// Use requestAnimationFrame to avoid overwhelming the JS thread
				if (rafId.current) cancelAnimationFrame(rafId.current);

				rafId.current = requestAnimationFrame(() => {
					dispatch({
						type: "SET_DRAG_BOX",
						payload: { x, y, w: width, h: height },
					});
					const initialSet =
						e.shiftKey || e.ctrlKey || e.metaKey
							? state.selectedIds
							: new Set<string>();
					const newSelected = new Set(initialSet);

					rectCache.current.forEach((rect, id) => {
						const isIntersecting = !(
							rect.right < x ||
							rect.left > x + width ||
							rect.bottom < y ||
							rect.top > y + height
						);
						if (isIntersecting) newSelected.add(id);
					});
					dispatch({ type: "SET_SELECTED_IDS", payload: newSelected });
				});
			}
		},
		[state.isDragSelecting, state.selectedIds]
	);

	const handleMouseUp = useCallback(() => {
		if (state.isDragSelecting) {
			dispatch({ type: "SET_IS_DRAG_SELECTING", payload: false });
			dispatch({ type: "SET_DRAG_BOX", payload: null });
			if (rafId.current) cancelAnimationFrame(rafId.current);

			// Auto-exit selection mode after drag-select completes
			if (state.selectedIds.size > 0) {
				dispatch({ type: "SET_SELECTION_MODE", payload: false });
			}
		}
		dragStartPos.current = null;
		rectCache.current.clear();
	}, [state.isDragSelecting, state.selectedIds.size]);

	const value: SelectionContextType = {
		...state,
		setSelectionMode,
		setSelectedIds,
		toggleSelection,
		clearSelection,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		registerItemRef,
	};

	return (
		<SelectionContext.Provider value={value}>
			{children}
		</SelectionContext.Provider>
	);
};

// Hook
export const useSelection = () => {
	const context = useContext(SelectionContext);
	if (!context) {
		throw new Error("useSelection must be used within a SelectionProvider");
	}
	return context;
};
