import React from 'react';
import { PhotoGrid } from './PhotoGrid';
import { PhotoCarousel } from './PhotoCarousel';
import { CinematicCarousel } from './CinematicCarousel';
import { PhotoList } from './PhotoList';
import { PortfolioItem, ViewMode, Folder, Collection } from '../../../shared/types';

export interface ViewRendererProps {
  viewMode: ViewMode;
  useCinematicCarousel: boolean;
  currentItems: PortfolioItem[];
  selectedItem: PortfolioItem | null;
  focusedId: string | null;
  onSelect: (item: PortfolioItem) => void;
  onHover: (item: PortfolioItem | null) => void;
  onContextMenu: (e: React.MouseEvent, item: PortfolioItem) => void;
  onTagClick: (tag: string) => void;
  onFocusChange: (id: string | null) => void;
  folders?: Folder[];
  collections?: Collection[];
}

/**
 * ViewRenderer - Renders the appropriate view based on viewMode
 * Handles Grid, Carousel (standard and cinematic), and List views
 */
export const ViewRenderer: React.FC<ViewRendererProps> = ({
  viewMode,
  useCinematicCarousel,
  currentItems,
  selectedItem,
  focusedId,
  onSelect,
  onHover,
  onContextMenu,
  onTagClick,
  onFocusChange,
  folders,
  collections,
}) => {
  switch (viewMode) {
    case ViewMode.GRID:
      return (
        <PhotoGrid
          onSelect={onSelect}
          onHover={onHover}
          onContextMenu={onContextMenu}
          onTagClick={onTagClick}
          focusedId={focusedId}
          onFocusChange={onFocusChange}
          {...(folders && { folders })}
          {...(collections && { collections })}
        />
      );

    case ViewMode.CAROUSEL:
      // Use experimental Cinematic Carousel if enabled
      if (useCinematicCarousel) {
        return (
          <CinematicCarousel
            items={currentItems}
            initialIndex={
              selectedItem ? currentItems.findIndex((item) => item.id === selectedItem.id) : 0
            }
            onClose={() => onSelect(null as any)}
            onItemClick={onSelect}
          />
        );
      }
      // Default PhotoCarousel
      return <PhotoCarousel onSelect={onSelect} onFocusedItem={(i) => onFocusChange(i.id)} />;

    case ViewMode.LIST:
      return (
        <PhotoList
          onSelect={onSelect}
          onHover={onHover}
          onContextMenu={onContextMenu}
          onTagClick={onTagClick}
          focusedId={focusedId}
          onFocusChange={onFocusChange}
        />
      );

    default:
      return null;
  }
};
