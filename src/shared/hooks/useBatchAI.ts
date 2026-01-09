import { useState, useEffect } from "react";
import { PortfolioItem } from "../types";

import { analyzeImage } from "../../features/vision";
import { useProgress } from "../contexts/ProgressContext";

import { logger } from '../utils/logger';
export const useBatchAI = (updateItem: (item: PortfolioItem) => void) => {
  const [aiQueue, setAiQueue] = useState<PortfolioItem[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [totalBatchCount, setTotalBatchCount] = useState(0);
  const { addTask, updateTask, removeTask } = useProgress();
  const taskId = "batch-ai";

  const addToQueue = (items: PortfolioItem[]) => {
    setTotalBatchCount(items.length);
    setAiQueue(items);
    setIsBatchProcessing(true);
    addTask({ id: taskId, label: "AI Image Analysis" });
  };

  useEffect(() => {
    const processNext = async () => {
      if (aiQueue.length === 0) {
        setIsBatchProcessing(false);
        updateTask(taskId, { status: "completed", progress: 100 });
        setTimeout(() => removeTask(taskId), 3000);
        return;
      }

      const item = aiQueue[0];
      if (!item) return;

      try {
        const result = await analyzeImage(item);
        updateItem({
          ...item,
          aiDescription: result.description,
          aiTags: result.tags,
          aiTagsDetailed: result.tagsDetailed,
        });
      } catch (e) {
        logger.error('app', 'Failed to analyze ${item.name}', e);
      } finally {
        // Remove processed item from queue
        setAiQueue((prev) => {
          const newQueue = prev.slice(1);
          const progress =
            totalBatchCount > 0
              ? ((totalBatchCount - newQueue.length) / totalBatchCount) * 100
              : 100;
          updateTask(taskId, {
            progress,
            message: `Processing ${
              totalBatchCount - newQueue.length
            } of ${totalBatchCount}`,
          });
          return newQueue;
        });
      }
    };

    if (isBatchProcessing && aiQueue.length > 0) {
      processNext();
    }
  }, [aiQueue, isBatchProcessing, updateItem]);

  return {
    isBatchProcessing,
    batchProgress:
      totalBatchCount > 0 ? 1 - aiQueue.length / totalBatchCount : 0,
    addToQueue,
  };
};
