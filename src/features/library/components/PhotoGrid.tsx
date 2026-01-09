import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { PortfolioItem, Folder, Collection } from '../../../shared/types';
import { PhotoCard } from './PhotoCard';
import { useLibrary } from '../../../shared/contexts/LibraryContext';
import { useSelection } from '../../../shared/contexts/SelectionContext';

interface PhotoGridProps {
  onSelect: (item: PortfolioItem) => void;
  onHover?: (item: PortfolioItem | null) => void;
  onContextMenu?: (e: React.MouseEvent, item: PortfolioItem) => void;
  onTagClick?: (tag: string) => void;
  focusedId?: string | null;
  onFocusChange?: (id: string | null) => void;
  folders?: Folder[];
  collections?: Collection[];
}

const GAP = 16;
// PADDING is 56px (px-7) based on PhotoGrid styling inspection or just allow measuring rect
// Actually we can just let the column width calculation handle it if we measure the container.

const VirtualColumn = ({
  items,
  scrollElement,
  columnWidth,
  onSelect,
  onHover,
  onContextMenu,
  onTagClick,
  focusedId,
  onFocusChange,
  toggleSelection,
  selectionMode,
  selectedIds,
  registerItemRef,
  selectedTag,
  scrollToIndex, // New prop
  folders,
  collections,
}: any) => {
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement.current,
    estimateSize: (i) => {
      const item = items[i];
      // Calculate height based on aspect ratio
      if (item.width && item.height && columnWidth > 0) {
        const aspectRatio = item.width / item.height;
        // Height = Width / AspectRatio
        return columnWidth / aspectRatio + GAP;
      }
      return 300 + GAP; // Fallback
    },
    overscan: 5,
  });

  // Ref to track previous column width to prevent duplicate updates
  const prevWidthRef = useRef(columnWidth);

  useEffect(() => {
    // If column width changes significantly, re-measure all items using the new estimateSize logic
    // 'measure()' forces the virtualizer to recalculate sizes based on the current estimateSize function
    if (Math.abs(columnWidth - prevWidthRef.current) > 1) {
      rowVirtualizer.measure();
      prevWidthRef.current = columnWidth;
    }
  }, [columnWidth, rowVirtualizer]);

  // Handle auto-scrolling
  useEffect(() => {
    if (
      scrollToIndex !== null &&
      scrollToIndex !== undefined &&
      scrollToIndex >= 0 &&
      scrollToIndex < items.length
    ) {
      rowVirtualizer.scrollToIndex(scrollToIndex, { align: 'center', behavior: 'smooth' });
    }
  }, [scrollToIndex, rowVirtualizer]);

  return (
    <div
      className="flex-1 min-w-0" // Flex-1 ensures equal width columns
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: 'relative',
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const item = items[virtualRow.index];
        const isSelected = selectedIds.has(item.id);
        const isFocused = focusedId === item.id;

        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size - GAP}px`, // Subtract GAP for visual separation
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <PhotoCard
              item={item}
              isSelected={isSelected}
              isFocused={isFocused}
              selectionMode={selectionMode}
              showColorTags={true}
              onSelect={onSelect}
              onToggleSelect={toggleSelection}
              onFocus={(id) => onFocusChange?.(id)}
              onContextMenu={onContextMenu || (() => {})}
              onHover={onHover || (() => {})}
              registerItemRef={registerItemRef}
              onTagClick={onTagClick}
              selectedTag={selectedTag}
              folders={folders}
              collections={collections}
            />
          </div>
        );
      })}
    </div>
  );
};

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  onSelect,
  onHover,
  onContextMenu,
  onTagClick,
  focusedId,
  onFocusChange,
  folders = [],
  collections = [],
}) => {
  const { processedItems: items, gridColumns, activeTags } = useLibrary();
  const selectedTag = activeTags.size === 1 ? Array.from(activeTags)[0] : undefined;
  const { selectionMode, selectedIds, toggleSelection, registerItemRef } = useSelection();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width for correct aspect ratio math
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate target column and row for auto-scroll
  const scrollTarget = useMemo(() => {
    if (!focusedId) return null;
    const index = items.findIndex((i) => i.id === focusedId);
    if (index === -1) return null;

    return {
      colIndex: index % gridColumns,
      rowIndex: Math.floor(index / gridColumns),
    };
  }, [focusedId, items, gridColumns]);

  // Distribute items into columns (Masonry-style)
  // Important: To keep stable order, we must use a deterministic distribution
  // or standard modular distribution `index % columns`
  // `index % columns` is visually balanced enough for fixed columns and stable.
  const cols = useMemo(() => {
    const columns: PortfolioItem[][] = Array.from({ length: gridColumns }, () => []);
    items.forEach((item, index) => {
      const colIndex = index % gridColumns;
      const targetColumn = columns[colIndex];
      if (targetColumn) {
        targetColumn.push(item);
      }
    });
    return columns;
  }, [items, gridColumns]);

  const columnWidth = useMemo(() => {
    if (containerWidth === 0) return 0;
    // Width - (gaps) / columns
    // We have 'gridColumns' columns with 'gridColumns - 1' gaps
    // The container has padding px-8 (32px * 2 = 64px)
    // Wait, containerWidth includes padding if using border-box? Result of contentRect excludes padding.
    // Let's assume contentRect is the inner width available for content.

    // The container has 'flex gap-4' aka 16px gap between columns
    const totalGapSpace = (gridColumns - 1) * GAP;
    const availableWidth = containerWidth - totalGapSpace;

    return availableWidth / gridColumns;
  }, [containerWidth, gridColumns]);

  return (
    <div ref={containerRef} className="h-full w-full overflow-y-auto px-8 py-6 custom-scrollbar">
      {/* Only render columns if we have a valid width, otherwise we can't calculate height */}
      {containerWidth > 0 && (
        <div className="flex gap-4 items-start w-full">
          {cols.map((colItems, index) => (
            <VirtualColumn
              key={index}
              colIndex={index}
              items={colItems}
              scrollElement={containerRef}
              columnWidth={columnWidth}
              scrollToIndex={scrollTarget?.colIndex === index ? scrollTarget.rowIndex : null}
              // Pass props
              onSelect={onSelect}
              onHover={onHover}
              onContextMenu={onContextMenu}
              onTagClick={onTagClick}
              focusedId={focusedId}
              onFocusChange={onFocusChange}
              toggleSelection={toggleSelection}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              registerItemRef={registerItemRef}
              selectedTag={selectedTag}
              folders={folders}
              collections={collections}
            />
          ))}
        </div>
      )}
    </div>
  );
};
