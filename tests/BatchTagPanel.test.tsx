import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BatchTagPanel } from "../src/features/tags/components/BatchTagPanel";
import { PortfolioItem } from "../src/shared/types";
import { logger } from "./shared/utils/logger";

// Mock i18n
// Mock i18n
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: any) => {
			if (options && options.count !== undefined) {
				return `${key} (${options.count})`;
			}
			return key;
		},
	}),
}));

// Mock storage
vi.mock("../src/services/storage/tags", () => ({
	getMostUsedTags: vi.fn().mockResolvedValue(["quick1", "quick2"]),
}));

describe("BatchTagPanel", () => {
	const mockSelectedItems = [
		{
			id: "1",
			name: "Item 1",
			path: "/path/1",
			manualTags: ["tag1", "tag2"],
			aiTags: [],
			url: "",
			type: "image",
			size: 0,
			lastModified: 0,
		},
		{
			id: "2",
			name: "Item 2",
			path: "/path/2",
			manualTags: ["tag2", "tag3"],
			aiTags: [],
			url: "",
			type: "image",
			size: 0,
			lastModified: 0,
		},
	] as PortfolioItem[];

	const mockAvailableTags = ["tag1", "tag2", "tag3", "tag4"];
	const mockOnClose = vi.fn();
	const mockOnApplyChanges = vi.fn();

	it("should render when open", () => {
		render(
			<BatchTagPanel
				isOpen={true}
				onClose={mockOnClose}
				selectedItems={mockSelectedItems}
				availableTags={mockAvailableTags}
				onApplyChanges={mockOnApplyChanges}
			/>
		);
		expect(screen.getByText("tags:batchTagging")).toBeInTheDocument();
	});

	it("should not render when closed", () => {
		const { container } = render(
			<BatchTagPanel
				isOpen={false}
				onClose={mockOnClose}
				selectedItems={mockSelectedItems}
				availableTags={mockAvailableTags}
				onApplyChanges={mockOnApplyChanges}
			/>
		);
		expect(container.firstChild).toBeNull();
	});

	it("should display common tags", () => {
		render(
			<BatchTagPanel
				isOpen={true}
				onClose={mockOnClose}
				selectedItems={mockSelectedItems}
				availableTags={mockAvailableTags}
				onApplyChanges={mockOnApplyChanges}
			/>
		);
		// 'tag2' is in both items, so it's a common tag
		expect(screen.getByText("tag2")).toBeInTheDocument();
	});

	it("should call onClose when close button clicked", () => {
		render(
			<BatchTagPanel
				isOpen={true}
				onClose={mockOnClose}
				selectedItems={mockSelectedItems}
				availableTags={mockAvailableTags}
				onApplyChanges={mockOnApplyChanges}
			/>
		);
		const closeButton = screen.getByRole("button", { name: /close/i });
		act(() => {
			closeButton.click();
		});
		expect(mockOnClose).toHaveBeenCalled();
	});

	// More specific tests would depend on the exact UI implementation of BatchTagPanel
	// e.g. input field, add button, remove button.
});
