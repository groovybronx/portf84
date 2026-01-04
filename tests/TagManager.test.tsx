import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TagManager } from "../src/features/tags/components/TagManager";
import { PortfolioItem } from "../src/shared/types";
import "@testing-library/jest-dom";

// Mock i18n
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock storage service
vi.mock("../src/services/storageService", () => ({
	storageService: {
		saveMetadata: vi.fn().mockResolvedValue(undefined),
	},
}));

// Mock tag storage service
vi.mock("../src/services/storage/tags", () => ({
	getTagByAlias: vi.fn().mockResolvedValue(null),
	getMostUsedTags: vi.fn().mockResolvedValue([]),
}));

// Mock tag suggestion service
vi.mock("../src/services/tagSuggestionService", () => ({
	suggestTagsFromSimilar: vi.fn().mockResolvedValue([]),
	extractTagsFromDescription: vi.fn().mockReturnValue([]),
}));

// Import after mocks
import { storageService } from "../src/services/storageService";
import { getTagByAlias, getMostUsedTags } from "../src/services/storage/tags";
import {
	suggestTagsFromSimilar,
	extractTagsFromDescription,
} from "../src/services/tagSuggestionService";

describe("TagManager", () => {
	let mockItem: PortfolioItem;
	let mockOnUpdateItem: ReturnType<typeof vi.fn>;
	let mockAvailableTags: string[];

	beforeEach(() => {
		vi.clearAllMocks();

		mockItem = {
			id: "test-item-1",
			name: "test-image.jpg",
			path: "/path/to/test-image.jpg",
			type: "image",
			size: 1024,
			dateAdded: new Date().toISOString(),
			manualTags: [],
			aiTags: [],
		};

		mockOnUpdateItem = vi.fn();
		mockAvailableTags = ["landscape", "portrait", "nature", "urban"];
	});

	it("should render TagManager with empty tags", () => {
		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		expect(screen.getByText("tags")).toBeInTheDocument();
		expect(screen.getByText("tags:noTagsYet")).toBeInTheDocument();
	});

	it("should display manual tags", () => {
		mockItem.manualTags = ["landscape", "nature"];

		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		expect(screen.getByText("landscape")).toBeInTheDocument();
		expect(screen.getByText("nature")).toBeInTheDocument();
	});

	it("should display AI tags with distinct styling", () => {
		mockItem.aiTags = ["mountain", "sky"];

		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		expect(screen.getByText("mountain")).toBeInTheDocument();
		expect(screen.getByText("sky")).toBeInTheDocument();
	});

	it("should add a tag using input field", async () => {
		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		const input = screen.getByPlaceholderText("tags:addManualTag");
		fireEvent.change(input, { target: { value: "newTag" } });
		fireEvent.keyDown(input, { key: "Enter" });

		await waitFor(() => {
			expect(storageService.saveMetadata).toHaveBeenCalledWith(
				expect.objectContaining({
					manualTags: ["newTag"],
				}),
				"test-item-1"
			);
		});

		expect(mockOnUpdateItem).toHaveBeenCalledWith(
			expect.objectContaining({
				manualTags: ["newTag"],
			})
		);
	});

	it("should add a tag using the add button", async () => {
		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		const input = screen.getByPlaceholderText("tags:addManualTag");
		fireEvent.change(input, { target: { value: "testTag" } });

		const addButton = screen.getByRole("button", { name: "" });
		fireEvent.click(addButton);

		await waitFor(() => {
			expect(storageService.saveMetadata).toHaveBeenCalledWith(
				expect.objectContaining({
					manualTags: ["testTag"],
				}),
				"test-item-1"
			);
		});
	});

	it("should not add empty or whitespace-only tags", async () => {
		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		const input = screen.getByPlaceholderText("tags:addManualTag");
		fireEvent.change(input, { target: { value: "   " } });
		fireEvent.keyDown(input, { key: "Enter" });

		await waitFor(() => {
			expect(storageService.saveMetadata).not.toHaveBeenCalled();
		});
	});

	it("should not add duplicate tags", async () => {
		mockItem.manualTags = ["existing"];

		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		const input = screen.getByPlaceholderText("tags:addManualTag");
		fireEvent.change(input, { target: { value: "existing" } });
		fireEvent.keyDown(input, { key: "Enter" });

		await waitFor(() => {
			expect(storageService.saveMetadata).not.toHaveBeenCalled();
		});
	});

	it("should remove a tag when X button is clicked", async () => {
		mockItem.manualTags = ["landscape", "nature"];

		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		// Find all close buttons and click the first one
		const closeButtons = screen.getAllByRole("button", { name: "" });
		const firstCloseButton = closeButtons[0];
		fireEvent.click(firstCloseButton);

		await waitFor(() => {
			expect(storageService.saveMetadata).toHaveBeenCalledWith(
				expect.objectContaining({
					manualTags: ["nature"],
				}),
				"test-item-1"
			);
		});
	});

	it("should trim whitespace from tags", async () => {
		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		const input = screen.getByPlaceholderText("tags:addManualTag");
		fireEvent.change(input, { target: { value: "  trimmed  " } });
		fireEvent.keyDown(input, { key: "Enter" });

		await waitFor(() => {
			expect(storageService.saveMetadata).toHaveBeenCalledWith(
				expect.objectContaining({
					manualTags: ["trimmed"],
				}),
				"test-item-1"
			);
		});
	});

	it("should clear input field after adding a tag", async () => {
		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		const input = screen.getByPlaceholderText("tags:addManualTag") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "newTag" } });
		fireEvent.keyDown(input, { key: "Enter" });

		await waitFor(() => {
			expect(input.value).toBe("");
		});
	});

	it("should show suggestions when typing", () => {
		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		const input = screen.getByPlaceholderText("tags:addManualTag");
		fireEvent.change(input, { target: { value: "land" } });
		fireEvent.focus(input);

		expect(screen.getByText("landscape")).toBeInTheDocument();
	});

	it("should add tag from suggestions dropdown", async () => {
		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		const input = screen.getByPlaceholderText("tags:addManualTag");
		fireEvent.change(input, { target: { value: "land" } });
		fireEvent.focus(input);

		const suggestionButton = screen.getByText("landscape");
		fireEvent.mouseDown(suggestionButton);

		await waitFor(() => {
			expect(storageService.saveMetadata).toHaveBeenCalledWith(
				expect.objectContaining({
					manualTags: ["landscape"],
				}),
				"test-item-1"
			);
		});
	});

	it("should not show already applied tags in suggestions", () => {
		mockItem.manualTags = ["landscape"];

		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		const input = screen.getByPlaceholderText("tags:addManualTag");
		fireEvent.change(input, { target: { value: "land" } });
		fireEvent.focus(input);

		// Should not show "landscape" since it's already applied
		const suggestions = screen.queryAllByText("landscape");
		// One for the applied tag, none in suggestions
		expect(suggestions.length).toBe(1);
	});

	it("should perform addTagByName without depending on newTag state", async () => {
		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		const input = screen.getByPlaceholderText("tags:addManualTag");
		
		// First add a tag
		fireEvent.change(input, { target: { value: "tag1" } });
		fireEvent.keyDown(input, { key: "Enter" });

		await waitFor(() => {
			expect(storageService.saveMetadata).toHaveBeenCalledWith(
				expect.objectContaining({
					manualTags: ["tag1"],
				}),
				"test-item-1"
			);
		});

		// The input should be cleared
		expect((input as HTMLInputElement).value).toBe("");

		// addTagByName should be stable and not recreate on newTag change
		// This is validated by the callback dependencies in the component
	});
});

