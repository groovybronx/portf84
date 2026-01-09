// Re-export all split context modules for backward compatibility
export { LibraryProvider } from "./LibraryContext.provider";
export { useLibraryState } from "./LibraryContext.state";
export { useLibraryActions } from "./LibraryContext.actions";

// Export types
export type {
  LibraryState,
  LibraryAction,
  LibraryContextType,
  LibraryContextState,
  LibraryContextActions,
} from "./LibraryContext.types";

// Import hooks for legacy wrapper
import { useLibraryState } from "./LibraryContext.state";
import { useLibraryActions } from "./LibraryContext.actions";

import { logger } from '../utils/logger';
// Legacy hook (Wrapper) - combines state and actions
export const useLibrary = () => {
  const state = useLibraryState();
  const actions = useLibraryActions();
  return { ...state, ...actions };
};
