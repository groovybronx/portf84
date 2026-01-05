import { Profiler, ProfilerOnRenderCallback } from 'react';

/**
 * Performance Monitor Component
 * Wrapper pour mesurer les performances des composants React dans Tauri
 * 
 * Usage:
 * <PerformanceMonitor id="FolderDrawer" enabled={true}>
 *   <FolderDrawer {...props} />
 * </PerformanceMonitor>
 */

interface PerformanceMonitorProps {
  id: string;
  enabled?: boolean;
  children: React.ReactNode;
  warnThreshold?: number; // en ms, par défaut 50ms
}

const performanceStats = new Map<string, {
  mountCount: number;
  updateCount: number;
  totalDuration: number;
  maxDuration: number;
  avgDuration: number;
}>();

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  const stats = performanceStats.get(id) || {
    mountCount: 0,
    updateCount: 0,
    totalDuration: 0,
    maxDuration: 0,
    avgDuration: 0,
  };

  if (phase === 'mount') {
    stats.mountCount++;
  } else {
    stats.updateCount++;
  }

  stats.totalDuration += actualDuration;
  stats.maxDuration = Math.max(stats.maxDuration, actualDuration);
  const totalRenders = stats.mountCount + stats.updateCount;
  stats.avgDuration = stats.totalDuration / totalRenders;

  performanceStats.set(id, stats);

  // Log avec couleur selon la durée
  const emoji = actualDuration > 50 ? '🔴' : actualDuration > 20 ? '🟡' : '🟢';
  console.log(
    `${emoji} [${id}] ${phase} - ${actualDuration.toFixed(2)}ms` +
    ` (avg: ${stats.avgDuration.toFixed(2)}ms, max: ${stats.maxDuration.toFixed(2)}ms)`
  );

  // Détails supplémentaires pour les renders lents
  if (actualDuration > 50) {
    console.warn(
      `⚠️ Slow render detected in ${id}:`,
      `\n  Phase: ${phase}`,
      `\n  Duration: ${actualDuration.toFixed(2)}ms`,
      `\n  Base duration: ${baseDuration.toFixed(2)}ms`,
      `\n  Commit time: ${new Date(commitTime).toISOString()}`
    );
  }
};

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  id,
  enabled = import.meta.env.DEV,
  children,
  warnThreshold = 50,
}) => {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
};

/**
 * Afficher les statistiques de performance dans la console
 */
export const logPerformanceStats = () => {
  console.group('📊 Performance Statistics');
  
  performanceStats.forEach((stats, id) => {
    const totalRenders = stats.mountCount + stats.updateCount;
    console.log(
      `\n${id}:`,
      `\n  Total renders: ${totalRenders} (${stats.mountCount} mounts, ${stats.updateCount} updates)`,
      `\n  Average duration: ${stats.avgDuration.toFixed(2)}ms`,
      `\n  Max duration: ${stats.maxDuration.toFixed(2)}ms`,
      `\n  Total time: ${stats.totalDuration.toFixed(2)}ms`
    );
  });
  
  console.groupEnd();
};

/**
 * Réinitialiser les statistiques
 */
export const resetPerformanceStats = () => {
  performanceStats.clear();
  console.log('🔄 Performance stats reset');
};

// Expose les fonctions globalement pour faciliter l'utilisation dans la console
if (import.meta.env.DEV) {
  (window as any).logPerformanceStats = logPerformanceStats;
  (window as any).resetPerformanceStats = resetPerformanceStats;
}

/**
 * Hook pour mesurer les performances d'un hook ou d'une fonction
 * 
 * Usage:
 * const handleClick = usePerformanceMeasure('handleClick', () => {
 *   // ... code
 * });
 */
export const usePerformanceMeasure = <T extends (...args: any[]) => any>(
  label: string,
  fn: T
): T => {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const duration = performance.now() - start;
    
    const emoji = duration > 100 ? '🔴' : duration > 50 ? '🟡' : '🟢';
    console.log(`${emoji} [${label}] ${duration.toFixed(2)}ms`);
    
    return result;
  }) as T;
};

/**
 * Mesurer une opération asynchrone
 */
export const measureAsync = async <T,>(
  label: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    console.log(`⏱️ [${label}] ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`❌ [${label}] Failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};
