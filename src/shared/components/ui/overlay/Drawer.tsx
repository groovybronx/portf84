import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { Button } from '../Button';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: string;
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'w-64 h-full',
  md: 'w-80 h-full',
  lg: 'w-96 h-full',
  xl: 'w-[32rem] h-full',
  full: 'w-full h-full',
};

const topBottomSizeClasses = {
  sm: 'h-64 w-full',
  md: 'h-80 w-full',
  lg: 'h-96 w-full',
  xl: 'h-[32rem] w-full',
  full: 'h-full w-full',
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  side = 'right',
  size = 'md',
  title,
  showCloseButton = true,
}) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const variants = {
    closed: {
      x: side === 'right' ? '100%' : side === 'left' ? '-100%' : 0,
      y: side === 'bottom' ? '100%' : side === 'top' ? '-100%' : 0,
      opacity: 0,
    },
    open: {
      x: 0,
      y: 0,
      opacity: 1,
    },
  };

  const isVertical = side === 'top' || side === 'bottom';
  const sizeClass = isVertical ? topBottomSizeClasses[size] : sizeClasses[size];

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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed z-50 ${
              side === 'right'
                ? 'right-0 top-0 h-full'
                : side === 'left'
                ? 'left-0 top-0 h-full'
                : side === 'bottom'
                ? 'bottom-0 left-0 w-full'
                : 'top-0 left-0 w-full'
            } ${sizeClass}`}
          >
            <GlassCard
              variant="panel"
              padding="none"
              className="w-full h-full flex flex-col border-none rounded-none"
            >
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-4 border-b border-glass-border">
                  {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
                  {showCloseButton && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={onClose}
                      aria-label="Close drawer"
                    >
                      <X size={20} />
                    </Button>
                  )}
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">{children}</div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
