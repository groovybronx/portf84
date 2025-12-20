import React, { useState, useEffect } from 'react';
import { PortfolioItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoCarouselProps {
  items: PortfolioItem[];
  onSelect: (item: PortfolioItem) => void;
  showColorTags?: boolean;
  onFocusedItem?: (item: PortfolioItem) => void;
}

export const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ items, onSelect, showColorTags, onFocusedItem }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Safety check for index when items change
  useEffect(() => {
      if (items.length > 0 && currentIndex >= items.length) {
          setCurrentIndex(0);
      }
  }, [items.length]);

  // Notify parent about the currently focused item
  useEffect(() => {
    if (items.length > 0 && items[currentIndex] && onFocusedItem) {
        onFocusedItem(items[currentIndex]);
    }
  }, [currentIndex, items, onFocusedItem]);

  const next = () => {
      if (items.length === 0) return;
      setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
      if (items.length === 0) return;
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            next();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prev();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (items.length > 0) {
                onSelect(items[currentIndex]);
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, currentIndex, onSelect]);

  if (items.length === 0) {
      return (
          <div className="h-screen w-full flex items-center justify-center text-gray-500">
              No items to display
          </div>
      );
  }

  // Calculate the shortest visual distance for circular wrapping
  const getOffset = (index: number) => {
    const diff = index - currentIndex;
    const length = items.length;
    let offset = diff;
    if (diff > length / 2) offset -= length;
    if (diff < -length / 2) offset += length;
    return offset;
  };

  // Performance: Reduce visible range to minimize DOM nodes and GPU layers
  const VISIBLE_RANGE = 3; 

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden relative bg-[#050505]">
      {/* Static Background - Performance Optimization: 
          Removed dynamic blurred image background which caused heavy repaints on every slide change.
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 via-black to-black z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent z-0 pointer-events-none" />

      {/* 3D Container */}
      <div className="relative z-10 w-full h-[65vh] flex items-center justify-center perspective-[1200px]">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((item, index) => {
            const offset = getOffset(index);
            const absOffset = Math.abs(offset);

            // Strict culling of off-screen items for performance
            if (absOffset > VISIBLE_RANGE) return null;

            const zIndex = 100 - absOffset;

            // Optimized 3D Spacing
            const X_SPACING = 60; // % spacing
            const Z_DEPTH = -300; // px depth

            let xPos = 0;
            let zPos = 0;
            let rotateY = 0;
            let opacity = 1;

            if (offset !== 0) {
              const sign = Math.sign(offset);
              // Non-linear spacing to bunch up items slightly in the back
              xPos = sign * (50 + absOffset * 10);
              zPos = absOffset * Z_DEPTH;
              rotateY = -sign * 45; // Fixed rotation for side items looks cleaner than progressive
              opacity = Math.max(0.2, 1 - absOffset * 0.3);
            }

            return (
              <motion.div
                key={item.id}
                className="absolute w-[50vw] sm:w-[35vw] md:w-[28vw] aspect-[3/4] rounded-xl glass-surface border border-glass-border cursor-pointer shadow-2xl origin-bottom"
                initial={false}
                animate={{
                  x: `${xPos}%`,
                  z: zPos,
                  rotateY: rotateY,
                  opacity: opacity,
                  scale: offset === 0 ? 1 : 0.85,
                }}
                transition={{
                  // Using a simpler spring for better performance than complex physics
                  type: "spring",
                  stiffness: 200,
                  damping: 30,
                }}
                onClick={() => {
                  if (offset === 0) onSelect(item);
                  else {
                    const newIndex =
                      (currentIndex + offset + items.length) % items.length;
                    setCurrentIndex(newIndex);
                  }
                }}
                style={{
                  transformStyle: "preserve-3d",
                  zIndex: zIndex,
                  // Hint to browser to promote this layer
                  willChange: "transform, opacity",
                }}
              >
                {/* Image Container */}
                <div className="w-full h-full rounded-xl overflow-hidden relative bg-[#1a1a1a]">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    loading="lazy" // Lazy load images
                    style={
                      {
                        // Remove blur filter for performance.
                        // Instead use opacity overlay for depth perception.
                      }
                    }
                  />

                  {/* Darken Overlay for side items (Cheaper than blur) */}
                  {offset !== 0 && (
                    <div className="absolute inset-0 bg-black/40 transition-colors" />
                  )}

                  {/* Color Tag */}
                  {showColorTags && item.colorTag && (
                    <div
                      className="absolute bottom-0 inset-x-0 h-1.5 z-20"
                      style={{ backgroundColor: item.colorTag }}
                    />
                  )}

                  {/* Reflection/Gloss Effect (Static CSS is cheap) */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-20 pointer-events-none" />

                  {/* Info Label - Only active item */}
                  {offset === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
                    >
                      <h2 className="text-xl font-bold text-white mb-1 truncate">
                        {item.name}
                      </h2>
                      {item.aiDescription && (
                        <p className="text-gray-300 text-xs line-clamp-1">
                          {item.aiDescription}
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-12 z-20 pointer-events-none">
        <button
          onClick={prev}
          className="pointer-events-auto p-3 rounded-full bg-glass-bg hover:bg-glass-bg-active text-white transition-all border border-glass-border active:scale-95"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={next}
          className="pointer-events-auto p-3 rounded-full bg-glass-bg hover:bg-glass-bg-active text-white transition-all border border-glass-border active:scale-95"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      <div className="absolute bottom-24 left-0 right-0 text-center z-10 pointer-events-none">
        <p className="text-white/20 text-[10px] font-mono tracking-[0.2em] uppercase">
          {currentIndex + 1} / {items.length}
        </p>
      </div>
    </div>
  );
};
