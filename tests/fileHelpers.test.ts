import { describe, it, expect, vi, beforeEach } from "vitest";
import { scanDirectory } from "../src/shared/utils/fileHelpers";

// Mock Tauri APIs
vi.mock("@tauri-apps/plugin-fs", () => ({
	readDir: vi.fn(),
	stat: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
	convertFileSrc: vi.fn((path) => `asset://${path}`),
	invoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/path", () => ({
	join: vi.fn((...args) => Promise.resolve(args.join("/"))),
}));

import { readDir, stat } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";

describe("fileHelpers", () => {
	beforeEach(() => {
		vi.resetAllMocks();

		// Default mocks
		(stat as any).mockResolvedValue({
			size: 1024,
			mtime: new Date(),
		});

		// Mock invoke for get_image_dimensions
		(invoke as any).mockResolvedValue({
			width: 1920,
			height: 1080,
			size: 1024,
		});
	});

	describe("scanDirectory", () => {
		it("should load images from a flat directory", async () => {
			// Setup mock file system structure
			// scanDirectory calls readDir(basePath)
			(readDir as any).mockImplementation(async (path: string) => {
				if (path === "root") {
					return [
						{ name: "image1.jpg", isFile: true, isDirectory: false },
						{ name: "image2.png", isFile: true, isDirectory: false },
						{ name: "document.txt", isFile: true, isDirectory: false }, // Should be ignored
					];
				}
				return [];
			});

			const result = await scanDirectory("root");

			expect(result.looseFiles).toHaveLength(2);
			// Note: scanDirectory logic pushes items, order depends on readDir order
			const names = result.looseFiles.map((f) => f.name);
			expect(names).toContain("image1.jpg");
			expect(names).toContain("image2.png");
			expect(names).not.toContain("document.txt");
		});

		it("should load images from nested directories", async () => {
			// Setup nested structure
			// root -> root.jpg, subfolder/
			// subfolder -> nested.jpg
			(readDir as any).mockImplementation(async (path: string) => {
				console.log("Mock readDir called for:", path);
				if (path === "root") {
					return [
						{ name: "root.jpg", isFile: true, isDirectory: false },
						{ name: "subfolder", isFile: false, isDirectory: true },
					];
				}
				if (path === "root/subfolder" || path === "subfolder") {
					// The join mock joins simply with '/', so "root" + "subfolder" -> "root/subfolder"
					return [{ name: "nested.jpg", isFile: true, isDirectory: false }];
				}
				return [];
			});

			const result = await scanDirectory("root");

			// Check loose files (root level)
			expect(result.looseFiles).toHaveLength(1);
			expect(result.looseFiles[0]?.name).toBe("root.jpg");

			// Check folders
			expect(result.folders.size).toBe(1);
			expect(result.folders.has("subfolder")).toBe(true);
			const subfolderItems = result.folders.get("subfolder");
			expect(subfolderItems).toHaveLength(1);
			expect(subfolderItems?.[0]?.name).toBe("nested.jpg");
		});
	});
});
