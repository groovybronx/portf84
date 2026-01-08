import React, { createContext, useContext } from "react";
import type { LibraryContextState } from "./LibraryContext.types";

// State context
const LibraryStateContext = createContext<LibraryContextState | undefined>(
  undefined
);

// Hook for accessing library state
export const useLibraryState = () => {
  const context = useContext(LibraryStateContext);
  if (context === undefined) {
    throw new Error(
      "useLibraryState must be used within a LibraryStateContext.Provider"
    );
  }
  return context;
};

export { LibraryStateContext };
