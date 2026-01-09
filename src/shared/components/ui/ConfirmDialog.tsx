import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

import { logger } from '../../utils/logger';
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'danger' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'warning',
}) => {
  const { t } = useTranslation('common');

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantColors: Record<string, string> = {
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-blue-400',
  };

  const variantBgColors: Record<string, string> = {
    warning: 'bg-yellow-500/20',
    danger: 'bg-red-500/20',
    info: 'bg-blue-500/20',
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-stone-900 border border-white/10 rounded-xl shadow-2xl z-[101] p-6"
          >
            {/* Icon + Title */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-2 rounded-lg ${variantBgColors[variant]}`}>
                <AlertTriangle className={`w-6 h-6 ${variantColors[variant]}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-sm text-white/70 mt-1">{message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end mt-6">
              <Button
                onClick={onClose}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
              >
                {cancelText || t('cancel')}
              </Button>
              <Button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-white ${
                  variant === 'danger'
                    ? 'bg-red-500 hover:bg-red-600'
                    : variant === 'warning'
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {confirmText || t('confirm')}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
