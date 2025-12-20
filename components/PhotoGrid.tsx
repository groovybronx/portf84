import React, { useEffect, useRef, useMemo, useState } from 'react';
import { PortfolioItem } from '../types';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

interface PhotoGridProps {
  items: PortfolioItem[];
  onSelect: (item: PortfolioItem) => void;
  selectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  showColorTags: boolean;
  onHover?: (item: PortfolioItem | null) => void;
  columns?: number;
  focusedId?: string | null;
  onFocusChange?: (id: string | null) => void;
  registerItemRef?: (id: string, el: HTMLElement | null) => void;
  onContextMenu?: (e: React.MouseEvent, item: PortfolioItem) => void;
}

const ITEMS_PER_PAGE = 30;

export const PhotoGrid: React.FC<PhotoGridProps> = ({ 
    items, 
    onSelect,
    selectionMode,
    selectedIds,
    onToggleSelect,
    showColorTags,
    onHover,
    columns = 4, 
    focusedId,
    onFocusChange,
    registerItemRef,
    onContextMenu
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Reset count when source items change significantly (e.g. folder change)
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    // Scroll to top when items are completely swapped out (folder change)
    if (window.scrollY > 200) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [items.length]); // Use length as a simple proxy for change

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < items.length) {
            setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, items.length));
        }
      },
      { threshold: 0.1, rootMargin: '400px' } // Preload before reaching bottom
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [items.length, visibleCount]);

  // Slice items for display
  const displayedItems = useMemo(() => {
      return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  // --- Logic: Distributed Masonry ---
  const distributedColumns = useMemo(() => {
    const cols: PortfolioItem[][] = Array.from({ length: columns }, () => []);
    displayedItems.forEach((item, index) => {
        cols[index % columns].push(item);
    });
    return cols;
  }, [displayedItems, columns]);


  // Keyboard Navigation Effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!items || items.length === 0) return;
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        // If nothing focused, focus the first one on keypress
        let currentIndex = -1;
        if (focusedId) {
            currentIndex = items.findIndex(item => item.id === focusedId);
        }

        if (currentIndex === -1 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            if (items.length > 0) {
                onFocusChange?.(items[0].id);
            }
            return;
        }

        let nextIndex = currentIndex;

        switch (e.key) {
            case 'ArrowRight':
                e.preventDefault();
                nextIndex = Math.min(items.length - 1, currentIndex + 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                nextIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                nextIndex = Math.max(0, currentIndex - columns);
                break;
            case 'ArrowDown':
                e.preventDefault();
                nextIndex = Math.min(items.length - 1, currentIndex + columns);
                break;
            case 'Enter':
                e.preventDefault();
                if (currentIndex !== -1) {
                    onSelect(items[currentIndex]);
                }
                break;
            default:
                return;
        }

        if (nextIndex !== currentIndex && items[nextIndex]) {
            onFocusChange?.(items[nextIndex].id);
            
            // Auto-scroll logic needs to check if item is in DOM (rendered)
            // If the item is outside the visible range (virtualized), we might need to force load more
            // For simplicity in this implementation, infinite scroll handles "down", 
            // but "jumping" way ahead is tricky. 
            if (nextIndex >= visibleCount) {
                setVisibleCount(prev => nextIndex + ITEMS_PER_PAGE);
            }

            setTimeout(() => {
                const element = document.getElementById(`grid-item-${items[nextIndex].id}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 50);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, focusedId, columns, onFocusChange, onSelect, visibleCount]);

  return (
    <div
      className="p-4 sm:p-8 pb-10 pt-[var(--layout-pt)] w-full min-h-screen"
      ref={containerRef}
    >
      {/* Flex container holding the columns */}
      <div className="flex gap-4 items-start w-full">
        {distributedColumns.map((colItems, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-4 flex-1 min-w-0">
            {colItems.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const isFocused = focusedId === item.id;

              return (
                <motion.div
                  key={item.id}
                  id={`grid-item-${item.id}`}
                  ref={(el) => {
                    if (registerItemRef) registerItemRef(item.id, el);
                  }}
                  layoutId={`card-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: selectionMode && isSelected ? 0.95 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                  onMouseEnter={() => onHover?.(item)}
                  onMouseLeave={() => onHover?.(null)}
                  onContextMenu={(e) => onContextMenu?.(e, item)}
                  className={`relative group cursor-pointer overflow-hidden rounded-lg bg-glass-bg-accent transition-all duration-200 ${
                    isSelected
                      ? "border-2 border-blue-500 ring-2 ring-blue-500/50"
                      : isFocused
                      ? "border-2 border-white/80 ring-2 ring-white/20 z-10 scale-[1.02]"
                      : "border border-transparent"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectionMode) {
                      onToggleSelect(item.id);
                    } else {
                      onFocusChange?.(item.id);
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (!selectionMode) {
                      onSelect(item);
                    }
                  }}
                >
                  <motion.img
                    src={item.url}
                    alt={item.name}
                    className={`w-full h-auto object-cover transition-transform duration-700 ${
                      !selectionMode ? "group-hover:scale-105" : ""
                    }`}
                    loading="lazy"
                  />

                  {showColorTags && item.colorTag && (
                    <>
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 z-20"
                        style={{ backgroundColor: item.colorTag }}
                      />
                      <div
                        className="absolute top-3 left-3 w-3 h-3 rounded-full shadow-lg z-20 border border-black/20"
                        style={{ backgroundColor: item.colorTag }}
                      />
                    </>
                  )}

                  {!selectionMode && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 flex flex-col justify-end p-4 ${
                        isFocused
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <p className="text-white text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-white/60 text-xs uppercase tracking-wider">
                        {(item.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  {selectionMode && (
                    <div className="absolute inset-0 bg-black/20 flex items-start justify-end p-3">
                      {isSelected ? (
                        <CheckCircle2
                          className="text-blue-500 drop-shadow-lg bg-white rounded-full"
                          size={24}
                          fill="white"
                        />
                      ) : (
                        <Circle
                          className="text-white/70 drop-shadow-lg"
                          size={24}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sentinel for Infinite Scroll */}
      <div
        ref={observerTarget}
        className="w-full h-20 flex items-center justify-center text-white/20"
      >
        {visibleCount < items.length && (
          <div className="animate-pulse">Loading more...</div>
        )}
      </div>
    </div>
  );
};