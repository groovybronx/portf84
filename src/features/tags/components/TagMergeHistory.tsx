import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, ChevronLeft, ChevronRight, RefreshCw, RotateCcw } from 'lucide-react';
import { getAllTags, undoMerge, getUndoableMerges } from '../../../services/storage/tags';
import { useTranslation } from 'react-i18next';
import { DBTagMerge, ParsedTag } from '../../../shared/types/database';
import { Button, GlassCard, Flex, Stack, Grid } from '../../../shared/components/ui';

import { logger } from '../../../shared/utils/logger';
interface TagMergeHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MergeHistoryEntry extends DBTagMerge {
  targetTagName: string;
  sourceTagName: string;
}

const ITEMS_PER_PAGE = 20;

export const TagMergeHistory: React.FC<TagMergeHistoryProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation(['tags', 'errors']);
  const [history, setHistory] = useState<MergeHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get undoable/recent merges
      const merges = await getUndoableMerges();

      // Get all tags to map IDs to names
      const tags = await getAllTags();
      const tagMap = new Map<string, string>();
      tags.forEach((tag: ParsedTag) => {
        tagMap.set(tag.id, tag.name);
      });

      // Enrich merge records with tag names
      const enrichedHistory: MergeHistoryEntry[] = merges.map((merge) => ({
        ...merge,
        targetTagName: tagMap.get(merge.targetTagId) || t('tags:unknown'),
        // Use stored sourceTagName if available, otherwise fallback (legacy)
        sourceTagName: merge.sourceTagName || t('tags:deleted'),
      }));

      setHistory(enrichedHistory);
    } catch (e) {
      logger.error('app', 'Failed to load merge history', e);
      setError(t('tags:errorLoadingHistory'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      setCurrentPage(1);
    }
  }, [isOpen]);

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = history.slice(startIndex, endIndex);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMergeType = (mergedBy: string | null) => {
    if (!mergedBy || mergedBy === 'auto') return t('tags:auto');
    return mergedBy;
  };

  const handleUndoClick = async (entry: MergeHistoryEntry) => {
    if (confirm(t('tags:undoConfirm', { tagName: entry.sourceTagName }))) {
      try {
        await undoMerge(entry.id);
        await loadHistory();
      } catch (e) {
        logger.error('app', 'Undo failed', e);
        alert(t('tags:undoFailed'));
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-(--z-modal-overlay)"
          />
          <GlassCard
            variant="base"
            padding="none"
            border
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl rounded-xl! shadow-2xl z-(--z-modal) flex flex-col max-h-[80vh] overflow-hidden"
          >
            {' '}
            {/* Header */}
            {/* Header */}
            <Flex justify="between" align="center" className="p-6 border-b border-white/10">
              <Flex align="center" gap="md">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <History className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{t('tags:mergeHistory')}</h2>
                  <p className="text-xs text-white/50">{t('tags:historyDesc')}</p>
                </div>
              </Flex>
              <Flex align="center" gap="sm">
                <Button
                  onClick={loadHistory}
                  variant="glass-icon"
                  size="icon"
                  aria-label={t('tags:refresh')}
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </Button>
                <Button onClick={onClose} variant="close" size="icon" aria-label="Close">
                  <X size={20} />
                </Button>
              </Flex>
            </Flex>
            {/* Content */}
            <Stack spacing="none" className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <Flex direction="col" align="center" justify="center" className="py-12 space-y-4">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-sm text-white/50">{t('tags:loadingHistory')}</p>
                </Flex>
              ) : error ? (
                <Flex direction="col" align="center" justify="center" className="py-12 space-y-4">
                  <Flex
                    align="center"
                    justify="center"
                    className="w-16 h-16 bg-red-500/10 rounded-full mx-auto"
                  >
                    <X className="w-8 h-8 text-red-400" />
                  </Flex>
                  <h3 className="text-lg font-medium text-white">
                    {t('tags:errorLoadingHistory')}
                  </h3>
                  <p className="text-sm text-white/40 max-w-xs mx-auto text-center">{error}</p>
                  <Button onClick={loadHistory} variant="glass" size="md">
                    {t('tags:tryAgain')}
                  </Button>
                </Flex>
              ) : history.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                    <History className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">{t('tags:noHistory')}</h3>
                  <p className="text-sm text-white/40 max-w-xs mx-auto">
                    {t('tags:noHistoryDesc')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3" role="table" aria-label="Tag merge history">
                  {/* Table Header */}
                  <Grid
                    cols={12}
                    gap="md"
                    className="px-4 py-2 text-xs font-semibold text-white/50 uppercase tracking-wider border-b border-white/10"
                    role="row"
                  >
                    <div className="col-span-2" role="columnheader">
                      {t('tags:date')}
                    </div>
                    <div className="col-span-3" role="columnheader">
                      {t('tags:targetTag')}
                    </div>
                    <div className="col-span-3" role="columnheader">
                      {t('tags:sourceTag')}
                    </div>
                    <div className="col-span-2" role="columnheader">
                      {t('tags:type')}
                    </div>
                    <div className="col-span-2 text-right" role="columnheader">
                      {t('tags:actions')}
                    </div>
                  </Grid>

                  {/* Table Rows */}
                  {currentItems.map((entry) => (
                    <GlassCard
                      variant="accent"
                      padding="none"
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="row"
                    >
                      <Grid
                        cols={12}
                        gap="md"
                        className="p-3 items-center hover:bg-white/5 transition-colors"
                      >
                        <div className="col-span-2 text-xs text-white/50" role="cell">
                          {formatDate(entry.mergedAt)}
                        </div>
                        <div className="col-span-3" role="cell">
                          <span className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-200 text-sm font-medium border border-blue-500/30 inline-block overflow-hidden text-ellipsis max-w-full">
                            {entry.targetTagName}
                          </span>
                        </div>
                        <div className="col-span-3" role="cell">
                          <span className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-300/70 text-sm border border-red-500/20 inline-block line-through decoration-red-400/50 overflow-hidden text-ellipsis max-w-full">
                            {entry.sourceTagName}
                          </span>
                        </div>
                        <div className="col-span-2" role="cell">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-medium ${
                              entry.mergedBy === 'auto'
                                ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                                : 'bg-green-500/20 text-green-200 border border-green-500/30'
                            }`}
                          >
                            {formatMergeType(entry.mergedBy)}
                          </span>
                        </div>
                        <Flex className="col-span-2 text-right" justify="end" role="cell">
                          {entry.itemIdsJson && (
                            <Button
                              onClick={() => handleUndoClick(entry)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title={t('tags:undo')}
                            >
                              <RotateCcw className="w-4 h-4 text-white/70 hover:text-white" />
                            </Button>
                          )}
                        </Flex>
                      </Grid>
                    </GlassCard>
                  ))}
                </div>
              )}
            </Stack>
            {history.length > ITEMS_PER_PAGE && (
              <Flex align="center" justify="between" className="p-4 border-t border-white/10">
                <div className="text-sm text-white/50">
                  {t('tags:showingEntries', {
                    start: startIndex + 1,
                    end: Math.min(endIndex, history.length),
                    total: history.length,
                  })}
                </div>
                <Flex align="center" gap="sm">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="glass"
                    size="icon"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-sm text-white/70 min-w-[80px] text-center">
                    {t('tags:pageCount', { current: currentPage, total: totalPages })}
                  </span>
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    variant="glass"
                    size="icon"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </Flex>
              </Flex>
            )}
          </GlassCard>
        </>
      )}
    </AnimatePresence>
  );
};
