import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Merge, RefreshCw, Tag as TagIcon, ArrowLeftRight, History } from 'lucide-react';
import { Button, ConfirmDialog, Flex, Stack } from '@/shared/components/ui';
import { analyzeTagRedundancy, TagGroup } from '@/services/tagAnalysisService';
import { mergeTags, ignoreTagMatch } from '@/services/storage/tags';
import { TagMergeHistory } from '../TagMergeHistory';

interface FusionTabProps {
  onTagsUpdated?: () => void;
}

export const FusionTab: React.FC<FusionTabProps> = ({ onTagsUpdated }) => {
  const { t } = useTranslation(['tags', 'common']);
  const [groups, setGroups] = useState<TagGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [mergingId, setMergingId] = useState<string | null>(null);
  const [mergingAll, setMergingAll] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [customTargets, setCustomTargets] = useState<Map<string, string>>(new Map());
  const [showMergeAllConfirm, setShowMergeAllConfirm] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const redundant = await analyzeTagRedundancy();
      setGroups(redundant);
    } catch (e) {
      console.error('Failed to analyze tags', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleMergeDirection = (group: TagGroup) => {
    setCustomTargets((prev) => {
      const newMap = new Map(prev);
      const currentTargetId = prev.get(group.target.id) || group.target.id;

      // Find all tags in this group
      const allTags = [group.target, ...group.candidates];
      const currentTargetIndex = allTags.findIndex((t) => t.id === currentTargetId);

      // Cycle to next tag
      const newTargetIndex = (currentTargetIndex + 1) % allTags.length;
      const nextTag = allTags[newTargetIndex];
      if (!nextTag) return prev;
      const newTargetId = nextTag.id;

      newMap.set(group.target.id, newTargetId);
      return newMap;
    });
  };

  const handleMerge = async (group: TagGroup) => {
    // Determine effective target (custom or default)
    const effectiveTargetId = customTargets.get(group.target.id) || group.target.id;
    const allTags = [group.target, ...group.candidates];
    const sourceIds = allTags.filter((t) => t.id !== effectiveTargetId).map((t) => t.id);

    setMergingId(effectiveTargetId);
    try {
      await mergeTags(effectiveTargetId, sourceIds);

      // Clean up custom target for this group
      setCustomTargets((prev) => {
        const newMap = new Map(prev);
        newMap.delete(group.target.id);
        return newMap;
      });

      // Refresh list locally
      setGroups((prev) => prev.filter((g) => g.target.id !== group.target.id));

      if (onTagsUpdated) onTagsUpdated();
    } catch (e) {
      console.error('Merge failed', e);
    } finally {
      setMergingId(null);
    }
  };

  const handleIgnore = async (group: TagGroup) => {
    try {
      for (const cand of group.candidates) {
        await ignoreTagMatch(group.target.id, cand.id);
      }
      setGroups((prev) => prev.filter((g) => g.target.id !== group.target.id));
    } catch (e) {
      console.error('Ignore failed', e);
    }
  };

  const handleMergeAll = () => {
    setShowMergeAllConfirm(true);
  };

  const executeMergeAll = async () => {
    setMergingAll(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Process merges with individual error handling
      for (const group of groups) {
        try {
          const sourceIds = group.candidates.map((c) => c.id);
          await mergeTags(group.target.id, sourceIds, 'auto');
          successCount++;
        } catch (e) {
          console.error(`Failed to merge group for ${group.target.name}:`, e);
          failCount++;
        }
      }

      console.log(
        `[FusionTab] Batch merge complete: ${successCount} succeeded, ${failCount} failed`
      );

      // Refresh to show remaining groups
      await loadAnalysis();

      if (onTagsUpdated) onTagsUpdated();
    } catch (e) {
      console.error('Batch merge failed', e);
      // Refresh to show remaining groups
      await loadAnalysis();
    } finally {
      setMergingAll(false);
    }
  };

  return (
    <>
      <Stack spacing="md" className="p-6">
        {/* Header Actions */}
        <Flex align="center" justify="between">
          <Button
            onClick={() => setShowHistory(true)}
            className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-medium transition-colors flex items-center gap-2"
            title="View merge history"
          >
            <History size={16} />
            {t('tags:history')}
          </Button>
          <Button
            onClick={loadAnalysis}
            className="px-3 py-2 bg-glass-bg-accent hover:bg-glass-bg-accent-hover border border-glass-border rounded-lg text-gray-300 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            {t('tags:refresh')}
          </Button>
        </Flex>

        {/* Content */}
        {loading ? (
          <Flex direction="col" align="center" justify="center" gap="md" className="py-12">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-white/50">{t('tags:analyzing')}</p>
          </Flex>
        ) : groups.length === 0 ? (
          <Flex direction="col" align="center" justify="center" gap="md" className="py-12">
            <Flex
              className="w-16 h-16 bg-green-500/10 rounded-full"
              align="center"
              justify="center"
            >
              <TagIcon className="w-8 h-8 text-green-400" />
            </Flex>
            <h3 className="text-lg font-medium text-white">{t('tags:tagsClean')}</h3>
            <p className="text-sm text-white/40 max-w-xs mx-auto text-center">
              {t('tags:noSimilarTags')}
            </p>
          </Flex>
        ) : (
          <Stack spacing="md">
            {/* Summary & Merge All */}
            <Flex align="center" justify="between" className="pb-3 border-b border-white/10">
              <div className="text-sm text-white/60">
                <Trans
                  ns="tags"
                  i18nKey="foundGroups"
                  count={groups.length}
                  components={[<span className="font-bold text-white" />]}
                />
              </div>
              <Button
                onClick={handleMergeAll}
                disabled={mergingAll || mergingId !== null}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                {mergingAll ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    {t('tags:merging')}
                  </>
                ) : (
                  <>
                    <Merge className="w-3 h-3" />
                    {t('tags:mergeAll')}
                  </>
                )}
              </Button>
            </Flex>

            {/* Groups */}
            {groups.map((group) => {
              const allTags = [group.target, ...group.candidates];
              const customTargetId = customTargets.get(group.target.id);
              const effectiveTarget = customTargetId
                ? allTags.find((t) => t.id === customTargetId) || group.target
                : group.target;
              const effectiveCandidates = allTags.filter((t) => t.id !== effectiveTarget.id);

              return (
                <Flex
                  key={group.target.id}
                  align="center"
                  justify="between"
                  gap="md"
                  className="bg-glass-bg-accent border border-glass-border rounded-lg p-4 group-hover:border-glass-border transition-colors"
                >
                  <Flex align="center" gap="lg" className="flex-1">
                    <Stack spacing="xs" className="w-fit">
                      <Button
                        onClick={() => toggleMergeDirection(group)}
                        className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-100 text-sm font-semibold border-2 border-green-500/50 hover:border-green-500/70 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
                        title={t('tags:tagToKeep', { tagName: effectiveTarget.name })}
                      >
                        <Flex align="center" gap="sm">
                          <span className="text-green-400 text-lg">✓</span>
                          <span>{effectiveTarget.name}</span>
                        </Flex>
                      </Button>
                      <span className="text-[10px] text-green-400/80 font-bold uppercase tracking-wider text-center">
                        {t('tags:kept')}
                      </span>
                    </Stack>

                    <Button
                      onClick={() => toggleMergeDirection(group)}
                      className="text-white/30 hover:text-white/70 transition-all cursor-pointer hover:scale-110 active:scale-90"
                      title={t('tags:clickToInvert')}
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </Button>

                    <Stack spacing="xs" className="flex-1">
                      <Flex wrap="wrap" gap="sm">
                        {effectiveCandidates.map((cand) => (
                          <span
                            key={cand.id}
                            className="px-2 py-1 rounded bg-red-500/10 text-red-300/80 text-xs border border-red-500/30 line-through decoration-red-400"
                          >
                            <Flex align="center" gap="xs">
                              <span className="text-red-400 font-bold">×</span>
                              <span>{cand.name}</span>
                            </Flex>
                          </span>
                        ))}
                      </Flex>
                      <span className="text-[10px] text-red-400/60 font-bold uppercase tracking-wider">
                        {t('tags:deleted', { count: effectiveCandidates.length })}
                      </span>
                    </Stack>
                  </Flex>

                  <Stack spacing="sm" className="shrink-0">
                    <Button
                      onClick={() => handleMerge(group)}
                      disabled={mergingId === effectiveTarget.id || mergingAll}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95"
                    >
                      {mergingId === effectiveTarget.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Merge className="w-3 h-3" />
                      )}
                      {t('tags:merge')}
                    </Button>
                    <Button
                      onClick={() => handleIgnore(group)}
                      className="px-4 py-1.5 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 border border-white/10 rounded-lg transition-all"
                    >
                      {t('tags:ignoreMatch')}
                    </Button>
                  </Stack>
                </Flex>
              );
            })}
          </Stack>
        )}
      </Stack>

      {/* Tag Merge History Modal */}
      <TagMergeHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />

      <ConfirmDialog
        isOpen={showMergeAllConfirm}
        onClose={() => setShowMergeAllConfirm(false)}
        onConfirm={executeMergeAll}
        title={t('tags:mergeAll')}
        message={t('tags:mergeConfirm', { count: groups.length })}
        variant="warning"
        confirmText={t('tags:mergeAll')}
      />
    </>
  );
};
