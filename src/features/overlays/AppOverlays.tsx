import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ContextMenu, UnifiedProgress } from '../../shared/components';
import { ImageViewer } from '../../features/vision';
import { PortfolioItem } from '../../shared/types';

interface AppOverlaysProps {
  contextMenu: { x: number; y: number; item: PortfolioItem } | null;
  setContextMenu: (menu: { x: number; y: number; item: PortfolioItem } | null) => void;
  selectedItem: PortfolioItem | null;
  setSelectedItem: (item: PortfolioItem | null) => void;
  updateItem: (item: PortfolioItem) => void;
  handleNext: () => void;
  handlePrev: () => void;
  availableTags: string[];
  currentItems: PortfolioItem[];
  analyzeItem: (item: PortfolioItem) => void;
  handleContextAddTag: (item: PortfolioItem) => void;
  handleContextMove: (item: PortfolioItem) => void;
  applyColorTagToSelection: (color: string | undefined) => void;
  isDragSelecting: boolean;
  dragBox: { x: number; y: number; w: number; h: number } | null;
  collectionsLoading: boolean;
}

export const AppOverlays: React.FC<AppOverlaysProps> = ({
  contextMenu,
  setContextMenu,
  selectedItem,
  setSelectedItem,
  updateItem,
  handleNext,
  handlePrev,
  availableTags,
  currentItems,
  analyzeItem,
  handleContextAddTag,
  handleContextMove,

  isDragSelecting,
  dragBox,
}) => {
  return (
    <>
      {/* Loading Overlay */}
      <UnifiedProgress />

      {/* Drag Selection Box */}
      {isDragSelecting && dragBox && (
        <div
          className="fixed border-2 border-blue-500 bg-blue-500/30 z-(--z-controlbar) pointer-events-none"
          style={{
            left: dragBox.x,
            top: dragBox.y,
            width: dragBox.w,
            height: dragBox.h,
          }}
        />
      )}

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            item={contextMenu.item}
            onClose={() => setContextMenu(null)}
            onAnalyze={analyzeItem}
            onDelete={(_id) =>
              updateItem({
                ...contextMenu.item,
                folderId: 'trash',
              })
            }
            onAddTags={handleContextAddTag}
            onOpen={setSelectedItem}
            onMove={handleContextMove}
            onColorTag={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Image Viewer */}
      <AnimatePresence>
        {selectedItem && (
          <ImageViewer
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdateItem={updateItem}
            onNext={handleNext}
            onPrev={handlePrev}
            showColorTags={true}
            availableTags={availableTags}
            allItems={currentItems}
          />
        )}
      </AnimatePresence>
    </>
  );
};
