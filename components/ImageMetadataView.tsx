import React, { useEffect, useState } from 'react';
import EXIF from 'exif-js';
import { PortfolioItem } from '../types';
import { motion } from 'framer-motion';
import {
  Camera,
  Aperture,
  Eye,
  Timer,
  Maximize,
  Cpu,
  HardDrive,
} from "lucide-react";

interface ImageMetadataViewProps {
  item: PortfolioItem;
  onBack: () => void;
  onUpdateItem?: (item: PortfolioItem) => void;
}

export const ImageMetadataView: React.FC<ImageMetadataViewProps> = ({
  item,
  onBack,
  onUpdateItem,
}) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // EXIF.getData modifies the object in place, but since we are using a File object which is immutable-ish in some contexts,
    // exif-js handles it by reading the ArrayBuffer.
    try {
      EXIF.getData(item.file as any, function (this: any) {
        const allTags = EXIF.getAllTags(this);
        setMetadata(allTags);
        setLoading(false);
      });
    } catch (e) {
      console.error("Error reading EXIF", e);
      setLoading(false);
    }
  }, [item.file]);

  const formatValue = (val: any) => {
    if (val === undefined || val === null) return "N/A";
    if (val instanceof Number) return val.toString();
    // Handle rational numbers (arrays of [numerator, denominator]) often returned by exif-js
    if (Array.isArray(val) && val.length === 2 && typeof val[0] === "number") {
      // check if it's strictly a rational fraction
      return val[1] !== 0 ? (val[0] / val[1]).toString() : val[0];
    }
    return val.toString();
  };

  const getExposureString = (time: any) => {
    if (!time) return "N/A";
    // Often returned as a number (0.0166) or rational object
    const val =
      typeof time === "number" ? time : time.numerator / time.denominator;
    if (val < 1) {
      return `1/${Math.round(1 / val)}`;
    }
    return `${val}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // Early return removed to allow tagging even without EXIF
  // if (!metadata || Object.keys(metadata).length === 0) { ... }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <HardDrive size={18} className="text-blue-400" /> Image Data
        </h3>
        <button
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-white"
        >
          Back to Overview
        </button>
      </div>

      <div className="space-y-4">
        {/* EXIF Data Sections - Only show if metadata exists */}
        {metadata && Object.keys(metadata).length > 0 ? (
          <>
            {/* Camera Gear */}
            <div className="bg-glass-bg-accent rounded-lg p-4 space-y-3 border border-glass-border-light">
              <div className="flex items-center gap-3">
                <Camera className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Camera</p>
                  <p className="text-sm font-medium text-white">
                    {formatValue(metadata.Make)} {formatValue(metadata.Model)}
                  </p>
                </div>
              </div>
              {metadata.LensModel && (
                <div className="flex items-center gap-3">
                  <Maximize className="text-gray-400" size={20} />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Lens</p>
                    <p className="text-sm font-medium text-white">
                      {formatValue(metadata.LensModel)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Exposure Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-glass-bg-accent p-3 rounded-lg border border-glass-border-light">
                <div className="flex items-center gap-2 mb-1">
                  <Aperture size={14} className="text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase">
                    Aperture
                  </span>
                </div>
                <p className="text-lg font-mono">
                  f/{formatValue(metadata.FNumber)}
                </p>
              </div>
              <div className="bg-glass-bg-accent p-3 rounded-lg border border-glass-border-light">
                <div className="flex items-center gap-2 mb-1">
                  <Timer size={14} className="text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase">
                    Shutter
                  </span>
                </div>
                <p className="text-lg font-mono">
                  {getExposureString(metadata.ExposureTime)}
                </p>
              </div>
              <div className="bg-glass-bg-accent p-3 rounded-lg border border-glass-border-light">
                <div className="flex items-center gap-2 mb-1">
                  <Eye size={14} className="text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase">ISO</span>
                </div>
                <p className="text-lg font-mono">
                  {formatValue(metadata.ISOSpeedRatings)}
                </p>
              </div>
              <div className="bg-glass-bg-accent p-3 rounded-lg border border-glass-border-light">
                <div className="flex items-center gap-2 mb-1">
                  <Maximize size={14} className="text-blue-400" />
                  <span className="text-xs text-gray-500 uppercase">Focal</span>
                </div>
                <p className="text-lg font-mono">
                  {formatValue(metadata.FocalLength)}mm
                </p>
              </div>
            </div>

            {/* Software / Date */}
            <div className="space-y-2">
              {metadata.Software && (
                <div className="flex justify-between items-center text-sm p-2 hover:bg-glass-bg-accent rounded">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Cpu size={14} /> Software
                  </span>
                  <span className="text-gray-300 truncate max-w-[150px]">
                    {metadata.Software}
                  </span>
                </div>
              )}
              {metadata.DateTimeOriginal && (
                <div className="flex justify-between items-center text-sm p-2 hover:bg-glass-bg-accent rounded">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Timer size={14} /> Captured
                  </span>
                  <span className="text-gray-300">
                    {metadata.DateTimeOriginal}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-gray-500 border border-glass-border-light rounded-lg border-dashed">
            <Camera size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">No EXIF data available</p>
          </div>
        )}

        {/* Raw Dump Toggle (optional, keeping it clean for now) */}
      </div>
    </motion.div>
  );
};