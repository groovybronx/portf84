import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, FolderInput, X, Folder as FolderIcon, Plus, ArrowLeft } from 'lucide-react';
import { Folder } from '../../../shared/types';

interface ModalOverlayProps {
  children: React.ReactNode;
  onClose: () => void;
}

const ModalOverlay: React.FC<ModalOverlayProps> = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-(--z-modal-overlay) flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="glass-surface rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  </motion.div>
);

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
      setName("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay onClose={onClose}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderPlus className="text-blue-400" /> New Collection
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Collection Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Best of 2024"
              className="w-full bg-glass-bg-accent border border-glass-border-light rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-glass-bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30 transition-all"
            >
              Create
            </button>
          </div>
        </form>
      </ModalOverlay>
    </AnimatePresence>
  );
};

interface MoveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onMove: (targetFolderId: string) => void;
  onCreateAndMove: (name: string) => void;
  selectedCount: number;
}

export const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({
  isOpen,
  onClose,
  folders,
  onMove,
  onCreateAndMove,
  selectedCount,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsCreating(false);
      setNewFolderName("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateAndMove(newFolderName.trim());
    }
  };

  return (
    <AnimatePresence>
      <ModalOverlay onClose={onClose}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderInput className="text-blue-400" />
            {isCreating ? "New Collection & Move" : "Move Items"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          {isCreating
            ? `Create a new collection to hold the ${selectedCount} selected item${
                selectedCount > 1 ? "s" : ""
              }.`
            : `Select a destination for the ${selectedCount} selected photo${
                selectedCount > 1 ? "s" : ""
              }.`}
        </p>

        {isCreating ? (
          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Collection Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Vacation 2024"
                  className="w-full bg-glass-bg-accent border border-glass-border-light rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-glass-bg-accent transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30 transition-all"
                >
                  Create & Move
                </button>
              </div>
            </motion.div>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar pr-2 -mr-2"
          >
            {/* Create New Option */}
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center gap-4 p-3 rounded-xl border border-dashed border-glass-border/20 hover:border-blue-500/50 hover:bg-blue-500/10 text-gray-300 hover:text-white transition-all group text-left mb-2"
            >
              <div className="w-10 h-10 rounded-lg bg-glass-bg-accent flex items-center justify-center text-gray-400 group-hover:text-blue-400 transition-colors">
                <Plus size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium">Create New Collection</p>
                <p className="text-xs text-gray-500">
                  Add folder and move items
                </p>
              </div>
            </button>

            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  onMove(folder.id);
                  onClose();
                }}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-glass-bg-accent transition-colors group text-left border border-transparent hover:border-glass-border-light"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <FolderIcon size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{folder.name}</p>
                  <p className="text-xs text-gray-500">
                    {folder.items.length} items
                  </p>
                </div>
              </button>
            ))}

            {folders.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No existing folders.
              </div>
            )}
          </motion.div>
        )}
      </ModalOverlay>
    </AnimatePresence>
  );
};
