import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './ui';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Initialisation de portf84...',
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-(--z-overlay) bg-background flex flex-col items-center justify-center space-y-6"
        >
          <div className="relative">
            <LoadingSpinner size="xl" variant="primary" />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-blue-500/20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 font-light tracking-widest text-sm uppercase"
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
