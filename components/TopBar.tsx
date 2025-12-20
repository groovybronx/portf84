import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, CheckSquare, XCircle, Eye, EyeOff, LayoutGrid, FolderCog, Layers, LayoutList, ChevronDown, Share2, FolderInput, X, Pin, PinOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SortOption, SortDirection, COLOR_PALETTE, ViewMode } from '../types';

interface TopBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortOption: SortOption;
  sortDirection: SortDirection;
  onSortChange: (option: SortOption) => void;
  onSortDirectionChange: () => void;
  selectedTag: string | null;
  availableTags: string[];
  onTagSelect: (tag: string | null) => void;
  selectionMode: boolean;
  onToggleSelectionMode: () => void;
  activeColorFilter: string | null;
  onColorAction: (color: string | null) => void;
  showColorTags: boolean;
  onToggleColorTags: () => void;
  currentViewMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  gridColumns?: number;
  onGridColumnsChange?: (cols: number) => void;
  folderName?: string;
  onOpenFolders: () => void;
  selectedCount: number;
  onMoveSelected: () => void;
  onShareSelected: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchTerm,
  onSearchChange,
  sortOption,
  sortDirection,
  onSortChange,
  onSortDirectionChange,
  selectedTag,
  availableTags,
  onTagSelect,
  selectionMode,
  onToggleSelectionMode,
  activeColorFilter,
  onColorAction,
  showColorTags,
  onToggleColorTags,
  currentViewMode,
  onModeChange,
  gridColumns = 4,
  onGridColumnsChange,
  folderName,
  onOpenFolders,
  selectedCount,
  onMoveSelected,
  onShareSelected
}) => {
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Slider Logic (Inverted)
  const MIN_COLS = 2;
  const MAX_COLS = 8;
  const SUM = MIN_COLS + MAX_COLS;
  const sliderValue = SUM - gridColumns;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onGridColumnsChange) {
        const val = Number(e.target.value);
        onGridColumnsChange(SUM - val);
    }
  };

  const viewModes = [
      { id: ViewMode.GRID, icon: LayoutGrid, label: 'Grid' },
      { id: ViewMode.CAROUSEL, icon: Layers, label: 'Flow' },
      { id: ViewMode.LIST, icon: LayoutList, label: 'Detail' },
  ];

  const currentModeData = viewModes.find(m => m.id === currentViewMode) || viewModes[0];
  const shouldShow = isPinned || isHovered || isViewMenuOpen;
  
  // Selection tool is available in GRID and LIST, but NOT in CAROUSEL
  const isSelectionSupported = currentViewMode !== ViewMode.CAROUSEL;

  return (
    <div 
        className="fixed top-0 left-0 right-0 z-40 h-24 flex flex-col items-center pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
            setIsHovered(false);
            setIsViewMenuOpen(false);
        }}
    >
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: shouldShow ? 0 : -100, opacity: shouldShow ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full flex justify-center p-4"
        >
            <div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-2 sm:p-3 flex items-center max-w-[95vw]">
                
                {/* --- LEFT SECTION (Fixed) --- */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Pin Toggle */}
                    <button 
                        onClick={() => setIsPinned(!isPinned)}
                        className={`p-2 rounded-lg transition-colors ${isPinned ? 'text-blue-400 bg-white/5' : 'text-gray-500 hover:text-white'}`}
                        title={isPinned ? "Unpin Topbar (Auto-hide)" : "Pin Topbar"}
                    >
                        {isPinned ? <Pin size={16} fill="currentColor" /> : <PinOff size={16} />}
                    </button>

                    <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

                    {/* Folder Library Button */}
                    <button 
                        onClick={onOpenFolders}
                        className="p-2 sm:px-3 sm:py-2 rounded-lg hover:bg-white/10 text-blue-400 hover:text-white flex items-center gap-2 transition-colors border border-transparent hover:border-white/5"
                        title="Open Library"
                    >
                        <FolderCog size={18} />
                        <span className="text-sm font-medium hidden md:inline max-w-[100px] truncate">{folderName || 'Library'}</span>
                    </button>
                </div>


                {/* --- MIDDLE SECTION (Scrollable) --- */}
                {/* This section takes available space and scrolls horizontally if needed, preventing layout break. */}
                <div className="flex-1 flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar px-2 sm:px-4 min-w-0">
                    
                    <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block flex-shrink-0" />

                    {/* Search */}
                    <div className="flex items-center bg-white/5 rounded-lg px-3 py-2 border border-white/5 w-28 sm:w-48 transition-all focus-within:w-48 sm:focus-within:w-64 focus-within:border-blue-500/50 flex-shrink-0">
                        <Search size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500 min-w-0"
                        />
                    </div>

                    {/* Color Tool */}
                    <div className="hidden lg:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 flex-shrink-0">
                        {Object.entries(COLOR_PALETTE).map(([key, hex]) => (
                            <button
                                key={key}
                                onClick={() => onColorAction(activeColorFilter === hex && !selectionMode ? null : hex)}
                                className={`w-4 h-4 rounded-full transition-all border shadow-sm ${
                                    activeColorFilter === hex && !selectionMode
                                    ? 'scale-125 border-white ring-2 ring-white/20' 
                                    : 'border-transparent hover:scale-110 opacity-80 hover:opacity-100 hover:border-white/30'
                                }`}
                                style={{ backgroundColor: hex }}
                            />
                        ))}
                        <button
                            onClick={() => onColorAction(null)}
                            className={`w-4 h-4 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition-colors ${!activeColorFilter && !selectionMode ? 'opacity-30 cursor-default' : ''}`}
                        >
                            <XCircle size={14} />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <button
                            onClick={onToggleColorTags}
                            className={`w-4 h-4 flex items-center justify-center rounded-full transition-colors ${showColorTags ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            {showColorTags ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                    </div>

                    {/* Grid Size Slider */}
                    {currentViewMode === ViewMode.GRID && onGridColumnsChange && (
                        <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5 mx-2 flex-shrink-0">
                            <input 
                                type="range" 
                                min={MIN_COLS} 
                                max={MAX_COLS} 
                                step="1"
                                value={sliderValue}
                                onChange={handleSliderChange}
                                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                            />
                        </div>
                    )}

                    <div className="flex-1" />

                    {/* Action / Context Area */}
                    {selectionMode ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-300 flex-shrink-0">
                            <span className="text-xs font-mono text-white/50 bg-white/5 px-2 py-1 rounded hidden md:block">
                                {selectedCount} Selected
                            </span>
                            <button 
                                onClick={onMoveSelected}
                                disabled={selectedCount === 0}
                                className="p-2 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white"
                                title="Move"
                            >
                                <FolderInput size={18} />
                            </button>
                            <button 
                                onClick={onShareSelected}
                                disabled={selectedCount === 0}
                                className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/40 text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Share"
                            >
                                <Share2 size={18} />
                            </button>
                            <button
                                onClick={onToggleSelectionMode}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                                <X size={18} />
                                <span className="text-sm font-medium hidden sm:inline">Done</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Filter Tags */}
                            <div className="relative group hidden xl:block">
                                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                    <Filter size={16} className={selectedTag ? "text-blue-400" : "text-gray-400"} />
                                    <span className="text-sm text-gray-300 max-w-[80px] truncate">
                                        {selectedTag || "Tags"}
                                    </span>
                                </div>
                                {/* Dropdown content */}
                                <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden hidden group-hover:block max-h-64 overflow-y-auto z-50">
                                    <button 
                                        onClick={() => onTagSelect(null)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 ${!selectedTag ? 'text-blue-400' : 'text-gray-400'}`}
                                    >
                                        All Tags
                                    </button>
                                    {availableTags.map(tag => (
                                        <button 
                                            key={tag}
                                            onClick={() => onTagSelect(tag)}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 ${selectedTag === tag ? 'text-blue-400' : 'text-gray-400'}`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div className="hidden lg:flex items-center gap-1">
                                <select 
                                    value={sortOption}
                                    onChange={(e) => onSortChange(e.target.value as SortOption)}
                                    className="bg-white/5 border border-white/5 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer w-20"
                                >
                                    <option value="date">Date</option>
                                    <option value="name">Name</option>
                                    <option value="size">Size</option>
                                </select>
                                <button 
                                    onClick={onSortDirectionChange}
                                    className="p-2 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 text-gray-400"
                                >
                                    <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                                </button>
                            </div>

                            {isSelectionSupported && (
                                <>
                                    <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />
                                    {/* Selection Mode Toggle */}
                                    <button
                                        onClick={onToggleSelectionMode}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white/5 border-white/5 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <CheckSquare size={16} />
                                        <span className="text-sm font-medium hidden sm:inline">Select</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>


                {/* --- RIGHT SECTION (Fixed) --- */}
                {/* Placed outside the scrollable area to allow the Dropdown to overflow visibly */}
                <div className="flex items-center gap-2 flex-shrink-0 pl-2 ml-2 border-l border-white/10 relative z-50">
                    {/* View Mode Switcher (Expandable) */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors min-w-[100px] justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <currentModeData.icon size={16} className="text-blue-400" />
                                <span className="text-sm font-medium">{currentModeData.label}</span>
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isViewMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                            {isViewMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full mt-2 right-0 w-32 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                                >
                                    {viewModes.map(mode => (
                                        <button
                                            key={mode.id}
                                            onClick={() => {
                                                onModeChange(mode.id);
                                                setIsViewMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/10 transition-colors ${currentViewMode === mode.id ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'}`}
                                        >
                                            <mode.icon size={16} />
                                            {mode.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </motion.div>
    </div>
  );
};