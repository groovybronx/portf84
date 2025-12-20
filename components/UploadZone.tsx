import React, { useRef, useEffect } from 'react';
import { FolderOpen, UploadCloud, Image as ImageIcon, History, FolderInput, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadZoneProps {
  onFilesSelected: (files: FileList) => void;
  onDirectoryPicker: () => void;
  onSetRoot: () => void;
  hasStoredSession: boolean;
  onRestoreSession: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ 
    onFilesSelected, 
    onDirectoryPicker, 
    onSetRoot,
    hasStoredSession, 
    onRestoreSession 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        className="z-10 text-center space-y-6 max-w-2xl px-6"
      >
        <div className="space-y-2">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tighter">
            Lumina Portfolio
            </h1>
            <p className="text-xl text-gray-400 font-light">
            Experience your local photography in a new dimension.
            </p>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
            {/* Main Action Card */}
            <motion.div
                whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                className="group relative border-2 border-dashed border-gray-700 bg-surface/50 backdrop-blur-md rounded-3xl p-12 cursor-pointer transition-all duration-300 hover:bg-surface/80 hover:shadow-2xl hover:shadow-blue-900/20 w-full"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleMainClick}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    {...({ webkitdirectory: "", directory: "" } as any)}
                    onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
                />
                
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                        <FolderOpen className="w-16 h-16 text-blue-400 relative z-10" strokeWidth={1} />
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-semibold text-white">
                            {supportsFileSystem ? 'Open Collection' : 'Select a Folder'}
                        </h3>
                        <p className="text-gray-400 text-sm">
                            {supportsFileSystem ? 'Select a specific album to view' : 'or drag and drop your collection here'}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {/* Root Permission Linker */}
                {supportsFileSystem && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSetRoot(); }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-300 transition-all text-gray-400 text-sm text-left group"
                    >
                        <ShieldCheck size={20} className="text-green-500/50 group-hover:text-green-400" />
                        <div className="flex-1">
                            <p className="font-medium text-gray-300 group-hover:text-green-300">Link Root Folder</p>
                            <p className="text-[10px] opacity-60">Authorize parent folder once to avoid future popups.</p>
                        </div>
                    </button>
                )}

                {/* Restore Session */}
                {hasStoredSession && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={onRestoreSession}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-300 transition-all text-gray-400 text-sm text-left group"
                    >
                        <History size={20} className="text-blue-500/50 group-hover:text-blue-400" />
                        <div className="flex-1">
                            <p className="font-medium text-gray-300 group-hover:text-blue-300">Restore Session</p>
                            <p className="text-[10px] opacity-60">Resume working on your last collection.</p>
                        </div>
                    </motion.button>
                )}
            </div>

            {/* Legacy Fallback */}
            {!supportsFileSystem && (
                <button 
                    onClick={handleLegacyClick}
                    className="text-xs text-gray-500 hover:text-white underline decoration-gray-700 underline-offset-4 transition-colors flex items-center gap-1"
                >
                    <FolderInput size={12} />
                    Legacy Upload
                </button>
            )}
        </div>
        
        <div className="flex justify-center gap-8 text-xs text-gray-600 font-mono pt-4">
            <span className="flex items-center gap-2"><UploadCloud size={12}/> Local Processing</span>
            <span className="flex items-center gap-2"><ImageIcon size={12}/> Auto-Grid Layout</span>
        </div>
      </motion.div>
    </div>
  );
};