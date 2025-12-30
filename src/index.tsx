import React from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ProgressProvider } from "./shared/contexts/ProgressContext";
import { CollectionsProvider } from "./shared/contexts/CollectionsContext";
import { LibraryProvider } from "./shared/contexts/LibraryContext";
import { SelectionProvider } from "./shared/contexts/SelectionContext";
import { ThemeProvider } from "./shared/contexts/ThemeContext";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";

// Initialize i18n
import "./i18n";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <ProgressProvider>
      <CollectionsProvider>
        <LibraryProvider>
          <SelectionProvider>
            <ErrorBoundary featureName="Root Application">
              <App />
            </ErrorBoundary>
          </SelectionProvider>
        </LibraryProvider>
      </CollectionsProvider>
      </ProgressProvider>
    </ThemeProvider>
  </React.StrictMode>
);
