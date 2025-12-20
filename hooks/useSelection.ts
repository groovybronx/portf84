import { useState, useRef, useCallback } from 'react';
import { PortfolioItem, ViewMode } from '../types';

export const useSelection = (viewMode: ViewMode, processedItems: PortfolioItem[]) => {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Drag State
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [dragBox, setDragBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerItemRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) itemRefs.current.set(id, el); else itemRefs.current.delete(id);
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
       const newSet = new Set(prev);
       if (newSet.has(id)) newSet.delete(id);
       else newSet.add(id);
       return newSet;
    });
  };

  const clearSelection = () => {
      setSelectedIds(new Set());
      setSelectionMode(false);
  };

  // Mouse Events for Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode === ViewMode.CAROUSEL) return;
    // Ignorer clics sur UI interactive
    if ((e.target as HTMLElement).closest('button, input, select, a, .top-bar-area, .drawer-area, .modal-area')) return;
    if (e.button !== 0) return;
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStartPos.current) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    const startX = dragStartPos.current.x;
    const startY = dragStartPos.current.y;
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const x = Math.min(currentX, startX);
    const y = Math.min(currentY, startY);

    // Threshold pour démarrer le drag
    if (!isDragSelecting && (width > 5 || height > 5)) {
        setIsDragSelecting(true);
        if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
             setSelectedIds(new Set());
             setSelectionMode(true);
        }
    }

    if (isDragSelecting) {
        setDragBox({ x, y, w: width, h: height });
        const initialSet = (e.shiftKey || e.ctrlKey || e.metaKey) ? selectedIds : new Set<string>();
        const newSelected = new Set(initialSet);
        
        processedItems.forEach(item => {
            const el = itemRefs.current.get(item.id);
            if (el) {
                const rect = el.getBoundingClientRect();
                // Simple AABB Intersection
                const isIntersecting = !(rect.right < x || rect.left > x + width || rect.bottom < y || rect.top > y + height);
                if (isIntersecting) newSelected.add(item.id);
            }
        });
        setSelectedIds(newSelected);
    }
  };

  const handleMouseUp = () => {
    if (isDragSelecting) {
        setIsDragSelecting(false);
        setDragBox(null);
    } else if (dragStartPos.current) {
        // Simple click in empty space -> Clear selection if not modified
        // if (selectionMode) setSelectedIds(new Set());
    }
    dragStartPos.current = null;
  };

  return {
    selectionMode, setSelectionMode,
    selectedIds, setSelectedIds,
    toggleSelection,
    clearSelection,
    isDragSelecting,
    dragBox,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    registerItemRef
  };
};