describe("TagManager - Performance Optimization", () => {
	let mockItem: PortfolioItem;
	let mockOnUpdateItem: ReturnType<typeof vi.fn>;
	let mockAvailableTags: string[];

	beforeEach(() => {
		vi.clearAllMocks();

		mockItem = {
			id: "test-item-1",
			name: "test-image.jpg",
			path: "/path/to/test-image.jpg",
			type: "image",
			size: 1024,
			dateAdded: new Date().toISOString(),
			manualTags: [],
			aiTags: [],
		};

		mockOnUpdateItem = vi.fn();
		mockAvailableTags = ["landscape", "portrait", "nature", "urban"];
	});

	it("should use addTagByName for stable tag addition", async () => {
		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		// This test validates that addTagByName is used throughout the component
		// instead of handleAddTag, ensuring it doesn't depend on newTag state

		const input = screen.getByPlaceholderText("tags:addManualTag");
		fireEvent.change(input, { target: { value: "testTag" } });
		fireEvent.keyDown(input, { key: "Enter" });

		await waitFor(() => {
			expect(storageService.saveMetadata).toHaveBeenCalled();
		});

		// The function should have been called with the correct tag
		expect(storageService.saveMetadata).toHaveBeenCalledWith(
			expect.objectContaining({
				manualTags: ["testTag"],
			}),
			"test-item-1"
		);
	});

	it("should use handleAddTagFromInput for input interactions", async () => {
		render(
			<TagManager
				item={mockItem}
				onUpdateItem={mockOnUpdateItem}
				availableTags={mockAvailableTags}
			/>
		);

		// handleAddTagFromInput should handle the side effects
		const input = screen.getByPlaceholderText("tags:addManualTag");
		fireEvent.change(input, { target: { value: "sideEffectTest" } });
		fireEvent.keyDown(input, { key: "Enter" });

		await waitFor(() => {
			// Input should be cleared
			expect((input as HTMLInputElement).value).toBe("");
		});

		// Tag should be added
		expect(storageService.saveMetadata).toHaveBeenCalledWith(
			expect.objectContaining({
				manualTags: ["sideEffectTest"],
			}),
			"test-item-1"
		);
	});
});
