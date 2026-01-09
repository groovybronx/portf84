import { PortfolioItem } from '../types';
import { readDir, stat } from '@tauri-apps/plugin-fs';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { join } from '@tauri-apps/api/path';
import { isImageFile, IMAGE_MIME_TYPES } from '../constants';

import { logger } from './logger';
// Recursive function to walk directory path using Tauri FS
export async function scanDirectory(
  basePath: string,
  currentPath: string = ''
): Promise<{
  folders: Map<string, PortfolioItem[]>;
  looseFiles: PortfolioItem[];
}> {
  const folderMap = new Map<string, PortfolioItem[]>();
  const looseFiles: PortfolioItem[] = [];

  const fullPath = currentPath ? await join(basePath, currentPath) : basePath;
  const entries = await readDir(fullPath);

  for (const entry of entries) {
    const relativePath = currentPath ? await join(currentPath, entry.name) : entry.name;
    const entryFullPath = await join(basePath, relativePath);

    if (entry.isFile) {
      if (isImageFile(entry.name)) {
        const fileStat = await stat(entryFullPath);

        const assetUrl = convertFileSrc(entryFullPath);

        // Call backend to get dimensions efficiently
        let width, height;
        let fileSize = fileStat.size;

        try {
          const dims = await invoke<{
            width: number;
            height: number;
            size: number;
          }>('get_image_dimensions', { path: entryFullPath });
          width = dims.width;
          height = dims.height;
          fileSize = dims.size || fileSize;
        } catch (e) {
          logger.warn('app', 'Failed to get dimensions for ${entry.name}', e);
        }

        const ext = entry.name.split('.').pop()?.toLowerCase() as keyof typeof IMAGE_MIME_TYPES;
        const mimeType = IMAGE_MIME_TYPES[ext] || `image/${ext}`;

        const item: PortfolioItem = {
          id: entryFullPath, // Using full path as ID
          path: entryFullPath,
          url: assetUrl,
          name: entry.name,
          type: mimeType,
          size: fileSize,
          lastModified: fileStat.mtime?.getTime() || Date.now(),
          aiTags: currentPath ? [currentPath.split('/').pop() || ''] : [],
        };

        // Add dimensions only if they exist
        if (width !== undefined && height !== undefined) {
          item.width = width;
          item.height = height;
        }

        if (currentPath) {
          const parentFolder = currentPath.split('/').pop() || 'Unknown';
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
export async function verifyPermission(_path: string, _readWrite: boolean = false) {
  return true;
}
