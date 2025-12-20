import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, X, Trash2, Layers, Image as ImageIcon, UploadCloud, FolderPlus, CheckCircle2, Circle, FolderHeart, HardDrive } from 'lucide-react';
import { Folder as FolderType } from '../types';

interface FolderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  folders: FolderType[];
  activeFolderId: Set<string>; 
  onSelectFolder: (id: string) => void;
  onImportFolder: () => void;
  onCreateFolder: () => void;
  onDeleteFolder: (id: string) => void;
}

export const FolderDrawer: React.FC<FolderDrawerProps> = ({
  isOpen,
  onClose,
  folders,
  activeFolderId,
  onSelectFolder,
  onImportFolder,
  onCreateFolder,
  onDeleteFolder
}) => {
  const totalItems = folders.reduce((acc, f) => acc + f.items.length, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-surface/95 backdrop-blur-2xl border-r border-white/10 z-50 p-6 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="text-blue-500" /> Library
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              
              {/* All Photos Option */}
              <button
                onClick={() => onSelectFolder('all')}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group border ${
                  activeFolderId.has('all')
                    ? 'bg-blue-600/10 border-blue-500/50 text-white shadow-lg shadow-blue-900/10' 
                    : 'hover:bg-white/5 border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${activeFolderId.has('all') ? 'bg-blue-600 text-white' : 'bg-white/5 group-hover:bg-white/10'}`}>
                    <ImageIcon size={20} />
                </div>
                <div className="flex-1 text-left">
                    <p className="font-medium text-sm">All Photos</p>
                    <p className="text-xs opacity-60">{totalItems} items</p>
                </div>
                {/* Visual Indicator */}
                {activeFolderId.has('all') ? (
                    <CheckCircle2 size={18} className="text-blue-500" />
                ) : (
                    <Circle size={18} className="text-gray-600 group-hover:text-gray-400" />
                )}
              </button>

              <div className="h-px bg-white/10 my-4" />
              <p className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-2 px-2 flex justify-between items-center">
                  <span>Collections</span>
                  {activeFolderId.size > 1 && !activeFolderId.has('all') && (
                      <span className="text-blue-400 text-[10px] bg-blue-500/10 px-2 py-0.5 rounded-full">{activeFolderId.size} Selected</span>
                  )}
              </p>

              {/* Folder List */}
              {folders.map(folder => {
                  const isActive = activeFolderId.has(folder.id);
                  const isVirtual = folder.isVirtual;
                  
                  return (
                    <div 
                        key={folder.id} 
                        className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                            isActive
                                ? 'bg-white/10 text-white border-white/20' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'
                        }`}
                        onClick={() => onSelectFolder(folder.id)}
                    >
                        {/* Checkbox (Visual Selection) */}
                        <div className="flex-shrink-0" onClick={(e) => { e.stopPropagation(); onSelectFolder(folder.id); }}>
                             {isActive ? (
                                <CheckCircle2 size={18} className="text-blue-500" />
                            ) : (
                                <Circle size={18} className="text-gray-600 group-hover:text-gray-400" />
                            )}
                        </div>

                        {/* Folder Icon / Preview */}
                        <div className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10 ${isVirtual ? 'bg-purple-500/10' : 'bg-black'}`}>
                            {folder.items.length > 0 && !isVirtual ? (
                                <img src={folder.items[0].url} className="w-full h-full object-cover" alt="" />
                            ) : (
                                // Icon logic: Virtual gets a special folder icon, Physical gets HardDrive or normal folder
                                isVirtual ? (
                                    <FolderHeart size={20} className="text-purple-400" />
                                ) : (
                                    <HardDrive size={20} className="text-blue-400" />
                                )
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className={`font-medium text-sm truncate ${isActive ? 'text-white' : ''}`}>{folder.name}</p>
                                {isVirtual && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Virtual Collection"></span>}
                            </div>
                            <p className="text-xs opacity-60">{folder.items.length} items</p>
                        </div>

                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteFolder(folder.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                            title={isVirtual ? "Delete Collection" : "Remove Folder"}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  );
              })}

              {folders.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4 italic">No collections created yet.</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <button
                    onClick={onImportFolder}
                    className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                >
                    <UploadCloud size={16} /> Import from Disk
                </button>
                <button
                    onClick={onCreateFolder}
                    className="w-full py-3 bg-white/5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                >
                    <FolderPlus size={16} /> Create Collection
                </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};