/**
 * Z-Index Constants
 * Centralized z-index hierarchy for consistent layering
 */
export const Z_INDEX = {
  // Base layers
  base: 10,
  dropdown: 20,
  sticky: 30,

  // Overlay layers
  modal: 40,
  tooltip: 50,

  // Maximum z-index for emergencies
  maximum: 9999,
} as const;

/**
 * CSS Custom Properties for Z-Index
 * Usage: className="z-[var(--z-modal)]"
 */
export const Z_INDEX_VARS = {
  base: '--z-base',
  dropdown: '--z-dropdown',
  sticky: '--z-sticky',
  modal: '--z-modal',
  tooltip: '--z-tooltip',
  maximum: '--z-maximum',
} as const;

/**
 * Helper function to get z-index value
 */
export const getZIndex = (layer: keyof typeof Z_INDEX): number => {
  return Z_INDEX[layer];
};
