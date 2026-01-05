import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Folder, CheckCircle2, AlertCircle } from 'lucide-react';
import { Collection } from '../../../shared/types';
import { Button, GlassCard, Flex, Stack } from '../../../shared/components/ui';

interface CollectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  activeCollection: Collection | null;
  onCreateCollection: (name: string) => Promise<void>;
  onSwitchCollection: (id: string) => Promise<void>;
  onDeleteCollection: (id: string) => Promise<void>;
}

export const CollectionManager: React.FC<CollectionManagerProps> = ({
  isOpen,
  onClose,
  collections,
  activeCollection,
  onCreateCollection,
  onSwitchCollection,
  onDeleteCollection,
}) => {
  const { t } = useTranslation(['library', 'common']);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newCollectionName.trim()) return;

    try {
      await onCreateCollection(newCollectionName);
      setNewCollectionName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteCollection(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete collection:', error);
    }
  };

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
            className="fixed inset-0 bg-black/60 z-(--z-drawer-overlay) backdrop-blur-sm"
          />

          {/* Modal */}
          <GlassCard
            variant="overlay"
            padding="lg"
            border
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-(--z-modal) rounded-2xl shadow-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <Flex align="center" justify="between" className="mb-6">
                <Flex align="center" gap="sm">
                  <Folder className="text-primary" />
                  <h2 className="text-xl font-bold text-white">{t('library:myProjects')}</h2>
                </Flex>
                <Button variant="close" size="icon" onClick={onClose}>
                  <X size={20} />
                </Button>
              </Flex>

              {/* Collections List */}
              <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {collections.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8 italic">
                    {t('library:noProjectsCreated')}
                  </p>
                ) : (
                  collections.map((collection) => {
                    const isActive = activeCollection?.id === collection.id;
                    const isDeleting = deleteConfirm === collection.id;

                    return (
                      <motion.div
                        key={collection.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <Flex
                          align="center"
                          gap="sm"
                          className={`relative group p-3 rounded-xl cursor-pointer transition-all border ${
                            isActive
                              ? 'bg-primary/10 border-primary/50 text-white'
                              : 'hover:bg-glass-bg-accent border-transparent text-gray-400 hover:text-white'
                          }`}
                          onClick={() => !isActive && onSwitchCollection(collection.id)}
                        >
                          {/* Active Indicator */}
                          {isActive && <CheckCircle2 size={18} className="text-primary shrink-0" />}

                          {/* Collection Name */}
                          <Stack spacing="none" className="flex-1 min-w-0">
                            <p
                              className={`font-medium text-sm truncate ${
                                isActive ? 'text-white' : ''
                              }`}
                            >
                              {collection.name}
                            </p>
                            <p className="text-[10px] opacity-60 uppercase tracking-wider font-bold">
                              {new Date(collection.createdAt).toLocaleDateString()}
                            </p>
                          </Stack>

                          {/* Delete Button */}
                          {!isActive && (
                            <Button
                              variant="glass-icon"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(collection.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}

                          {/* Delete Confirmation */}
                          {isDeleting && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 bg-red-500/10 border border-red-500/50 rounded-xl overflow-hidden"
                            >
                              <Flex
                                align="center"
                                justify="center"
                                gap="xs"
                                className="w-full h-full px-3"
                              >
                                <AlertCircle size={16} className="text-red-400 shrink-0" />
                                <span className="text-xs text-red-400 font-medium whitespace-nowrap">
                                  {t('common:confirm')}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(collection.id);
                                  }}
                                  className="text-xs text-red-400 hover:text-red-300 underline h-auto py-0"
                                >
                                  {t('common:yes')}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm(null);
                                  }}
                                  className="text-xs text-gray-400 hover:text-white underline h-auto py-0"
                                >
                                  {t('common:no')}
                                </Button>
                              </Flex>
                            </motion.div>
                          )}
                        </Flex>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Create New Collection */}
              {isCreating ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Stack spacing="sm">
                      <input
                        type="text"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        placeholder={t('library:projectNamePlaceholder')}
                        className="w-full px-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                    <Flex gap="sm">
                      <Button
                        onClick={handleCreate}
                        disabled={!newCollectionName.trim()}
                        className="flex-1"
                      >
                        {t('common:create')}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsCreating(false);
                          setNewCollectionName('');
                        }}
                        className="flex-1"
                      >
                        {t('common:cancel')}
                      </Button>
                    </Flex>
                  </Stack>
                </motion.div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setIsCreating(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-700 hover:border-primary text-gray-400 hover:text-primary transition-all active:scale-[0.98]"
                >
                  <Flex align="center" justify="center" gap="sm">
                    <Plus size={18} />
                    <span className="font-medium">{t('library:newProject')}</span>
                  </Flex>
                </Button>
              )}
            </motion.div>
          </GlassCard>
        </>
      )}
    </AnimatePresence>
  );
};
