import { PortfolioItem } from "../types";
import { readDir, stat } from "@tauri-apps/plugin-fs";
import { convertFileSrc } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";

// Recursive function to walk directory path using Tauri FS
export async function scanDirectory(
  basePath: string,
  currentPath: string = ""
): Promise<{
  folders: Map<string, PortfolioItem[]>;
  looseFiles: PortfolioItem[];
}> {
  const folderMap = new Map<string, PortfolioItem[]>();
  const looseFiles: PortfolioItem[] = [];

  const fullPath = currentPath ? await join(basePath, currentPath) : basePath;
  const entries = await readDir(fullPath);

  for (const entry of entries) {
    const relativePath = currentPath
      ? await join(currentPath, entry.name)
      : entry.name;
    const entryFullPath = await join(basePath, relativePath);

    if (entry.isFile) {
      if (entry.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        const fileStat = await stat(entryFullPath);

        const assetUrl = convertFileSrc(entryFullPath);
        console.log(
          `[FileHelpers] Generated URL for ${entry.name}: ${assetUrl}`
        );

        const item: PortfolioItem = {
          id: Math.random().toString(36).substring(2, 9),
          path: entryFullPath,
          url: assetUrl,
          name: entry.name,
          type: `image/${entry.name.split(".").pop()}`,
          size: fileStat.size,
          lastModified: fileStat.mtime
            ? new Date(fileStat.mtime).getTime()
            : Date.now(),
          aiTags: currentPath ? [currentPath.split("/").pop() || ""] : [],
        };

        if (currentPath) {
          const parentFolder = currentPath.split("/").pop() || "Unknown";
          if (!folderMap.has(parentFolder)) {
            folderMap.set(parentFolder, []);
          }
          folderMap.get(parentFolder)?.push(item);
        } else {
          looseFiles.push(item);
        }
      }
    } else if (entry.isDirectory) {
      const result = await scanDirectory(basePath, relativePath);

      // Merge results
      result.folders.forEach((items, name) => {
        if (folderMap.has(name)) {
          folderMap.get(name)?.push(...items);
        } else {
          folderMap.set(name, items);
        }
      });
      looseFiles.push(...result.looseFiles);
    }
  }

  return { folders: folderMap, looseFiles };
}

// In Tauri, permission is handled via capabilities and dialogs.
// We assume that if we have the path from a dialog, we have permission.
export async function verifyPermission(
  _path: string,
  _readWrite: boolean = false
) {
  return true;
}
