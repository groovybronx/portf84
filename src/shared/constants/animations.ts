import { Transition } from 'framer-motion';
import { STORAGE_KEYS } from './storage';

/**
 * Presets d'animation configurables
 *
 * Permet aux utilisateurs de choisir entre différents styles d'animation
 * selon leurs préférences (soft, normal, snappy).
 */

export type AnimationPreset = 'soft' | 'normal' | 'snappy';

/**
 * Configuration des presets d'animation spring
 */
export const SPRING_PRESETS: Record<AnimationPreset, { stiffness: number; damping: number }> = {
  soft: {
    stiffness: 150,
    damping: 25,
  },
  normal: {
    stiffness: 200,
    damping: 20,
  },
  snappy: {
    stiffness: 300,
    damping: 15,
  },
};

/**
 * Récupère le preset d'animation actuel depuis localStorage
 *
 * @returns Le preset configuré ou "normal" par défaut
 */
export function getCurrentAnimationPreset(): AnimationPreset {
  const stored = localStorage.getItem(STORAGE_KEYS.ANIMATION_PRESET);
  if (stored && (stored === 'soft' || stored === 'normal' || stored === 'snappy')) {
    return stored as AnimationPreset;
  }
  return 'normal';
}

/**
 * Définit le preset d'animation dans localStorage
 *
 * @param preset - Le preset à utiliser
 */
export function setAnimationPreset(preset: AnimationPreset): void {
  localStorage.setItem(STORAGE_KEYS.ANIMATION_PRESET, preset);
}

/**
 * Génère une transition spring basée sur le preset actuel
 *
 * @returns Transition Framer Motion configurée
 */
export function getSpringTransition(): Transition {
  const preset = getCurrentAnimationPreset();
  const config = SPRING_PRESETS[preset];

  return {
    type: 'spring',
    stiffness: config.stiffness,
    damping: config.damping,
  };
}
