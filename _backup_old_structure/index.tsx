import React from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ProgressProvider } from "./contexts/ProgressContext";
import { CollectionsProvider } from "./contexts/CollectionsContext";
import { LibraryProvider } from "./contexts/LibraryContext";
import { SelectionProvider } from "./contexts/SelectionContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ProgressProvider>
      <CollectionsProvider>
        <LibraryProvider>
          <SelectionProvider>
            <App />
          </SelectionProvider>
        </LibraryProvider>
      </CollectionsProvider>
    </ProgressProvider>
  </React.StrictMode>
);
