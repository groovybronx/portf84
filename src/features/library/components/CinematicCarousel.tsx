import React, { useState, useEffect, useCallback } from 'react';
import { Button, GlassCard } from '../../../shared/components/ui';
import { motion, AnimatePresence } from 'framer-motion';

import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { PortfolioItem } from '../../../shared/types';

interface CinematicCarouselProps {
  items: PortfolioItem[];
  initialIndex: number;
  onClose: () => void;
  onItemClick?: (item: PortfolioItem) => void;
}

export const CinematicCarousel: React.FC<CinematicCarouselProps> = ({
  items,
  initialIndex,
  onClose,
}) => {
  if (!items || items.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showInfo, setShowInfo] = useState(false);

  // Circular navigation
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'Escape') onClose();
      if (e.key === 'i' || e.key === 'I') setShowInfo((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onClose]);

  // Virtualization: Only render 7 images (current ± 3)
  const getVisibleIndices = () => {
    const visible = [];
    for (let i = -3; i <= 3; i++) {
      const index = (currentIndex + i + items.length) % items.length;
      visible.push({ index, offset: i });
    }
    return visible;
  };

  const visibleItems = getVisibleIndices();

  // Calculate 3D position with smooth transitions
  const getImageStyle = (offset: number) => {
    const translateX = offset * 500;
    const translateZ = offset === 0 ? 250 : -Math.abs(offset) * 200;
    const rotateY = offset * -25;
    const scale = offset === 0 ? 1.1 : Math.max(0.6, 0.9 - Math.abs(offset) * 0.1);
    const opacity = offset === 0 ? 1 : Math.max(0.5, 0.85 - Math.abs(offset) * 0.15);
    const zIndex = 100 - Math.abs(offset) * 10;

    return {
      translateX,
      translateZ,
      rotateY,
      scale,
      opacity,
      zIndex,
    };
  };

  const currentItem = items[currentIndex];

  return (
    <GlassCard variant="overlay" className="fixed inset-0 z-(--z-modal)">
      {/* Close button - HIGHEST z-index */}
      <Button
        onClick={onClose}
        className="absolute top-6 right-6 z-300 p-3 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all hover:scale-110 shadow-lg"
        title="Close (Esc)"
      >
        <X size={24} />
      </Button>

      {/* Info toggle - HIGHEST z-index */}
      <Button
        onClick={() => setShowInfo(!showInfo)}
        className={`absolute top-6 left-6 z-300 p-3 rounded-full border transition-all hover:scale-110 shadow-lg ${
          showInfo
            ? 'bg-blue-500/30 border-blue-400/50 text-blue-200'
            : 'bg-white/20 hover:bg-white/30 border-white/30 text-white'
        }`}
        title="Toggle Info (I)"
      >
        <Info size={24} />
      </Button>

      {/* Navigation arrows - HIGH z-index */}
      <Button
        onClick={goToPrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-250 p-4 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all hover:scale-110 shadow-lg"
        title="Previous (←)"
      >
        <ChevronLeft size={32} />
      </Button>

      <Button
        onClick={goToNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-250 p-4 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all hover:scale-110 shadow-lg"
        title="Next (→)"
      >
        <ChevronRight size={32} />
      </Button>

      {/* 3D Carousel Container */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-visible"
        style={{
          perspective: '1500px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {visibleItems.map(({ index, offset }) => {
            const item = items[index];
            if (!item) return null;
            const style = getImageStyle(offset);
            const isCurrent = offset === 0;

            return (
              <motion.div
                key={`${item.id}-${offset}`}
                className={`absolute ${isCurrent ? 'cursor-default' : 'cursor-pointer'}`}
                style={{
                  zIndex: style.zIndex,
                  transformStyle: 'preserve-3d',
                }}
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  x: 0,
                  z: 0,
                  rotateY: 0,
                }}
                animate={{
                  opacity: style.opacity,
                  scale: style.scale,
                  x: style.translateX,
                  z: style.translateZ,
                  rotateY: style.rotateY,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 20,
                  mass: 0.8,
                }}
                onClick={() => {
                  if (!isCurrent) {
                    setCurrentIndex(index);
                  }
                }}
                whileHover={!isCurrent ? { scale: style.scale * 1.05 } : {}}
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="max-w-[450px] max-h-[600px] object-contain rounded-xl shadow-2xl select-none"
                  style={{
                    filter: isCurrent
                      ? 'brightness(1) contrast(1.05)'
                      : 'brightness(0.65) contrast(0.95)',
                    transition: 'filter 0.3s ease',
                  }}
                  draggable={false}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Metadata overlay */}
      <AnimatePresence>
        {showInfo && currentItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-2xl w-full px-6"
          >
            <GlassCard variant="base" padding="lg" className="rounded-2xl space-y-3">
              <h3 className="text-xl font-semibold text-white">{currentItem.name}</h3>
              {currentItem.aiDescription && (
                <p className="text-gray-300 text-sm">{currentItem.aiDescription}</p>
              )}
              {currentItem.aiTags && currentItem.aiTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentItem.aiTags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-400">
                {currentIndex + 1} / {items.length}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
        {items.slice(0, Math.min(items.length, 20)).map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all ${
              idx === currentIndex % 20 ? 'w-8 bg-white' : 'w-1 bg-white/30'
            }`}
          />
        ))}
      </div>
    </GlassCard>
  );
};
