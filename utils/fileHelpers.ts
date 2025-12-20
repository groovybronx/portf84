import { PortfolioItem, Folder } from "../types";

// Recursive function to walk directory handle
export async function scanDirectory(
  dirHandle: FileSystemDirectoryHandle, 
  path: string = ''
): Promise<{ folders: Map<string, PortfolioItem[]>, looseFiles: PortfolioItem[] }> {
  
  const folderMap = new Map<string, PortfolioItem[]>();
  const looseFiles: PortfolioItem[] = [];

  for await (const entry of dirHandle.values()) {
    const relativePath = path ? `${path}/${entry.name}` : entry.name;

    if (entry.kind === 'file') {
      const fileHandle = entry as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      
      if (file.type.startsWith('image/')) {
        // Auto-tag based on folder structure
        const folderTag = path.split('/').pop();
        
        const item: PortfolioItem = {
          id: Math.random().toString(36).substring(2, 9),
          file: file, // Keep file reference for upload/analysis
          url: URL.createObjectURL(file),
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          aiTags: folderTag ? [folderTag] : []
          // Metadata will be merged later from IndexedDB
        };

        // Determine "Folder Name" for grouping
        // If it's in root (path is empty), it goes to looseFiles
        // If it's in a subfolder, we use the direct parent name
        if (path) {
            const parentFolder = path.split('/').pop() || 'Unknown';
            // We use the full path as key to ensure uniqueness of folders with same name in different subtrees
            // But for display we might want just name. For now let's group by immediate parent name.
            if (!folderMap.has(parentFolder)) {
                folderMap.set(parentFolder, []);
            }
            folderMap.get(parentFolder)?.push(item);
        } else {
            looseFiles.push(item);
        }
      }

    } else if (entry.kind === 'directory') {
      const subDirHandle = entry as FileSystemDirectoryHandle;
      const result = await scanDirectory(subDirHandle, relativePath);
      
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

// Using any for FileSystemDirectoryHandle here to avoid experimental type issues in environment
export async function verifyPermission(fileHandle: any, readWrite: boolean = false) {
  const options = {
    mode: readWrite ? 'readwrite' : 'read',
  };
  
  // Check if permission was already granted.
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  // Request permission.
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  return false;
}