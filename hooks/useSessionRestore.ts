import { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { verifyPermission } from "../utils/fileHelpers";
import { useProgress } from "../contexts/ProgressContext";

export const useSessionRestore = (
  loadHandle: (handle: FileSystemDirectoryHandle) => Promise<void>,
  setFoldersRaw: (folders: any[]) => void // Optional callback for optimistic updates
) => {
  const [hasStoredSession, setHasStoredSession] = useState(false);
  const { addTask, updateTask, removeTask } = useProgress();

  useEffect(() => {
    const checkStorage = async () => {
      try {
        const storedItems = await storageService.getDirectoryHandles();
        if (storedItems.length > 0) setHasStoredSession(true);
      } catch (e) {
        console.error("Storage check failed", e);
      }
    };
    checkStorage();
  }, []);

  const restoreSession = async () => {
    const taskId = "restore-library";
    try {
      addTask({ id: taskId, label: "Restoring Library" });

      const storedItems = await storageService.getDirectoryHandles();
      if (storedItems.length === 0) {
        setHasStoredSession(false);
        return;
      }

      const authorizedHandles: FileSystemDirectoryHandle[] = [];
      let loadedCount = 0;

      // Sort: Roots first
      storedItems.sort((a, b) =>
        a.isRoot === b.isRoot ? 0 : a.isRoot ? -1 : 1
      );

      // Pre-load virtual folders structure
      const vFolders = await storageService.getVirtualFolders();
      // We could set this immediately to show empty folders, but we'll let loadHandle do the heavy lifting
      setFoldersRaw(vFolders);

      for (let i = 0; i < storedItems.length; i++) {
        const item = storedItems[i];
        let handleToUse = item.handle;
        let isAuthorized = false;

        // 1. Try to resolve via already authorized parents
        for (const parentHandle of authorizedHandles) {
          try {
            const path = await parentHandle.resolve(handleToUse);
            if (path) {
              let freshHandle = parentHandle;
              for (const name of path) {
                freshHandle = await freshHandle.getDirectoryHandle(name);
              }
              handleToUse = freshHandle;
              isAuthorized = true;
              break;
            }
          } catch (e) {
            /* ignore */
          }
        }

        // 2. Permission
        if (!isAuthorized) {
          const permitted = await verifyPermission(handleToUse, true);
          if (permitted) {
            authorizedHandles.push(handleToUse);
            isAuthorized = true;
          }
        }

        // 3. Load
        if (isAuthorized) {
          if (item.isRoot) {
            // Permission root only
          } else {
            await loadHandle(handleToUse);
            loadedCount++;
          }
        }
        updateTask(taskId, {
          progress: Math.round(((i + 1) / storedItems.length) * 100),
        });
      }

      if (loadedCount === 0 && storedItems.some((i) => !i.isRoot)) {
        alert(
          "Could not restore folders. Please try linking the Root folder first."
        );
      }
    } catch (e) {
      console.error("Restore failed", e);
    } finally {
      updateTask(taskId, { status: "completed", progress: 100 });
      setTimeout(() => removeTask(taskId), 3000);
    }
  };

  return { hasStoredSession, setHasStoredSession, restoreSession };
};
