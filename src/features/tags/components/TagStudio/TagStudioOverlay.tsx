import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, Tag, Trash2, Edit3, Plus, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTagsWithUsageStats, TagWithUsage, renameTag, bulkDeleteTags } from '../../../../services/storage/tags';
import { useLibrary } from '../../../../shared/contexts/LibraryContext';
import { useCollections } from '../../../../shared/contexts/CollectionsContext';
import { createSmartCollection } from '../../../../services/smartCollectionService';
import { nanoid } from 'nanoid';

interface TagStudioOverlayProps {
	isOpen: boolean;
	onClose: () => void;
}

export const TagStudioOverlay: React.FC<TagStudioOverlayProps> = ({ isOpen, onClose }) => {
	const { t } = useTranslation(['library', 'common']);
	const { activeCollection } = useCollections();
	const { loadSmartCollections } = useLibrary();
	const [tags, setTags] = useState<TagWithUsage[]>([]);
	// ... existing state

	const handleCreateSmartCollection = async () => {
		if (selectedTagIds.size === 0 || !activeCollection) return;
		
		const selectedTags = tags.filter(t => selectedTagIds.has(t.id));
		const rawName = selectedTags.map(t => t.name).join(' + ');
		const name = rawName.length > 30 ? `${rawName.substring(0, 27)}...` : rawName;
		
		const rules = selectedTags.map(tag => ({
			id: nanoid(),
			type: 'tag' as const,
			value: tag.name
		}));

		try {
			await createSmartCollection({
				collectionId: activeCollection.id,
				name: name,
				icon: 'tag',
				color: '#3B82F6',
				query: {
					operator: 'OR',
					rules: rules
				}
			});
			
			await loadSmartCollections();
			onClose();
		} catch (e) {
			console.error("Failed to create smart collection", e);
		}
	};
	const [searchTerm, setSearchTerm] = useState('');
	const [sortBy, setSortBy] = useState<'name' | 'usage' | 'date'>('usage');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
	const [editingTagId, setEditingTagId] = useState<string | null>(null);
	const [editValue, setEditValue] = useState('');

	useEffect(() => {
		if (isOpen) {
			loadTags();
		}
	}, [isOpen]);

	const loadTags = async () => {
		try {
			const fetchedTags = await getTagsWithUsageStats();
			setTags(fetchedTags);
		} catch (e) {
			console.error("Failed to load tags for studio", e);
		}
	};

	const sortedTags = [...tags]
		.filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
		.sort((a, b) => {
			let result = 0;
			if (sortBy === 'name') result = a.name.localeCompare(b.name);
			else if (sortBy === 'usage') result = b.usageCount - a.usageCount;
			else result = 0; // Usage date not fully tracked yet in schema for tags table, but could use createdAt
			
			return sortOrder === 'asc' ? result : -result;
		});

	const toggleTagSelection = (id: string) => {
		const newSelection = new Set(selectedTagIds);
		if (newSelection.has(id)) newSelection.delete(id);
		else newSelection.add(id);
		setSelectedTagIds(newSelection);
	};

	const handleRename = async (id: string) => {
		if (!editValue.trim()) return;
		try {
			await renameTag(id, editValue.trim());
			setEditingTagId(null);
			loadTags();
		} catch (e) {
			console.error("Rename failed", e);
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedTagIds.size === 0) return;
		if (!window.confirm(t('library:confirmBulkDelete', { count: selectedTagIds.size }))) return;
		
		try {
			await bulkDeleteTags(Array.from(selectedTagIds));
			setSelectedTagIds(new Set());
			loadTags();
		} catch (e) {
			console.error("Bulk delete failed", e);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.98 }}
					className="fixed inset-0 z-(--z-modal) bg-background flex flex-col"
				>
					{/* Header */}
					<header className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md sticky top-0 z-10">
						<div className="flex items-center gap-4">
							<div className="p-2 bg-blue-500/20 rounded-lg">
								<Tag className="w-6 h-6 text-blue-400" />
							</div>
							<div>
								<h1 className="text-xl font-bold text-white">{t('library:tagStudio')}</h1>
								<p className="text-xs text-gray-400">{t('library:tagStudioHeader', { total: tags.length, selected: selectedTagIds.size })}</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="relative group">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
								<input 
									type="text" 
									placeholder={t('library:searchTagsPlaceholder')}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-64 transition-all"
								/>
							</div>

							<button 
								onClick={onClose}
								className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
							>
								<X size={24} />
							</button>
						</div>
					</header>

					{/* Toolbar */}
					<div className="p-4 border-b border-white/5 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="flex bg-white/5 rounded-lg p-1">
								<button 
									onClick={() => setViewMode('grid')}
									className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
								>
									<LayoutGrid size={16} />
								</button>
								<button 
									onClick={() => setViewMode('list')}
									className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
								>
									<List size={16} />
								</button>
							</div>

							<select 
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as any)}
								className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
							>
								<option value="usage">{t('library:sortByPopularity')}</option>
								<option value="name">{t('library:sortByName')}</option>
								<option value="date">{t('library:sortByDate')}</option>
							</select>

							<button 
								onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
								className="p-2 hover:bg-white/5 rounded-lg text-gray-400"
							>
								<ArrowUpDown size={16} />
							</button>
						</div>

						<div className="flex items-center gap-2">
							{selectedTagIds.size > 0 && (
								<motion.div 
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									className="flex items-center gap-2"
								>
									<button 
										onClick={handleCreateSmartCollection}
										className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2"
									>
										<Plus size={14} /> {t('library:createSmartCollectionFromSelection')}
									</button>
									<button 
										onClick={handleDeleteSelected}
										className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2"
									>
										<Trash2 size={14} /> {t('common:deleteSelected')}
									</button>
								</motion.div>
							)}
						</div>
					</div>

					{/* Main Content */}
					<div className="flex-1 overflow-y-auto p-6">
						<div className={viewMode === 'grid' ? "flex flex-wrap gap-2" : "space-y-2 max-w-4xl mx-auto"}>
							{sortedTags.map(tag => (
								<motion.div
									key={tag.id}
									layout
									className={`
										group relative px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2
										${selectedTagIds.has(tag.id) 
											? (tag.type === 'ai' 
												? 'bg-purple-600/30 border-purple-500 shadow-lg shadow-purple-500/20 text-white' 
												: 'bg-blue-600/30 border-blue-500 shadow-lg shadow-blue-500/20 text-white')
											: (tag.type === 'ai'
												? 'bg-purple-500/10 border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:border-purple-400'
												: 'bg-blue-500/10 border-blue-500/30 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400')
										}
									`}
									onClick={() => toggleTagSelection(tag.id)}
								>
									{editingTagId === tag.id ? (
										<input 
											autoFocus
											className="bg-white/10 border border-blue-500/50 rounded px-2 py-0.5 text-xs text-white focus:outline-none min-w-[80px]"
											value={editValue}
											onChange={(e) => setEditValue(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter') handleRename(tag.id);
												if (e.key === 'Escape') setEditingTagId(null);
											}}
											onClick={(e) => e.stopPropagation()}
										/>
									) : (
										<span className="text-xs font-semibold truncate leading-none">
											{tag.name}
										</span>
									)}

									<span className={`text-[9px] font-mono opacity-50 shrink-0 ${selectedTagIds.has(tag.id) ? 'text-white' : ''}`}>
										{tag.usageCount}
									</span>

									{/* Quick Actions Overlay */}
									<div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity z-10">
										<button 
											onClick={(e) => {
												e.stopPropagation();
												setEditingTagId(tag.id);
												setEditValue(tag.name);
											}}
											className="p-1 bg-black/80 border border-white/20 rounded-full text-white hover:bg-blue-500/80 transition-colors"
										>
											<Edit3 size={10} />
										</button>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
