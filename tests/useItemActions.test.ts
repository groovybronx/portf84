import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useItemActions } from "../src/shared/hooks/useItemActions";
import { PortfolioItem } from "../src/shared/types";
import * as visionModule from "../src/features/vision/services/geminiService";

// Mock the analyzeImage function
vi.mock("../src/features/vision/services/geminiService", () => ({
	analyzeImage: vi.fn(),
}));

describe("useItemActions", () => {
	let mockUpdateItem: any;
	let mockUpdateItems: any;
	let mockClearSelection: any;
	let mockSetSelectedIds: any;
	let mockCreateVirtualFolder: any;
	let mockMoveItemsToFolder: any;
	let mockSetIsMoveModalOpen: any;
	let mockItems: PortfolioItem[];
	let mockSelectedIds: Set<string>;

	beforeEach(() => {
		mockUpdateItem = vi.fn();
		mockUpdateItems = vi.fn();
		mockClearSelection = vi.fn();
		mockSetSelectedIds = vi.fn();
		mockCreateVirtualFolder = vi.fn().mockReturnValue("new-folder-id");
		mockMoveItemsToFolder = vi.fn();
		mockSetIsMoveModalOpen = vi.fn();

		mockItems = [
			{
				id: "1",
				url: "test1.jpg",
				name: "test1.jpg",
				type: "image/jpeg",
				size: 1024,
				lastModified: Date.now(),
				manualTags: ["existing-tag"],
			},
			{
				id: "2",
				url: "test2.jpg",
				name: "test2.jpg",
				type: "image/jpeg",
				size: 1024,
				lastModified: Date.now(),
				manualTags: [],
			},
			{
				id: "3",
				url: "test3.jpg",
				name: "test3.jpg",
				type: "image/jpeg",
				size: 1024,
				lastModified: Date.now(),
			},
		];

		mockSelectedIds = new Set<string>();

		vi.clearAllMocks();
	});

	describe("addTagsToSelection", () => {
		it("should add tag to selected items", async () => {
			mockSelectedIds.add("1");
			mockSelectedIds.add("2");

			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: mockSelectedIds,
					selectedItem: null,
					focusedId: null,
					selectionMode: true,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			await result.current.addTagsToSelection("new-tag");

			expect(mockUpdateItems).toHaveBeenCalledTimes(1);
			expect(mockUpdateItems).toHaveBeenCalledWith([
				{
					...mockItems[0],
					manualTags: ["existing-tag", "new-tag"],
				},
				{
					...mockItems[1],
					manualTags: ["new-tag"],
				}
			]);
		});

		it("should add tag to context menu item when no selection", async () => {
			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: new Set(),
					selectedItem: null,
					focusedId: null,
					selectionMode: false,
					contextMenuItem: mockItems[2] ?? null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			await result.current.addTagsToSelection("context-tag");

			expect(mockUpdateItems).toHaveBeenCalledTimes(1);
			expect(mockUpdateItems).toHaveBeenCalledWith([
				{
					...mockItems[2],
					manualTags: ["context-tag"],
				}
			]);
		});

		it("should not duplicate existing tags", async () => {
			mockSelectedIds.add("1");

			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: mockSelectedIds,
					selectedItem: null,
					focusedId: null,
					selectionMode: true,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			await result.current.addTagsToSelection("existing-tag");

			expect(mockUpdateItems).toHaveBeenCalledWith([
				{
					...mockItems[0],
					// no change expected, existing tag remains
				}
			]);
		});

		it("should do nothing when no items to update", async () => {
			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: new Set(),
					selectedItem: null,
					focusedId: null,
					selectionMode: false,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			await result.current.addTagsToSelection("tag");

			expect(mockUpdateItems).not.toHaveBeenCalled();
		});
	});

	describe("applyColorTagToSelection", () => {
		it("should apply color to selected item in fullscreen mode", () => {
			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: new Set(),
					selectedItem: mockItems[0] ?? null,
					focusedId: null,
					selectionMode: false,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			result.current.applyColorTagToSelection("#ff0000");

			expect(mockUpdateItems).toHaveBeenCalledWith([
				{
					...mockItems[0],
					colorTag: "#ff0000",
				}
			]);
		});

		it("should apply color to multiple selected items in selection mode", () => {
			mockSelectedIds.add("1");
			mockSelectedIds.add("2");

			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: mockSelectedIds,
					selectedItem: null,
					focusedId: null,
					selectionMode: true,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			result.current.applyColorTagToSelection("#00ff00");

			expect(mockUpdateItems).toHaveBeenCalledTimes(1);
			expect(mockUpdateItems).toHaveBeenCalledWith([
				{ ...mockItems[0], colorTag: "#00ff00" },
				{ ...mockItems[1], colorTag: "#00ff00" }
			]);
		});

		it("should apply color to focused item when no selection", () => {
			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: new Set(),
					selectedItem: null,
					focusedId: "2",
					selectionMode: false,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			result.current.applyColorTagToSelection("#0000ff");

			expect(mockUpdateItems).toHaveBeenCalledWith([
				{
					...mockItems[1],
					colorTag: "#0000ff",
				}
			]);
		});

		it("should remove color tag when undefined", () => {
			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: new Set(),
					selectedItem: mockItems[0] ?? null,
					focusedId: null,
					selectionMode: false,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			result.current.applyColorTagToSelection(undefined);

			expect(mockUpdateItems).toHaveBeenCalledWith([
				{
					...mockItems[0],
					colorTag: undefined,
				}
			]);
		});

	});

	describe("analyzeItem", () => {
		it("should analyze item and update with AI results", async () => {
			const mockAnalyzeResult = {
				description: "AI description",
				tags: ["tag1", "tag2"],
				tagsDetailed: [
					{ name: "tag1", confidence: 0.9 },
					{ name: "tag2", confidence: 0.8 },
				],
			};

			vi.mocked(visionModule.analyzeImage).mockResolvedValue(
				mockAnalyzeResult
			);

			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: new Set(),
					selectedItem: null,
					focusedId: null,
					selectionMode: false,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			await result.current.analyzeItem(mockItems[0]!);

			expect(visionModule.analyzeImage).toHaveBeenCalledWith(mockItems[0]);
			expect(mockUpdateItem).toHaveBeenCalledWith({
				...mockItems[0],
				aiDescription: "AI description",
				aiTags: ["tag1", "tag2"],
				aiTagsDetailed: [
					{ name: "tag1", confidence: 0.9 },
					{ name: "tag2", confidence: 0.8 },
				],
			});
		});

		it("should handle analyze errors gracefully", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			vi.mocked(visionModule.analyzeImage).mockRejectedValue(
				new Error("API Error")
			);

			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: new Set(),
					selectedItem: null,
					focusedId: null,
					selectionMode: false,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			await result.current.analyzeItem(mockItems[0]!);

			expect(consoleErrorSpy).toHaveBeenCalled();
			expect(mockUpdateItem).not.toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});
	});

	describe("moveItemToFolder", () => {
		it("should move items to target folder and cleanup", () => {
			mockSelectedIds.add("1");
			mockSelectedIds.add("2");

			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: mockSelectedIds,
					selectedItem: null,
					focusedId: null,
					selectionMode: true,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			result.current.moveItemToFolder("target-folder-id");

			expect(mockMoveItemsToFolder).toHaveBeenCalledWith(
				mockSelectedIds,
				"target-folder-id",
				mockItems
			);
			expect(mockClearSelection).toHaveBeenCalled();
			expect(mockSetIsMoveModalOpen).toHaveBeenCalledWith(false);
		});
	});

	describe("createFolderAndMove", () => {
		it("should create virtual folder and move items", () => {
			mockSelectedIds.add("1");

			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: mockSelectedIds,
					selectedItem: null,
					focusedId: null,
					selectionMode: true,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			result.current.createFolderAndMove("New Folder");

			expect(mockCreateVirtualFolder).toHaveBeenCalledWith("New Folder");
			expect(mockMoveItemsToFolder).toHaveBeenCalledWith(
				mockSelectedIds,
				"new-folder-id",
				mockItems
			);
			expect(mockClearSelection).toHaveBeenCalled();
			expect(mockSetIsMoveModalOpen).toHaveBeenCalledWith(false);
		});

		it("should not create folder when no active collection", () => {
			mockSelectedIds.add("1");

			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: mockSelectedIds,
					selectedItem: null,
					focusedId: null,
					selectionMode: true,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: null,
				})
			);

			result.current.createFolderAndMove("New Folder");

			expect(mockCreateVirtualFolder).not.toHaveBeenCalled();
			expect(mockMoveItemsToFolder).not.toHaveBeenCalled();
		});
	});

	describe("handleContextMove", () => {
		it("should select item and open move modal when item not selected", () => {
			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: new Set(),
					selectedItem: null,
					focusedId: null,
					selectionMode: false,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			result.current.handleContextMove(mockItems[0]!);

			expect(mockClearSelection).toHaveBeenCalled();
			expect(mockSetSelectedIds).toHaveBeenCalledWith(new Set(["1"]));
			expect(mockSetIsMoveModalOpen).toHaveBeenCalledWith(true);
		});

		it("should not clear selection when item already selected", () => {
			mockSelectedIds.add("1");
			mockSelectedIds.add("2");

			const { result } = renderHook(() =>
				useItemActions({
					currentItems: mockItems,
					selectedIds: mockSelectedIds,
					selectedItem: null,
					focusedId: null,
					selectionMode: true,
					contextMenuItem: null,
					updateItem: mockUpdateItem,
					updateItems: mockUpdateItems,
					clearSelection: mockClearSelection,
					setSelectedIds: mockSetSelectedIds,
					createVirtualFolder: mockCreateVirtualFolder,
					moveItemsToFolder: mockMoveItemsToFolder,
					setIsMoveModalOpen: mockSetIsMoveModalOpen,
					setIsAddTagModalOpen: vi.fn(),
					activeCollection: { id: "col1", name: "Collection 1" },
				})
			);

			result.current.handleContextMove(mockItems[0]!);

			expect(mockClearSelection).not.toHaveBeenCalled();
			expect(mockSetSelectedIds).not.toHaveBeenCalled();
			expect(mockSetIsMoveModalOpen).toHaveBeenCalledWith(true);
		});
	});
});
