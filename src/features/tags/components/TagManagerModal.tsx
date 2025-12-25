import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Merge, RefreshCw, Tag as TagIcon, ArrowRight } from 'lucide-react';
import { analyzeTagRedundancy, TagGroup } from '../../../services/tagAnalysisService';
import { mergeTags } from '../../../services/storage/tags';
import { ParsedTag } from '../../../shared/types/database';

interface TagManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTagsUpdated?: () => void;
}

export const TagManagerModal: React.FC<TagManagerModalProps> = ({ isOpen, onClose, onTagsUpdated }) => {
    const [groups, setGroups] = useState<TagGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [mergingId, setMergingId] = useState<string | null>(null);

    const loadAnalysis = async () => {
        setLoading(true);
        try {
            const result = await analyzeTagRedundancy();
            setGroups(result);
        } catch (e) {
            console.error("Failed to analyze tags", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadAnalysis();
        }
    }, [isOpen]);

    const handleMerge = async (group: TagGroup) => {
        setMergingId(group.target.id);
        try {
            const sourceIds = group.candidates.map(c => c.id);
            await mergeTags(group.target.id, sourceIds);
            
            // Refresh list locally
            setGroups(prev => prev.filter(g => g.target.id !== group.target.id));
            
            if (onTagsUpdated) onTagsUpdated();
            
        } catch (e) {
            console.error("Merge failed", e);
        } finally {
            setMergingId(null);
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
                                    <h2 className="text-xl font-bold text-white">Smart Tag Fusion</h2>
                                    <p className="text-xs text-white/50">Clean up your library by merging duplicate tags</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                                    <p className="text-sm text-white/50">Analyzing tag database...</p>
                                </div>
                            ) : groups.length === 0 ? (
                                <div className="text-center py-12 space-y-3">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                        <TagIcon className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white">Your tags are clean!</h3>
                                    <p className="text-sm text-white/40 max-w-xs mx-auto">No similar tags were found. Great job maintaining your library.</p>
                                    <button onClick={loadAnalysis} className="text-xs text-blue-400 hover:text-blue-300 underline mt-2">Check Again</button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {groups.map((group) => (
                                        <div key={group.target.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between group-hover:border-white/20 transition-colors">
                                            <div className="flex items-center flex-1 gap-4">
                                                {/* Target Tag */}
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-200 text-sm font-medium border border-blue-500/30">
                                                        {group.target.name}
                                                    </span>
                                                </div>

                                                <ArrowRight className="w-4 h-4 text-white/20" />

                                                {/* Source Tags (Candidates) */}
                                                <div className="flex flex-wrap gap-2">
                                                    {group.candidates.map(cand => (
                                                        <span key={cand.id} className="px-2 py-1 rounded bg-white/5 text-white/60 text-xs border border-white/5 strike-through-hover decoration-red-400/50">
                                                            {cand.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleMerge(group)}
                                                disabled={mergingId === group.target.id}
                                                className="ml-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95"
                                            >
                                                {mergingId === group.target.id ? (
                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Merge className="w-3 h-3" />
                                                )}
                                                Merge
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
