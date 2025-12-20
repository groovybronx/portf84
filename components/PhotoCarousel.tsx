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

  // Range of items to render on each side
  const VISIBLE_RANGE = 4;

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden relative bg-gradient-to-b from-background to-black">
      
      {/* Background blur */}
      <div className="absolute inset-0 z-0 opacity-40 blur-[80px] transition-all duration-700">
        {items[currentIndex] && (
            <img 
                src={items[currentIndex].url} 
                className="w-full h-full object-cover" 
                alt="background"
            />
        )}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* 3D Container with Enhanced Perspective */}
      <div className="relative z-10 w-full h-[70vh] flex items-center justify-center perspective-[1000px]">
        <AnimatePresence initial={false}>
            {items.map((item, index) => {
                const offset = getOffset(index);
                const absOffset = Math.abs(offset);
                
                // Don't render items far outside the visual range
                if (absOffset > VISIBLE_RANGE) return null;

                // Spacing Configuration
                // BASE_GAP: Distance of first neighbor from center (in %)
                // STACK_GAP: Distance between subsequent neighbors (in %)
                const BASE_GAP = 55; 
                const STACK_GAP = 30;
                
                let xPos = 0;
                if (offset !== 0) {
                    const sign = Math.sign(offset);
                    xPos = sign * (BASE_GAP + (absOffset - 1) * STACK_GAP);
                }

                // Rotation Limit: Reduced to 45 degrees max to prevent gaps
                const rotation = -Math.sign(offset) * Math.min(absOffset * 20, 45);

                // Progressive scaling based on distance to accentuate depth
                const scale = Math.max(0, 1 - absOffset * 0.1);

                return (
                    <motion.div
                        key={item.id}
                        className="absolute w-[60vw] sm:w-[45vw] md:w-[35vw] lg:w-[28vw] aspect-[3/4] rounded-xl bg-surface border border-white/10 cursor-pointer shadow-2xl"
                        initial={false}
                        animate={{ 
                            // 3D Layout Logic
                            opacity: absOffset > VISIBLE_RANGE - 1 ? 0 : 1,
                            
                            x: `${xPos}%`, 
                            
                            // Depth: Adjusted to work with the new scaling
                            z: absOffset === 0 ? 0 : -80 * absOffset, 
                            
                            rotateY: rotation,
                            
                            scale: scale,
                            
                            zIndex: 100 - absOffset,
                            
                            filter: absOffset === 0 
                                ? 'brightness(1) blur(0px)' 
                                : `brightness(${Math.max(0.3, 0.8 - absOffset * 0.1)}) blur(${Math.min(absOffset, 4)}px)`,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 180,
                            damping: 25,
                            mass: 1
                        }}
                        onClick={() => {
                            if (offset === 0) onSelect(item);
                            else {
                                const newIndex = (currentIndex + offset + items.length) % items.length;
                                setCurrentIndex(newIndex);
                            }
                        }}
                        style={{
                            transformStyle: "preserve-3d"
                        }}
                    >
                        {/* Image Container */}
                        <div className="w-full h-full rounded-xl overflow-hidden relative">
                            <img 
                                src={item.url} 
                                alt={item.name} 
                                className="w-full h-full object-cover pointer-events-none select-none" 
                            />

                            {/* Color Tag (only on active item or if style permits) */}
                            {showColorTags && item.colorTag && (
                                <div 
                                    className="absolute bottom-0 inset-x-0 h-2 z-20"
                                    style={{ backgroundColor: item.colorTag, boxShadow: `0 -2px 10px ${item.colorTag}` }}
                                />
                            )}
                            
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-40 pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />

                            {/* Info Label - Only active item */}
                            {offset === 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute bottom-0 left-0 right-0 p-6 translate-z-10"
                                >
                                    <h2 className="text-2xl font-bold text-white mb-1 truncate drop-shadow-lg">{item.name}</h2>
                                    <p className="text-gray-300 text-sm font-mono drop-shadow-md">{(item.size / 1024 / 1024).toFixed(2)} MB</p>
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
        <button onClick={prev} className="pointer-events-auto p-4 rounded-full bg-black/20 backdrop-blur-md hover:bg-white/10 text-white transition-all border border-white/5 hover:scale-110 active:scale-95 group">
            <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <button onClick={next} className="pointer-events-auto p-4 rounded-full bg-black/20 backdrop-blur-md hover:bg-white/10 text-white transition-all border border-white/5 hover:scale-110 active:scale-95 group">
            <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <div className="absolute bottom-20 left-0 right-0 text-center z-10">
          <p className="text-white/30 text-xs font-mono tracking-widest uppercase">
            3D Flow View
          </p>
      </div>
    </div>
  );
};