import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { getAllTags } from '../../../services/storage/tags';
import { getDB } from '../../../services/storage/db';
import { DBTagMerge, ParsedTag } from '../../../shared/types/database';

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
    const [history, setHistory] = useState<MergeHistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const loadHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const db = await getDB();
            
            // Get all merge records
            const merges = await db.select<DBTagMerge[]>(
                "SELECT * FROM tag_merges ORDER BY mergedAt DESC"
            );

            // Get all tags to map IDs to names
            const tags = await getAllTags();
            const tagMap = new Map<string, string>();
            tags.forEach((tag: ParsedTag) => {
                tagMap.set(tag.id, tag.name);
            });

            // Enrich merge records with tag names
            const enrichedHistory: MergeHistoryEntry[] = merges.map(merge => ({
                ...merge,
                targetTagName: tagMap.get(merge.targetTagId) || 'Unknown',
                sourceTagName: tagMap.get(merge.sourceTagId) || 'Deleted',
            }));

            setHistory(enrichedHistory);
        } catch (e) {
            console.error("Failed to load merge history", e);
            setError("Failed to load merge history. Please try again.");
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
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatMergeType = (mergedBy: string | null) => {
        if (!mergedBy) return 'auto';
        return mergedBy;
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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-background border border-white/10 rounded-xl shadow-2xl z-(--z-modal) flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <History className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Merge History</h2>
                                    <p className="text-xs text-white/50">Track all tag consolidation operations</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={loadHistory}
                                    className="p-2 hover:bg-glass-bg-accent rounded-full text-text-secondary hover:text-text-primary transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                </button>
                                <button 
                                    onClick={onClose} 
                                    className="p-2 hover:bg-glass-bg-accent rounded-full text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                                    <p className="text-sm text-white/50">Loading history...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                                        <X className="w-8 h-8 text-red-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white">Error Loading History</h3>
                                    <p className="text-sm text-white/40 max-w-xs mx-auto text-center">{error}</p>
                                    <button 
                                        onClick={loadHistory}
                                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-medium transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-12 space-y-3">
                                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                                        <History className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white">No merge history</h3>
                                    <p className="text-sm text-white/40 max-w-xs mx-auto">
                                        Tag merges will appear here once you start consolidating similar tags.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3" role="table" aria-label="Tag merge history">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-11 gap-4 px-4 py-2 text-xs font-semibold text-white/50 uppercase tracking-wider border-b border-white/10" role="row">
                                        <div className="col-span-3" role="columnheader">Date</div>
                                        <div className="col-span-4" role="columnheader">Target Tag</div>
                                        <div className="col-span-3" role="columnheader">Source Tag</div>
                                        <div className="col-span-1" role="columnheader">Type</div>
                                    </div>

                                    {/* Table Rows */}
                                    {currentItems.map((entry) => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="grid grid-cols-11 gap-4 px-4 py-3 bg-glass-bg-accent border border-glass-border rounded-lg hover:border-white/20 transition-colors items-center"
                                            role="row"
                                        >
                                            <div className="col-span-3 text-sm text-white/70" role="cell">
                                                {formatDate(entry.mergedAt)}
                                            </div>
                                            <div className="col-span-4" role="cell">
                                                <span className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-200 text-sm font-medium border border-blue-500/30 inline-block">
                                                    {entry.targetTagName}
                                                </span>
                                            </div>
                                            <div className="col-span-3" role="cell">
                                                <span className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-300/70 text-sm border border-red-500/20 inline-block line-through decoration-red-400/50">
                                                    {entry.sourceTagName}
                                                </span>
                                            </div>
                                            <div className="col-span-1" role="cell">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    entry.mergedBy === 'auto' 
                                                        ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                                                        : 'bg-green-500/20 text-green-200 border border-green-500/30'
                                                }`}>
                                                    {formatMergeType(entry.mergedBy)}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {history.length > ITEMS_PER_PAGE && (
                            <div className="p-4 border-t border-white/10 flex items-center justify-between">
                                <div className="text-sm text-white/50">
                                    Showing {startIndex + 1}-{Math.min(endIndex, history.length)} of {history.length} entries
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg bg-glass-bg-accent border border-glass-border hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-sm text-white/70 min-w-[80px] text-center">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg bg-glass-bg-accent border border-glass-border hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Next page"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
