import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../GlassCard';
import { Button } from '../Button';
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  variant?: 'default' | 'danger' | 'warning';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  footer,
  children,
  variant = 'default',
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md"
          >
            <GlassCard variant="card" padding="lg" className="shadow-2xl border-white/10">
              <div className="space-y-2 mb-6">
                <h3
                  className={`text-lg font-semibold ${
                    variant === 'danger'
                      ? 'text-red-400'
                      : variant === 'warning'
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}
                >
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-white/60 leading-relaxed">{description}</p>
                )}
              </div>

              {children && <div className="mb-6">{children}</div>}

              {footer ? (
                <div className="flex justify-end gap-3 pt-2">{footer}</div>
              ) : (
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={onClose}>
                    Confirm
                  </Button>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
