import React, { createContext, useContext } from "react";
import type { LibraryContextActions } from "./LibraryContext.types";

import { logger } from '../utils/logger';
// Actions context
const LibraryDispatchContext = createContext<LibraryContextActions | undefined>(
  undefined
);

// Hook for accessing library actions
export const useLibraryActions = () => {
  const context = useContext(LibraryDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useLibraryActions must be used within a LibraryDispatchContext.Provider"
    );
  }
  return context;
};

export { LibraryDispatchContext };
