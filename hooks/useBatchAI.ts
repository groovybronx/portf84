import { useState, useEffect } from 'react';
import { PortfolioItem } from '../types';
import { analyzeImage } from '../services/geminiService';

export const useBatchAI = (updateItem: (item: PortfolioItem) => void) => {
  const [aiQueue, setAiQueue] = useState<PortfolioItem[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [totalBatchCount, setTotalBatchCount] = useState(0);

  const addToQueue = (items: PortfolioItem[]) => {
      setTotalBatchCount(items.length);
      setAiQueue(items);
      setIsBatchProcessing(true);
  };

  useEffect(() => {
      const processNext = async () => {
          if (aiQueue.length === 0) {
              setIsBatchProcessing(false);
              return;
          }

          const item = aiQueue[0];
          try {
              const result = await analyzeImage(item);
              updateItem({
                  ...item,
                  aiDescription: result.description,
                  aiTags: result.tags,
                  aiTagsDetailed: result.tagsDetailed
              });
          } catch (e) {
              console.error(`Failed to analyze ${item.name}`, e);
          } finally {
              // Remove processed item from queue
              setAiQueue(prev => prev.slice(1));
          }
      };

      if (isBatchProcessing && aiQueue.length > 0) {
          processNext();
      }
  }, [aiQueue, isBatchProcessing, updateItem]);

  return {
    isBatchProcessing,
    batchProgress: totalBatchCount > 0 ? 1 - (aiQueue.length / totalBatchCount) : 0,
    addToQueue
  };
};
