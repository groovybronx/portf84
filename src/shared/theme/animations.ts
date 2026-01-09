/**
 * Centralized Animation Variants for Framer Motion
 * Use these throughout the app to ensure consistent animations
 */
import type { Variants, Transition } from 'framer-motion';
// ==================== TRANSITIONS ====================

/** Standard spring transition */
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

/** Smooth tween transition */
export const smoothTransition: Transition = {
  type: 'tween',
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1], // ease-out-cubic
};

/** Fast transition for micro-interactions */
export const fastTransition: Transition = {
  type: 'tween',
  duration: 0.15,
  ease: 'easeOut',
};

/** Slow transition for dramatic effects */
export const slowTransition: Transition = {
  type: 'tween',
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1],
};

// ==================== FADE VARIANTS ====================

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: smoothTransition },
  exit: { opacity: 0, transition: fastTransition },
};

export const fadeScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: smoothTransition },
  exit: { opacity: 0, scale: 0.95, transition: fastTransition },
};

// ==================== SLIDE VARIANTS ====================

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: 20, transition: fastTransition },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: -20, transition: fastTransition },
};

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: smoothTransition },
  exit: { opacity: 0, x: 20, transition: fastTransition },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: smoothTransition },
  exit: { opacity: 0, x: -20, transition: fastTransition },
};

// ==================== CARD VARIANTS ====================

export const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: fastTransition,
  },
  hover: {
    scale: 1.02,
    transition: fastTransition,
  },
  tap: {
    scale: 0.98,
    transition: fastTransition,
  },
};

// ==================== FLIP VARIANTS ====================

export const flipVariants: Variants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
};

export const flip3DContainerStyle = {
  transformStyle: 'preserve-3d' as const,
  perspective: 1000,
};

export const flipFaceStyle = {
  backfaceVisibility: 'hidden' as const,
  position: 'absolute' as const,
  inset: 0,
};

// ==================== MODAL VARIANTS ====================

export const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: fastTransition },
  exit: { opacity: 0, transition: fastTransition },
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: fastTransition,
  },
};

// ==================== MENU VARIANTS ====================

export const menuVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -5 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -5,
    transition: { duration: 0.1 },
  },
};

export const menuItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

// ==================== STAGGER VARIANTS ====================

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// ==================== CAROUSEL VARIANTS ====================

export const carouselImageVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'tween',
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
    transition: {
      type: 'tween',
      duration: 0.3,
    },
  }),
};

// ==================== HOVER HIGHLIGHT ====================

export const hoverHighlightVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
