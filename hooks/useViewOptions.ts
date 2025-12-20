import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { PortfolioItem, Folder, SortOption, SortDirection, ViewMode } from '../types';

interface UseViewOptionsProps {
  folders: Folder[];
  activeFolderIds: Set<string>;
}

export const useViewOptions = ({ folders, activeFolderIds }: UseViewOptionsProps) => {
  // View State
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  const [gridColumns, setGridColumns] = useState<number>(4);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeColorFilter, setActiveColorFilter] = useState<string | null>(null);
  
  // Sort State
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // --- Derived Data ---
  const currentItems = useMemo(() => {
    if (activeFolderIds.has('all')) return folders.flatMap(f => f.items);
    return folders.filter(f => activeFolderIds.has(f.id)).flatMap(f => f.items);
  }, [folders, activeFolderIds]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    currentItems.forEach(item => item.aiTags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [currentItems]);

  const processedItems = useMemo(() => {
    let result = [...currentItems];
    
    // Fuzzy Search
    if (searchTerm) {
        const fuse = new Fuse(result, {
            keys: [
                { name: 'name', weight: 0.7 },
                { name: 'aiDescription', weight: 0.5 },
                { name: 'aiTags', weight: 0.3 }
            ],
            threshold: 0.4,
            ignoreLocation: true
        });
        result = fuse.search(searchTerm).map(res => res.item);
    }

    // Filters
    if (selectedTag) result = result.filter(item => item.aiTags?.includes(selectedTag));
    if (activeColorFilter) result = result.filter(item => item.colorTag === activeColorFilter);

    // Sort
    result.sort((a, b) => {
        let cmp = 0;
        switch (sortOption) {
            case 'date': cmp = a.lastModified - b.lastModified; break;
            case 'name': cmp = a.name.localeCompare(b.name); break;
            case 'size': cmp = a.size - b.size; break;
        }
        return sortDirection === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [currentItems, searchTerm, selectedTag, activeColorFilter, sortOption, sortDirection]);

  return {
    viewMode, setViewMode,
    gridColumns, setGridColumns,
    searchTerm, setSearchTerm,
    selectedTag, setSelectedTag,
    activeColorFilter, setActiveColorFilter,
    sortOption, setSortOption,
    sortDirection, setSortDirection,
    availableTags,
    processedItems,
    currentItems // Exposed for flat list operations
  };
};
