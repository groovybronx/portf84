import React, { useRef, useEffect } from 'react';
import { FolderOpen, UploadCloud, Image as ImageIcon, History, FolderInput } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadZoneProps {
  onFilesSelected: (files: FileList) => void;
  onDirectoryPicker: () => void;
  hasStoredSession: boolean;
  onRestoreSession: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ 
    onFilesSelected, 
    onDirectoryPicker, 
    hasStoredSession, 
    onRestoreSession 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React sometimes strips non-standard attributes like webkitdirectory.
  // We force them here to ensure folder selection works in all browsers (Firefox, Safari, etc.)
  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('webkitdirectory', '');
      fileInputRef.current.setAttribute('directory', '');
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  // Feature detection for File System Access API
  const supportsFileSystem = 'showDirectoryPicker' in window;

  const handleMainClick = () => {
      if (supportsFileSystem) {
          onDirectoryPicker();
      } else {
          fileInputRef.current?.click();
      }
  };

  const handleLegacyClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <motion.div 
            animate={{ x: [0, 100, 0], y: [0, -50, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 rounded-full blur-[100px]"
         />
         <motion.div 
            animate={{ x: [0, -100, 0], y: [0, 50, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/20 rounded-full blur-[100px]"
         />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 text-center space-y-8 max-w-2xl px-6"
      >
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tighter mb-4">
          Lumina Portfolio
        </h1>
        <p className="text-xl text-gray-400 font-light">
          Experience your local photography in a new dimension.
        </p>

        <div className="flex flex-col items-center gap-4">
            <motion.div
                whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                className="group relative border-2 border-dashed border-gray-700 bg-surface/50 backdrop-blur-md rounded-3xl p-16 cursor-pointer transition-all duration-300 hover:bg-surface/80 hover:shadow-2xl hover:shadow-blue-900/20 w-full"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleMainClick}
            >
                {/* 
                    Note: We use standard attributes here, but the useEffect above 
                    guarantees they are present on the DOM element 
                */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    {...({ webkitdirectory: "", directory: "" } as any)}
                    onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
                />
                
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                    <FolderOpen className="w-20 h-20 text-blue-400 relative z-10" strokeWidth={1} />
                    </div>
                    
                    <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-white">
                        {supportsFileSystem ? 'Open Collection' : 'Select a Folder'}
                    </h3>
                    <p className="text-gray-400">
                        {supportsFileSystem ? 'Select a directory to persist your work' : 'or drag and drop your collection here'}
                    </p>
                    </div>
                </div>
            </motion.div>
            
            {/* Fallback link for browsers where FS API might glitch or user prefers standard dialog */}
            <button 
                onClick={handleLegacyClick}
                className="text-xs text-gray-500 hover:text-white underline decoration-gray-700 underline-offset-4 transition-colors flex items-center gap-1"
            >
                <FolderInput size={12} />
                Problem selecting? Use standard selector
            </button>

            {/* Restore Session Button */}
            <AnimatePresence>
                {hasStoredSession && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={onRestoreSession}
                        className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all group w-full justify-center"
                    >
                        <History className="text-blue-400" size={20} />
                        <div className="text-left">
                            <p className="text-white font-medium">Restore Previous Session</p>
                            <p className="text-xs text-gray-500">Resume working on your last collection</p>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
        
        <div className="flex justify-center gap-8 text-sm text-gray-500 font-mono">
            <span className="flex items-center gap-2"><UploadCloud size={14}/> Local Processing</span>
            <span className="flex items-center gap-2"><ImageIcon size={14}/> Auto-Grid Layout</span>
        </div>
      </motion.div>
    </div>
  );
};