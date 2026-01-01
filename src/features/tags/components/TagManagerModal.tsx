import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Merge, RefreshCw, Tag as TagIcon, ArrowRight, ArrowLeftRight, History } from 'lucide-react';
import { Button } from "../../../shared/components/ui";
import { useTranslation, Trans } from 'react-i18next';
import { analyzeTagRedundancy, TagGroup } from '../../../services/tagAnalysisService';
import { mergeTags, ignoreTagMatch, getTagTree, setTagParent } from '../../../services/storage/tags';
import { ParsedTag, TagNode } from '../../../shared/types/database';
import { TagMergeHistory } from './TagMergeHistory';
import { TagTreeItem } from './TagTreeItem';

interface TagManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTagsUpdated?: () => void;
}

export const TagManagerModal: React.FC<TagManagerModalProps> = ({ isOpen, onClose, onTagsUpdated }) => {
    const { t } = useTranslation(['tags', 'common']);
    const [groups, setGroups] = useState<TagGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [mergingId, setMergingId] = useState<string | null>(null);
    const [mergingAll, setMergingAll] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [customTargets, setCustomTargets] = useState<Map<string, string>>(new Map());
    const [activeTab, setActiveTab] = useState<'fusion' | 'hierarchy'>('fusion');
    const [tagTree, setTagTree] = useState<TagNode[]>([]);

    const loadAnalysis = async () => {
        setLoading(true);
        try {
            const [redundant, tree] = await Promise.all([
                analyzeTagRedundancy(),
                getTagTree()
            ]);
            setGroups(redundant);
            setTagTree(tree);
        } catch (e) {
            console.error("Failed to analyze tags", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleMergeDirection = (group: TagGroup) => {
        setCustomTargets(prev => {
            const newMap = new Map(prev);
            const currentTargetId = prev.get(group.target.id) || group.target.id;
            
            // Find all tags in this group
            const allTags = [group.target, ...group.candidates];
            const currentTargetIndex = allTags.findIndex(t => t.id === currentTargetId);
            
            // Cycle to next tag
            const newTargetIndex = (currentTargetIndex + 1) % allTags.length;
            const nextTag = allTags[newTargetIndex];
            if (!nextTag) return prev;
            const newTargetId = nextTag.id;
            
            newMap.set(group.target.id, newTargetId);
            return newMap;
        });
    };

    const setCustomTarget = (originalTargetId: string, newTargetId: string) => {
        setCustomTargets(prev => {
            const newMap = new Map(prev);
            newMap.set(originalTargetId, newTargetId);
            return newMap;
        });
    };

    useEffect(() => {
        if (isOpen) {
            loadAnalysis();
        }
    }, [isOpen]);

    const handleMerge = async (group: TagGroup) => {
        // Determine effective target (custom or default)
        const effectiveTargetId = customTargets.get(group.target.id) || group.target.id;
        const allTags = [group.target, ...group.candidates];
        const sourceIds = allTags.filter(t => t.id !== effectiveTargetId).map(t => t.id);
        
        setMergingId(effectiveTargetId);
        try {
            await mergeTags(effectiveTargetId, sourceIds);
            
            // Clean up custom target for this group
            setCustomTargets(prev => {
                const newMap = new Map(prev);
                newMap.delete(group.target.id);
                return newMap;
            });
            
            // Refresh list locally
            setGroups(prev => prev.filter(g => g.target.id !== group.target.id));
            
            if (onTagsUpdated) onTagsUpdated();
            
        } catch (e) {
            console.error("Merge failed", e);
        } finally {
            setMergingId(null);
        }
    };

    const handleIgnore = async (group: TagGroup) => {
        try {
            for (const cand of group.candidates) {
                await ignoreTagMatch(group.target.id, cand.id);
            }
            setGroups(prev => prev.filter(g => g.target.id !== group.target.id));
        } catch (e) {
            console.error("Ignore failed", e);
        }
    };

    const handleMergeAll = async () => {
        if (!confirm(t('tags:mergeConfirm', { count: groups.length }))) {
            return;
        }

        setMergingAll(true);
        let successCount = 0;
        let failCount = 0;

        try {
            // Process merges with individual error handling
            for (const group of groups) {
                try {
                    const sourceIds = group.candidates.map(c => c.id);
                    await mergeTags(group.target.id, sourceIds, "auto");
                    successCount++;
                } catch (e) {
                    console.error(`Failed to merge group for ${group.target.name}:`, e);
                    failCount++;
                }
            }
            
            console.log(`[TagManagerModal] Batch merge complete: ${successCount} succeeded, ${failCount} failed`);
            
            // Refresh to show remaining groups
            await loadAnalysis();
            
            if (onTagsUpdated) onTagsUpdated();
            
        } catch (e) {
            console.error("Batch merge failed", e);
            // Refresh to show remaining groups
            await loadAnalysis();
        } finally {
            setMergingAll(false);
        }
    };

    const handleSetParent = async (tagId: string, parentId: string | null) => {
        try {
            await setTagParent(tagId, parentId);
            const tree = await getTagTree();
            setTagTree(tree);
            if (onTagsUpdated) onTagsUpdated();
        } catch (e) {
            console.error("Failed to set tag parent", e);
        }
    };

    return (
        <>
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
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-background border border-white/10 rounded-xl shadow-2xl z-(--z-modal) flex flex-col max-h-[80vh]"
                        >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Merge className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{t('tags:tagManager')}</h2>
                                    <div className="flex gap-4 mt-2">
                                        <Button 
                                            onClick={() => setActiveTab('fusion')}
                                            className={`text-sm font-medium pb-2 border-b-2 transition-all ${
                                                activeTab === 'fusion' 
                                                    ? 'text-purple-400 border-purple-400' 
                                                    : 'text-gray-500 border-transparent hover:text-gray-300'
                                            }`}
                                        >
                                            {t('tags:smartTagFusion')}
                                            {groups.length > 0 && (
                                                <span className="ml-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded-full">
                                                    {groups.length}
                                                </span>
                                            )}
                                        </Button>
                                        <Button 
                                            onClick={() => setActiveTab('hierarchy')}
                                            className={`text-sm font-medium pb-2 border-b-2 transition-all ${
                                                activeTab === 'hierarchy' 
                                                    ? 'text-blue-400 border-blue-400' 
                                                    : 'text-gray-500 border-transparent hover:text-gray-300'
                                            }`}
                                        >
                                            {t('tags:tagHierarchy')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    onClick={() => setShowHistory(true)} 
                                    className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-medium transition-colors flex items-center gap-2"
                                    title="View merge history"
                                >
                                    <History size={16} />
                                    {t('tags:history')}
                                </Button>
                                <Button onClick={onClose} className="p-2 hover:bg-glass-bg-accent rounded-full text-text-secondary hover:text-text-primary transition-colors">
                                    <X size={20} />
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                                    <p className="text-sm text-white/50">{t('tags:analyzing')}</p>
                                </div>
                            ) : groups.length === 0 ? (
                                <div className="text-center py-12 space-y-3">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                        <TagIcon className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white">{t('tags:tagsClean')}</h3>
                                    <p className="text-sm text-white/40 max-w-xs mx-auto">{t('tags:noSimilarTags')}</p>
                                    
                                    <div className="pt-4 flex flex-col gap-2 items-center">
                                        <Button onClick={loadAnalysis} className="text-xs text-blue-400 hover:text-blue-300 underline">
                                            {t('tags:checkAgain')}
                                        </Button>
                                        <Button 
                                            onClick={async () => {
                                                if(confirm(t('tags:forceResyncConfirm'))) {
                                                    setLoading(true);
                                                    const { syncAllTagsFromMetadata } = await import('../../../services/storage/tags');
                                                    await syncAllTagsFromMetadata();
                                                    await loadAnalysis();
                                                }
                                            }}
                                            className="text-[10px] text-white/30 hover:text-white/60 border border-white/10 px-2 py-1 rounded"
                                        >
                                            {t('tags:forceResync')}
                                        </Button>
                                    </div>
                                </div>
                            ) : activeTab === 'fusion' ? (
                                <div className="space-y-4">
                                    {/* ... existing fusion code ... */}
                                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                        <div className="text-sm text-white/60">
                                            <Trans ns="tags" i18nKey="foundGroups" count={groups.length} components={[<span className="font-bold text-white" />]} />
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
                                    </div>

                                    {groups.map((group) => {
                                        const allTags = [group.target, ...group.candidates];
                                        const customTargetId = customTargets.get(group.target.id);
                                        const effectiveTarget = customTargetId 
                                            ? allTags.find(t => t.id === customTargetId) || group.target
                                            : group.target;
                                        const effectiveCandidates = allTags.filter(t => t.id !== effectiveTarget.id);
                                        
                                        return (
                                            <div key={group.target.id} className="bg-glass-bg-accent border border-glass-border rounded-lg p-4 flex items-center justify-between group-hover:border-glass-border transition-colors">
                                                <div className="flex items-center flex-1 gap-4">
                                                    <div className="flex flex-col gap-1">
                                                        <Button
                                                            onClick={() => toggleMergeDirection(group)}
                                                            className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-100 text-sm font-semibold border-2 border-green-500/50 hover:border-green-500/70 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
                                                            title={t('tags:tagToKeep', { tagName: effectiveTarget.name })}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-green-400 text-lg">✓</span>
                                                                <span>{effectiveTarget.name}</span>
                                                            </div>
                                                        </Button>
                                                        <span className="text-[10px] text-green-400/80 font-bold uppercase tracking-wider text-center">
                                                            {t('tags:kept')}
                                                        </span>
                                                    </div>

                                                    <Button
                                                        onClick={() => toggleMergeDirection(group)}
                                                        className="text-white/30 hover:text-white/70 transition-all cursor-pointer hover:scale-110 active:scale-90"
                                                        title={t('tags:clickToInvert')}
                                                    >
                                                        <ArrowLeftRight className="w-4 h-4" />
                                                    </Button>

                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex flex-wrap gap-2">
                                                            {effectiveCandidates.map(cand => (
                                                                <Button
                                                                    key={cand.id}
                                                                    onClick={() => setCustomTarget(group.target.id, cand.id)}
                                                                    className="px-2 py-1 rounded bg-red-500/10 text-red-300/80 text-xs border border-red-500/30 hover:border-red-500/50 hover:bg-red-500/20 transition-all line-through decoration-red-400 cursor-pointer"
                                                                    title={t('tags:clickToKeep', { tagName: cand.name })}
                                                                >
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-red-400 font-bold">×</span>
                                                                        <span>{cand.name}</span>
                                                                    </div>
                                                                </Button>
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] text-red-400/60 font-bold uppercase tracking-wider">
                                                            {t('tags:deleted', { count: effectiveCandidates.length })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
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
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-2 pb-6">
                                    {tagTree.map(node => (
                                        <TagTreeItem 
                                            key={node.id} 
                                            tag={node.name}
                                            count={node.count ?? 0}
                                            isExpanded={true}
                                            hasChildren={node.children.length > 0}
                                        />
                                    ))}
                                    {tagTree.length === 0 && (
                                        <div className="py-12 text-center text-gray-500 text-sm">
                                            {t('tags:noTagsYet')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
        
        {/* Tag Merge History Modal */}
        <TagMergeHistory 
            isOpen={showHistory} 
            onClose={() => setShowHistory(false)} 
        />
    </>
    );
};
