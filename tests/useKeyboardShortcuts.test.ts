import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardShortcuts } from "../src/shared/hooks/useKeyboardShortcuts";
import { PortfolioItem, COLOR_PALETTE } from "../src/shared/types";

describe("useKeyboardShortcuts", () => {
	let mockSetFocusedId: (id: string) => void;
	let mockSetSelectedItem: (item: PortfolioItem) => void;
	let mockApplyColorTagToSelection: (color: string | undefined) => void;
	let mockItems: PortfolioItem[];

	beforeEach(() => {
		mockSetFocusedId = vi.fn() as (id: string) => void;
		mockSetSelectedItem = vi.fn() as (item: PortfolioItem) => void;
		mockApplyColorTagToSelection = vi.fn() as (color: string | undefined) => void;

		// Create mock items
		mockItems = [
			{
				id: "1",
				url: "test1.jpg",
				name: "test1.jpg",
				type: "image/jpeg",
				size: 1024,
				lastModified: Date.now(),
			},
			{
				id: "2",
				url: "test2.jpg",
				name: "test2.jpg",
				type: "image/jpeg",
				size: 1024,
				lastModified: Date.now(),
			},
			{
				id: "3",
				url: "test3.jpg",
				name: "test3.jpg",
				type: "image/jpeg",
				size: 1024,
				lastModified: Date.now(),
			},
			{
				id: "4",
				url: "test4.jpg",
				name: "test4.jpg",
				type: "image/jpeg",
				size: 1024,
				lastModified: Date.now(),
			},
		];

		vi.clearAllMocks();
	});

	describe("Navigation", () => {
		it("should focus first item when no item is focused and arrow key is pressed", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: null,
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			// Simulate ArrowRight key press
			const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
			window.dispatchEvent(event);

			expect(mockSetFocusedId).toHaveBeenCalledWith("1");
		});

		it("should navigate right with ArrowRight", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "1",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
			window.dispatchEvent(event);

			expect(mockSetFocusedId).toHaveBeenCalledWith("2");
		});

		it("should navigate left with ArrowLeft", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "2",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
			window.dispatchEvent(event);

			expect(mockSetFocusedId).toHaveBeenCalledWith("1");
		});

		it("should navigate down with ArrowDown (respecting gridColumns)", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "1",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
			window.dispatchEvent(event);

			// With gridColumns=2, item 1 (index 0) should jump to item 3 (index 2)
			expect(mockSetFocusedId).toHaveBeenCalledWith("3");
		});

		it("should navigate up with ArrowUp (respecting gridColumns)", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "3",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
			window.dispatchEvent(event);

			// With gridColumns=2, item 3 (index 2) should jump to item 1 (index 0)
			expect(mockSetFocusedId).toHaveBeenCalledWith("1");
		});

		it("should not navigate beyond last item", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "4",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
			window.dispatchEvent(event);

			// Should stay on item 4
			expect(mockSetFocusedId).not.toHaveBeenCalled();
		});

		it("should not navigate before first item", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "1",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
			window.dispatchEvent(event);

			// Should stay on item 1
			expect(mockSetFocusedId).not.toHaveBeenCalled();
		});
	});

	describe("Selection", () => {
		it("should open focused item with Space key", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "2",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			const event = new KeyboardEvent("keydown", { key: " " });
			window.dispatchEvent(event);

			expect(mockSetSelectedItem).toHaveBeenCalledWith(mockItems[1]);
		});

		it("should open focused item with Enter key", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "3",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			const event = new KeyboardEvent("keydown", { key: "Enter" });
			window.dispatchEvent(event);

			expect(mockSetSelectedItem).toHaveBeenCalledWith(mockItems[2]);
		});

		it("should not open item when nothing is focused", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: null,
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			const event = new KeyboardEvent("keydown", { key: " " });
			window.dispatchEvent(event);

			expect(mockSetSelectedItem).not.toHaveBeenCalled();
		});
	});

	describe("Color Tagging", () => {
		it("should apply color tag when pressing 1-6", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "1",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			// Test each color key
			for (let i = 1; i <= 6; i++) {
				const event = new KeyboardEvent("keydown", { key: i.toString() });
				window.dispatchEvent(event);

				expect(mockApplyColorTagToSelection).toHaveBeenCalledWith(
					COLOR_PALETTE[i.toString()]
				);
			}

			expect(mockApplyColorTagToSelection).toHaveBeenCalledTimes(6);
		});

		it("should remove color tag when pressing 0", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "1",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			const event = new KeyboardEvent("keydown", { key: "0" });
			window.dispatchEvent(event);

			expect(mockApplyColorTagToSelection).toHaveBeenCalledWith(undefined);
		});

		it("should not apply color for keys 7-9", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "1",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			const event7 = new KeyboardEvent("keydown", { key: "7" });
			const event8 = new KeyboardEvent("keydown", { key: "8" });
			const event9 = new KeyboardEvent("keydown", { key: "9" });

			window.dispatchEvent(event7);
			window.dispatchEvent(event8);
			window.dispatchEvent(event9);

			expect(mockApplyColorTagToSelection).not.toHaveBeenCalled();
		});
	});

	describe("Input/Textarea Exclusion", () => {
		it("should ignore keyboard shortcuts when typing in input", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "1",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			// Create a fake input element
			const input = document.createElement("input");
			document.body.appendChild(input);

			// Dispatch event from input
			const event = new KeyboardEvent("keydown", {
				key: "ArrowRight",
				bubbles: true,
			});
			Object.defineProperty(event, "target", { value: input, enumerable: true });
			window.dispatchEvent(event);

			expect(mockSetFocusedId).not.toHaveBeenCalled();

			document.body.removeChild(input);
		});

		it("should ignore keyboard shortcuts when typing in textarea", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "1",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			// Create a fake textarea element
			const textarea = document.createElement("textarea");
			document.body.appendChild(textarea);

			// Dispatch event from textarea
			const event = new KeyboardEvent("keydown", {
				key: "1",
				bubbles: true,
			});
			Object.defineProperty(event, "target", {
				value: textarea,
				enumerable: true,
			});
			window.dispatchEvent(event);

			expect(mockApplyColorTagToSelection).not.toHaveBeenCalled();

			document.body.removeChild(textarea);
		});
	});

	describe("Edge Cases", () => {
		it("should handle empty items array", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: [],
					focusedId: null,
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
			window.dispatchEvent(event);

			expect(mockSetFocusedId).not.toHaveBeenCalled();
		});

		it("should handle invalid focusedId", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: "invalid-id",
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
				})
			);

			const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
			window.dispatchEvent(event);

			// Should focus first item when current focus is invalid
			expect(mockSetFocusedId).toHaveBeenCalledWith("1");
		});
	describe("Global Shortcuts", () => {
		const mockCallbacks = {
			onOpenBatchTagPanel: vi.fn(),
			onOpenHelp: vi.fn(),
			onSelectAll: vi.fn(),
			onDelete: vi.fn(),
			onClearSelection: vi.fn(),
		};

		beforeEach(() => {
			vi.clearAllMocks();
		});

		it("should trigger Help with ?", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: null,
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
					...mockCallbacks,
				})
			);

			window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }));
			expect(mockCallbacks.onOpenHelp).toHaveBeenCalled();
		});

		it("should trigger Select All with Ctrl+A", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: null,
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
					...mockCallbacks,
				})
			);

			window.dispatchEvent(new KeyboardEvent("keydown", { key: "a", ctrlKey: true }));
			expect(mockCallbacks.onSelectAll).toHaveBeenCalled();
		});

		it("should trigger Delete with Delete key", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: null,
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
					...mockCallbacks,
				})
			);

			window.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete" }));
			expect(mockCallbacks.onDelete).toHaveBeenCalled();
		});

		it("should trigger Clear Selection with Esc", () => {
			renderHook(() =>
				useKeyboardShortcuts({
					processedItems: mockItems,
					focusedId: null,
					setFocusedId: mockSetFocusedId,
					setSelectedItem: mockSetSelectedItem,
					applyColorTagToSelection: mockApplyColorTagToSelection,
					gridColumns: 2,
					...mockCallbacks,
				})
			);

			window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
			expect(mockCallbacks.onClearSelection).toHaveBeenCalled();
		});
	});
});
});
