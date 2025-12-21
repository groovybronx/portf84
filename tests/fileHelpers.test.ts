import { describe, it, expect, vi } from "vitest";
import { scanDirectory } from "../utils/fileHelpers";

// Mock FileSystemDirectoryHandle and FileSystemFileHandle
const createMockFileHandle = (name: string, type = "image/jpeg") => ({
  kind: "file" as const,
  name,
  getFile: vi.fn().mockResolvedValue(new File([""], name, { type })),
});

const createMockDirectoryHandle = (name: string, entries: any[] = []) => ({
  kind: "directory" as const,
  name,
  values: vi.fn().mockReturnValue({
    [Symbol.asyncIterator]: async function* () {
      for (const entry of entries) {
        yield entry;
      }
    },
  }),
});

describe("fileHelpers", () => {
  describe("scanDirectory", () => {
    it("should load images from a flat directory", async () => {
      const mockFiles = [
        createMockFileHandle("image1.jpg"),
        createMockFileHandle("image2.png"),
        createMockFileHandle("document.txt", "text/plain"), // Should be ignored
      ];
      const rootHandle = createMockDirectoryHandle("root", mockFiles);

      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn(() => "blob:mock-url");

      const result = await scanDirectory(rootHandle as any);

      // Access main map or loose files
      // scanDirectory returns { folders: Map<string, Array>, looseFiles: Array }
      expect(result.looseFiles).toHaveLength(2);
      expect(result.looseFiles[0].name).toBe("image1.jpg");
      expect(result.looseFiles[1].name).toBe("image2.png");
    });

    it("should load images from nested directories", async () => {
      const nestedFiles = [createMockFileHandle("nested.jpg")];
      const nestedDir = createMockDirectoryHandle("subfolder", nestedFiles);
      const rootFiles = [createMockFileHandle("root.jpg")];

      const rootHandle = createMockDirectoryHandle("root", [
        ...rootFiles,
        nestedDir,
      ]);
      global.URL.createObjectURL = vi.fn(() => "blob:mock-url");

      const result = await scanDirectory(rootHandle as any);

      // Check loose files
      expect(result.looseFiles).toHaveLength(1);
      expect(result.looseFiles[0].name).toBe("root.jpg");

      // Check folders
      expect(result.folders.size).toBe(1);
      expect(result.folders.has("subfolder")).toBe(true);
      expect(result.folders.get("subfolder")).toHaveLength(1);
      expect(result.folders.get("subfolder")![0].name).toBe("nested.jpg");
    });
  });
});
