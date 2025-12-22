import { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { verifyPermission } from "../utils/fileHelpers";
import { useProgress } from "../contexts/ProgressContext";

export const useSessionRestore = (
  loadPath: (path: string) => Promise<void>,
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

      let loadedCount = 0;

      // Sort: Roots first
      storedItems.sort((a, b) =>
        a.isRoot === b.isRoot ? 0 : a.isRoot ? -1 : 1
      );

      const vFolders = await storageService.getVirtualFolders();
      setFoldersRaw(vFolders);

      for (let i = 0; i < storedItems.length; i++) {
        const item = storedItems[i];

        if (!item.isRoot) {
          await loadPath(item.id); // item.id is the path in our SQLite implementation
          loadedCount++;
        }

        updateTask(taskId, {
          progress: Math.round(((i + 1) / storedItems.length) * 100),
        });
      }

      if (loadedCount === 0 && storedItems.some((i) => !i.isRoot)) {
        console.warn("No folders loaded during session restore");
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
