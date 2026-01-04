import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TagManager } from "../src/features/tags/components/TagManager";
import { PortfolioItem } from "../src/shared/types";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/i18n";

// Mock the storage service
vi.mock("../src/services/storageService", () => ({
	storageService: {
		saveMetadata: vi.fn().mockResolvedValue(undefined),
	},
}));

// Mock the tag storage service
vi.mock("../src/services/storage/tags", () => ({
	getTagByAlias: vi.fn().mockResolvedValue(null),
	getMostUsedTags: vi.fn().mockResolvedValue([
		{ id: "tag1", name: "landscape", usage_count: 10 },
		{ id: "tag2", name: "portrait", usage_count: 8 },
		{ id: "tag3", name: "sunset", usage_count: 5 },
	]),
}));

// Mock tag suggestion service
vi.mock("../src/services/tagSuggestionService", () => ({
	suggestTagsFromSimilar: vi.fn().mockResolvedValue([]),
	extractTagsFromDescription: vi.fn().mockReturnValue([]),
}));

describe("TagManager", () => {
	let mockItem: PortfolioItem;
	let mockOnUpdateItem: (item: PortfolioItem) => void;
	let availableTags: string[];

	beforeEach(() => {
		mockItem = {
			id: "1",
			url: "test.jpg",
			name: "test.jpg",
			type: "image/jpeg",
			size: 1024,
			lastModified: Date.now(),
			manualTags: ["existing"],
		};
		mockOnUpdateItem = vi.fn() as (item: PortfolioItem) => void;
		availableTags = ["landscape", "portrait", "sunset", "nature"];

		// Clear all mocks
		vi.clearAllMocks();
	});

	afterEach(() => {
		// Clean up any event listeners
		const listeners = (window as any)._events?.keydown || [];
		listeners.forEach((listener: EventListener) => {
			window.removeEventListener("keydown", listener);
		});
	});

	describe("Keyboard Shortcuts - Performance Optimization", () => {
		it("should not re-register keyboard event listener when typing in input", async () => {
			const addEventListenerSpy = vi.spyOn(window, "addEventListener");
			const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

			const { rerender } = render(
				<I18nextProvider i18n={i18n}>
					<TagManager
						item={mockItem}
						onUpdateItem={mockOnUpdateItem}
						availableTags={availableTags}
						allItems={[]}
					/>
				</I18nextProvider>
			);

			// Wait for initial setup
			await waitFor(() => {
				const calls = addEventListenerSpy.mock.calls.filter(
					([event]) => event === "keydown"
				);
				expect(calls.length).toBeGreaterThan(0);
			});

			// Count initial event listener registrations
			const initialAddCalls = addEventListenerSpy.mock.calls.filter(
				([event]) => event === "keydown"
			).length;
			const initialRemoveCalls = removeEventListenerSpy.mock.calls.filter(
				([event]) => event === "keydown"
			).length;

			// Simulate typing in input (which updates newTag state)
			// This should NOT cause the keyboard shortcuts useEffect to re-run
			const input = screen.getByPlaceholderText(/add.*tag/i);
			input.focus();
			
			// Simulate typing multiple characters
			for (let i = 0; i < 5; i++) {
				const event = new Event("input", { bubbles: true });
				Object.defineProperty(event, "target", {
					value: { value: "test".substring(0, i + 1) },
					enumerable: true,
				});
				input.dispatchEvent(event);
			}

			// Wait a bit for any potential re-renders
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Count event listener registrations after typing
			const afterAddCalls = addEventListenerSpy.mock.calls.filter(
				([event]) => event === "keydown"
			).length;
			const afterRemoveCalls = removeEventListenerSpy.mock.calls.filter(
				([event]) => event === "keydown"
			).length;

			// The keyboard event listener should NOT have been re-registered
			// (or at most once if the quick tags update)
			expect(afterAddCalls - initialAddCalls).toBeLessThanOrEqual(1);
			expect(afterRemoveCalls - initialRemoveCalls).toBeLessThanOrEqual(1);

			addEventListenerSpy.mockRestore();
			removeEventListenerSpy.mockRestore();
		});

		it("should use stable addTagByName function in keyboard shortcuts", async () => {
			const { storageService } = await import("../src/services/storageService");
			const saveMetadataSpy = storageService.saveMetadata as any;

			render(
				<I18nextProvider i18n={i18n}>
					<TagManager
						item={mockItem}
						onUpdateItem={mockOnUpdateItem}
						availableTags={availableTags}
						allItems={[]}
					/>
				</I18nextProvider>
			);

			// Wait for quick tags to load
			await waitFor(() => {
				expect(screen.getByText("landscape")).toBeInTheDocument();
			});

			// Simulate pressing '1' key to add the first quick tag
			const event = new KeyboardEvent("keydown", {
				key: "1",
				bubbles: true,
			});
			window.dispatchEvent(event);

			// Wait for the tag to be added
			await waitFor(() => {
				expect(saveMetadataSpy).toHaveBeenCalled();
			});

			// Verify the tag was added using the stable function
			const savedItem = saveMetadataSpy.mock.calls[0][0];
			expect(savedItem.manualTags).toContain("landscape");
		});

		it("should ignore keyboard shortcuts when typing in input field", async () => {
			const { storageService } = await import("../src/services/storageService");
			const saveMetadataSpy = storageService.saveMetadata as any;

			render(
				<I18nextProvider i18n={i18n}>
					<TagManager
						item={mockItem}
						onUpdateItem={mockOnUpdateItem}
						availableTags={availableTags}
						allItems={[]}
					/>
				</I18nextProvider>
			);

			// Wait for quick tags to load
			await waitFor(() => {
				expect(screen.getByText("landscape")).toBeInTheDocument();
			});

			// Focus the input field
			const input = screen.getByPlaceholderText(/add.*tag/i);
			input.focus();

			// Simulate pressing '1' key while in input
			const event = new KeyboardEvent("keydown", {
				key: "1",
				bubbles: true,
			});
			Object.defineProperty(event, "target", { value: input, enumerable: true });
			window.dispatchEvent(event);

			// Wait a bit
			await new Promise((resolve) => setTimeout(resolve, 50));

			// Verify the tag was NOT added (shortcut was ignored)
			expect(saveMetadataSpy).not.toHaveBeenCalled();
		});
	});

	describe("Tag Addition Functions", () => {
		it("should use addTagByName for quick tag buttons", async () => {
			const { storageService } = await import("../src/services/storageService");
			const saveMetadataSpy = storageService.saveMetadata as any;

			render(
				<I18nextProvider i18n={i18n}>
					<TagManager
						item={mockItem}
						onUpdateItem={mockOnUpdateItem}
						availableTags={availableTags}
						allItems={[]}
					/>
				</I18nextProvider>
			);

			// Wait for quick tags to load
			await waitFor(() => {
				expect(screen.getByText("landscape")).toBeInTheDocument();
			});

			// Click the landscape quick tag button
			const landscapeButton = screen.getByText("landscape").closest("button");
			landscapeButton?.click();

			// Verify the tag was added
			await waitFor(() => {
				expect(saveMetadataSpy).toHaveBeenCalled();
			});

			const savedItem = saveMetadataSpy.mock.calls[0][0];
			expect(savedItem.manualTags).toContain("landscape");
		});
	});
});
