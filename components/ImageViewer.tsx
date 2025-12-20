import React, { useState, useEffect } from 'react';
import { PortfolioItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader, Tag, Share2, Download, Info, Calendar, Maximize2, FileText, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import { ImageMetadataView } from './ImageMetadataView';
import { TagManager } from "./TagManager";

interface ImageViewerProps {
  item: PortfolioItem;
  onClose: () => void;
  onUpdateItem: (item: PortfolioItem) => void;
  onNext: () => void;
  onPrev: () => void;
  showColorTags?: boolean;
  availableTags: string[];
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  item,
  onClose,
  onUpdateItem,
  onNext,
  onPrev,
  showColorTags = false,
  availableTags,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(
    item.width && item.height
      ? { width: item.width, height: item.height }
      : null
  );

  // Reset local state when the item changes (navigation)
  useEffect(() => {
    setAnalyzing(false);
    setError(null);
    setDimensions(
      item.width && item.height
        ? { width: item.width, height: item.height }
        : null
    );
  }, [item]);

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        onNext();
      } else if (e.key === "ArrowLeft") {
        onPrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrev, onClose]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeImage(item);
      onUpdateItem({
        ...item,
        aiDescription: result.description,
        aiTags: result.tags,
        aiTagsDetailed: result.tagsDetailed,
      });
    } catch (e) {
      console.error(e);
      setError("AI Analysis unavailable. Check API Key.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: item.aiDescription || `Check out ${item.name}`,
          files: [item.file],
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      alert("Web Share API not supported on this device/browser.");
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[var(--z-image-viewer)] flex glass-surface-lg"
    >
      {/* Main Image Area */}
      <div
        className="flex-1 relative flex items-center justify-center p-4 sm:p-12 group/nav min-w-0 overflow-hidden"
        onClick={onClose}
      >
        {/* Navigation Buttons (visible on hover or focus) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 p-4 rounded-full bg-glass-bg text-white/50 hover:text-white transition-all z-[var(--z-carousel)] hidden sm:flex border border-glass-border"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 p-4 rounded-full bg-glass-bg text-white/50 hover:text-white transition-all z-[var(--z-carousel)] hidden sm:flex border border-glass-border"
        >
          <ChevronRight size={32} />
        </button>

        <div className="relative z-[var(--z-grid-item)] w-full h-full flex items-center justify-center">
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
              showColorTags && item.colorTag
                ? { borderBottom: `4px solid ${item.colorTag}` }
                : {}
            }
          />
          {showColorTags && item.colorTag && (
            <div
              className="absolute top-4 left-4 w-4 h-4 rounded-full shadow-md border border-glass-border"
              style={{ backgroundColor: item.colorTag }}
            />
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-3 bg-glass-bg hover:bg-glass-bg-active rounded-full text-white transition-colors z-[var(--z-carousel)] border border-glass-border"
        >
          <X size={24} />
        </button>
      </div>

      {/* Sidebar / Info Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-[350px] sm:w-[400px] h-full glass-surface border-l border-glass-border p-8 flex flex-col gap-6 shadow-2xl overflow-y-auto z-[var(--z-drawer)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="overflow-hidden">
            <h2 className="text-2xl font-bold text-white mb-2 break-words truncate">
              {item.name}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-mono items-center">
              <span className="flex items-center gap-1">
                <Info size={14} /> {(item.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <span>|</span>
              <span className="uppercase">{item.type.split("/")[1]}</span>
            </div>
          </div>

          {/* Metadata Toggle Button */}
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`p-2 rounded-lg transition-colors ${
              showMetadata
                ? "bg-blue-600 text-white"
                : "bg-glass-bg-accent text-gray-400 hover:text-white border border-glass-border-light"
            }`}
            title="Toggle Technical Metadata"
          >
            <FileText size={20} />
          </button>
        </div>

        <div className="h-px bg-glass-border/10" />

        <AnimatePresence mode="wait">
          {showMetadata ? (
            <ImageMetadataView
              key="metadata"
              item={item}
              onBack={() => setShowMetadata(false)}
              onUpdateItem={onUpdateItem}
            />
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
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-xs uppercase text-gray-500">
                    <Palette size={12} /> Color Label
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    Keys 1-6
                  </span>
                </div>
                <div className="flex gap-2">
                  {/* Clickable visual guide for colors */}
                  {[
                    "#ef4444",
                    "#f97316",
                    "#eab308",
                    "#22c55e",
                    "#3b82f6",
                    "#a855f7",
                  ].map((c, i) => (
                    <button
                      key={c}
                      onClick={() =>
                        onUpdateItem({
                          ...item,
                          colorTag: item.colorTag === c ? undefined : c,
                        })
                      }
                      className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                        item.colorTag === c
                          ? "border-white scale-110 ring-2 ring-white/20"
                          : "border-transparent opacity-30 hover:opacity-80"
                      }`}
                      style={{ backgroundColor: c }}
                      title={`Tag with color ${i + 1}`}
                    />
                  ))}
                  <button
                    onClick={() =>
                      onUpdateItem({ ...item, colorTag: undefined })
                    }
                    className={`w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-xs text-gray-500 hover:text-white hover:border-white ${
                      !item.colorTag
                        ? "opacity-100 cursor-default"
                        : "opacity-50"
                    }`}
                    title="Remove Tag"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Basic Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-glass-bg-accent rounded-lg border border-glass-border-light">
                <div>
                  <span className="flex items-center gap-2 text-xs uppercase text-gray-500 mb-1">
                    <Maximize2 size={12} /> Dimensions
                  </span>
                  <span className="text-white font-mono text-sm">
                    {dimensions
                      ? `${dimensions.width} x ${dimensions.height}`
                      : "..."}
                  </span>
                </div>
                <div>
                  <span className="flex items-center gap-2 text-xs uppercase text-gray-500 mb-1">
                    <Calendar size={12} /> Modified
                  </span>
                  <span className="text-white font-mono text-sm">
                    {new Date(item.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* AI Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                    <Sparkles size={18} /> AI Analysis
                  </h3>
                </div>

                {!item.aiDescription && !analyzing ? (
                  <button
                    onClick={handleAnalyze}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-medium shadow-lg shadow-blue-900/50 transition-all flex items-center justify-center gap-2 group"
                  >
                    <Sparkles
                      size={16}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    Generate Description
                  </button>
                ) : analyzing ? (
                  <div className="flex items-center gap-3 text-gray-400 animate-pulse bg-glass-bg-accent p-4 rounded-lg border border-glass-border-light">
                    <Loader size={18} className="animate-spin" />
                    <span>Analyzing image context...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-glass-bg-accent rounded-lg border border-glass-border-light"
                    >
                      <p className="text-gray-300 italic leading-relaxed text-sm">
                        "{item.aiDescription}"
                      </p>
                    </motion.div>

                    <div className="space-y-2">
                      <h4 className="text-xs uppercase text-gray-500 font-semibold mb-2">
                        Detected Tags
                      </h4>
                      {item.aiTagsDetailed ? (
                        <div className="grid gap-2">
                          {item.aiTagsDetailed.map((tag, i) => (
                            <motion.div
                              key={tag.name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-3 text-sm"
                            >
                              <div className="flex-1 flex justify-between">
                                <span className="text-gray-300">
                                  {tag.name}
                                </span>
                                <span className="text-gray-500 text-xs font-mono">
                                  {(tag.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
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
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {item.aiTags?.map((tag, i) => (
                            <motion.span
                              key={tag}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium flex items-center gap-1"
                            >
                              <Tag size={10} /> {tag}
                            </motion.span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
              </div>

              {/* Tag Manager (Relocated Phase 7) */}
              <TagManager
                item={item}
                onUpdateItem={onUpdateItem}
                availableTags={availableTags}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-glass-bg-accent hover:bg-glass-bg-active text-white border border-glass-border-light transition-colors"
          >
            <Share2 size={18} /> Share
          </button>
          <a
            href={item.url}
            download={item.name}
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-glass-bg-accent hover:bg-glass-bg-active text-white border border-glass-border-light transition-colors"
          >
            <Download size={18} /> Save
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};