import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { logger } from '../../../../../shared/utils/logger';
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  placement?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  delay = 500,
  placement = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: placement === 'top' ? 5 : -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-md border border-white/10 rounded-md shadow-lg pointer-events-none whitespace-nowrap
              ${
                placement === 'top'
                  ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
                  : 'top-full left-1/2 -translate-x-1/2 mt-2'
              }
            `}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
