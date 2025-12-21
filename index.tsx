import React from 'react';
import "./index.css";
import ReactDOM from 'react-dom/client';
import App from './App';
import { ProgressProvider } from "./contexts/ProgressContext";

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </React.StrictMode>
);