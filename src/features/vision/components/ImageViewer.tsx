import React, { useState, useEffect } from 'react';
import { Button, GlassCard, Stack, Flex, Grid } from '../../../shared/components/ui';
import { PortfolioItem } from '../../../shared/types';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Loader,
  Tag,
  Share2,
  Download,
  Info,
  Calendar,
  Maximize2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Palette,
} from 'lucide-react';
import { useVision } from '../hooks/useVision';

import { logger } from '../../../shared/utils/logger';
interface ImageViewerProps {
  item: PortfolioItem;
  onClose: () => void;
  onUpdateItem: (item: PortfolioItem) => void;
  onNext: () => void;
  onPrev: () => void;
  showColorTags?: boolean;
  availableTags: string[];
  allItems?: PortfolioItem[]; // For smart tag suggestions
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  item,
  onClose,
  onUpdateItem,
  onNext,
  onPrev,
  showColorTags = false,
  availableTags,
  allItems = [],
}) => {
  const { analyzing, thinkingText, error, analyze, reset } = useVision(onUpdateItem);
  const [deepAnalysis, setDeepAnalysis] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(item.width && item.height ? { width: item.width, height: item.height } : null);

  // Reset local state when the item changes (navigation)
  useEffect(() => {
    reset();
    setShowMetadata(false);
    setDimensions(item.width && item.height ? { width: item.width, height: item.height } : null);
  }, [item]);

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'Escape' || e.key === ' ') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose]);

  const handleAnalyze = () => {
    analyze(item, deepAnalysis);
  };

  const handleShare = async () => {
    if (!navigator.share) {
      alert('Web Share API not supported on this device/browser.');
      return;
    }

    if (!item.file) {
      alert('Cannot share: File object not available.');
      return;
    }

    try {
      await navigator.share({
        title: item.name,
        text: item.aiDescription || `Check out ${item.name}`,
        files: [item.file],
      });
    } catch (error) {
      logger.error('Error sharing:', error);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const newDims = { width: img.naturalWidth, height: img.naturalHeight };
    setDimensions(newDims);

    // Update item if dimensions were missing
    if (!item.width || !item.height) {
      onUpdateItem({
        ...item,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
  };

  return (
    <GlassCard
      variant="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-(--z-image-viewer) flex"
    >
      {/* Main Image Area */}
      <div
        className="flex-1 relative flex items-center justify-center p-4 sm:p-12 group/nav min-w-0 overflow-hidden"
        onClick={onClose}
      >
        {/* Navigation Buttons (visible on hover or focus) */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 p-4 rounded-full bg-glass-bg text-white/50 hover:text-white transition-all z-(--z-carousel) hidden sm:flex border border-glass-border"
        >
          <ChevronLeft size={32} />
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 p-4 rounded-full bg-glass-bg text-white/50 hover:text-white transition-all z-(--z-carousel) hidden sm:flex border border-glass-border"
        >
          <ChevronRight size={32} />
        </Button>

        <div className="relative z-(--z-grid-item) w-full h-full flex items-center justify-center">
          <motion.img
            key={item.id} // Ensure framer motion detects the image change for animation
            layoutId={`card-${item.id}`}
            src={item.url}
            alt={item.name}
            className="w-auto h-auto max-w-full max-h-[calc(100vh-6rem)] object-contain shadow-2xl rounded-sm"
            onClick={(e) => e.stopPropagation()}
            onLoad={handleImageLoad}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={
              showColorTags && item.colorTag ? { borderBottom: `4px solid ${item.colorTag}` } : {}
            }
          />
          {showColorTags && item.colorTag && (
            <div
              className="absolute top-4 left-4 w-4 h-4 rounded-full shadow-md border border-glass-border"
              style={{ backgroundColor: item.colorTag }}
            />
          )}
        </div>

        <Button
          onClick={onClose}
          className="absolute top-6 left-6 p-3 bg-glass-bg hover:bg-glass-bg-active rounded-full text-white transition-colors z-(--z-carousel) border border-glass-border"
        >
          <X size={24} />
        </Button>
      </div>

      {/* Sidebar / Info Panel */}
      <GlassCard
        variant="base"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-[350px] sm:w-[400px] h-full border-l border-glass-border p-8 flex flex-col gap-6 shadow-2xl overflow-y-auto z-(--z-drawer)"
        onClick={(e) => e.stopPropagation()}
      >
        <Flex align="start" justify="between" className="w-full">
          <div className="overflow-hidden">
            <h2 className="text-2xl font-bold text-white mb-2 wrap-break-word truncate">
              {item.name}
            </h2>
            <Flex align="center" wrap="wrap" gap="md" className="text-sm text-gray-500 font-mono">
              <Flex align="center" gap="xs">
                <Info size={14} /> {(item.size / 1024 / 1024).toFixed(2)} MB
              </Flex>
              <span>|</span>
              <span className="uppercase">{item.type.split('/')[1]}</span>
            </Flex>
          </div>

          {/* Metadata Toggle Button */}
          <Button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`p-2 rounded-lg transition-colors ${
              showMetadata
                ? 'bg-blue-600 text-white'
                : 'bg-glass-bg-accent text-gray-400 hover:text-white border border-glass-border-light'
            }`}
            title="Toggle Technical Metadata"
          >
            <FileText size={20} />
          </Button>
        </Flex>

        <div className="h-px bg-glass-border/10" />

        <AnimatePresence mode="wait">
          {showMetadata ? (
            <div key="metadata" className="p-4 text-sm text-gray-500 italic">
              Metadata view coming soon
            </div>
          ) : (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Color Tag Info Section - CLICKABLE */}
              <div className="p-4 bg-glass-bg-accent rounded-lg border border-glass-border-light">
                <Flex align="center" justify="between" className="mb-2">
                  <Flex align="center" gap="sm" className="text-xs uppercase text-gray-500">
                    <Palette size={12} /> Color Label
                  </Flex>
                  <span className="text-xs text-gray-500 font-mono">Keys 1-6</span>
                </Flex>
                <Flex gap="sm">
                  {/* Clickable visual guide for colors */}
                  {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'].map(
                    (c, i) => (
                      <Button
                        key={c}
                        onClick={() =>
                          onUpdateItem({
                            ...item,
                            colorTag: item.colorTag === c ? undefined : c,
                          })
                        }
                        className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                          item.colorTag === c
                            ? 'border-white scale-110 ring-2 ring-white/20'
                            : 'border-transparent opacity-30 hover:opacity-80'
                        }`}
                        style={{ backgroundColor: c }}
                        title={`Tag with color ${i + 1}`}
                      />
                    )
                  )}
                  <Flex align="center" justify="center">
                    <Button
                      onClick={() => onUpdateItem({ ...item, colorTag: undefined })}
                      className={`w-6 h-6 rounded-full border border-white/20 text-xs text-gray-500 hover:text-white hover:border-white ${
                        !item.colorTag ? 'opacity-100 cursor-default' : 'opacity-50'
                      }`}
                      title="Remove Tag"
                      variant="ghost"
                      size="sm"
                    >
                      <X size={12} />
                    </Button>
                  </Flex>
                </Flex>
              </div>

              {/* Basic Metadata Grid */}
              <Grid
                cols={2}
                gap="md"
                className="p-4 bg-glass-bg-accent rounded-lg border border-glass-border-light"
              >
                <Stack spacing="xs">
                  <Flex align="center" gap="sm" className="text-xs uppercase text-gray-500">
                    <Maximize2 size={12} /> Dimensions
                  </Flex>
                  <span className="text-white font-mono text-sm">
                    {dimensions ? `${dimensions.width} x ${dimensions.height}` : '...'}
                  </span>
                </Stack>
                <Stack spacing="xs">
                  <Flex align="center" gap="sm" className="text-xs uppercase text-gray-500">
                    <Calendar size={12} /> Modified
                  </Flex>
                  <span className="text-white font-mono text-sm">
                    {new Date(item.lastModified).toLocaleDateString()}
                  </span>
                </Stack>
              </Grid>

              {/* AI Section */}
              <Stack spacing="md">
                <Flex align="center" justify="between">
                  <Flex align="center" gap="sm" className="text-lg font-semibold text-blue-400">
                    <Sparkles size={18} /> AI Analysis
                  </Flex>
                </Flex>

                <Stack spacing="md">
                  {!item.aiDescription && !analyzing ? (
                    <>
                      <Button
                        onClick={handleAnalyze}
                        className="w-full py-3 rounded-lg bg-linear-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-medium shadow-lg shadow-blue-900/50 transition-all flex items-center justify-center gap-2 group"
                      >
                        <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                        Generate Description
                      </Button>
                      <Flex align="center" gap="sm" justify="center" className="mt-2">
                        <input
                          type="checkbox"
                          id="deepMode"
                          checked={deepAnalysis}
                          onChange={(e) => setDeepAnalysis(e.target.checked)}
                          className="rounded border-glass-border bg-glass-bg-accent text-blue-500 focus:ring-blue-500/50"
                        />
                        <label
                          htmlFor="deepMode"
                          className="text-xs text-gray-400 cursor-pointer hover:text-white transition-colors"
                        >
                          Detailed Reasoning (Tokens++)
                        </label>
                      </Flex>
                    </>
                  ) : analyzing ? (
                    <Stack spacing="sm">
                      <Flex
                        align="center"
                        gap="md"
                        className="text-gray-400 animate-pulse bg-glass-bg-accent p-4 rounded-lg border border-glass-border-light"
                      >
                        <Loader size={18} className="animate-spin" />
                        <span>{thinkingText ? 'Reasoning...' : 'Analyzing image context...'}</span>
                      </Flex>
                      {thinkingText && (
                        <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-xs font-mono text-purple-300 max-h-40 overflow-y-auto custom-scrollbar">
                          <p className="font-bold mb-1 uppercase tracking-wider text-[10px] text-purple-400">
                            Thinking Process:
                          </p>
                          <p className="whitespace-pre-wrap">{thinkingText}</p>
                        </div>
                      )}
                    </Stack>
                  ) : (
                    <Stack spacing="md">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-glass-bg-accent rounded-lg border border-glass-border-light"
                      >
                        <p className="text-gray-300 italic leading-relaxed text-sm">
                          "{item.aiDescription}"
                        </p>
                      </motion.div>

                      <Stack spacing="sm">
                        <h4 className="text-xs uppercase text-gray-500 font-semibold mb-2">
                          Detected Tags
                        </h4>
                        {item.aiTagsDetailed ? (
                          <Stack spacing="sm">
                            {item.aiTagsDetailed.map((tag, i) => (
                              <motion.div
                                key={tag.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                <Flex align="center" gap="md" className="text-sm">
                                  <Flex justify="between" className="flex-1">
                                    <span className="text-gray-300">{tag.name}</span>
                                    <span className="text-gray-500 text-xs font-mono">
                                      {(tag.confidence * 100).toFixed(0)}%
                                    </span>
                                  </Flex>
                                  <div className="w-16 h-1.5 bg-glass-bg-accent rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${tag.confidence * 100}%`,
                                      }}
                                      transition={{
                                        duration: 1,
                                        delay: 0.5 + i * 0.1,
                                      }}
                                      className="h-full bg-blue-500 rounded-full"
                                    />
                                  </div>
                                </Flex>
                              </motion.div>
                            ))}
                          </Stack>
                        ) : (
                          <Flex wrap="wrap" gap="sm">
                            {item.aiTags?.map((tag, i) => (
                              <motion.span
                                key={tag}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium"
                              >
                                <Tag size={10} /> {tag}
                              </motion.span>
                            ))}
                          </Flex>
                        )}
                      </Stack>
                    </Stack>
                  )}
                  {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                </Stack>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        <Grid cols={2} gap="sm">
          <Button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-glass-bg-accent hover:bg-glass-bg-active text-white border border-glass-border-light transition-colors"
          >
            <Share2 size={18} /> Share
          </Button>
          <a
            href={item.url}
            download={item.name}
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-glass-bg-accent hover:bg-glass-bg-active text-white border border-glass-border-light transition-colors"
          >
            <Download size={18} /> Save
          </a>
        </Grid>
      </GlassCard>
    </GlassCard>
  );
};
