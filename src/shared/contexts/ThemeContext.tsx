import React, { createContext, useContext, useState, useEffect } from "react";
import type { IconAction } from "../components/Icon";
import { STORAGE_KEYS } from "../constants/storage";

interface ThemeSettings {
  glassBg: string;
  glassBorder: string;
  textPrimary: string;
  primaryColor: string;
  secondaryColor: string; // AI Features (Default: Purple)
  tertiaryColor: string;  // Collections (Default: Emerald)
  quaternaryColor: string; // Folders (Default: Amber)
  quinaryColor: string;   // Projects (Default: Rose)
  // Icon customization
  primaryIcon: IconAction;
  secondaryIcon: IconAction;
  tertiaryIcon: IconAction;  // Collections
  quaternaryIcon: IconAction; // Folders
  quinaryIcon: IconAction;   // Projects
  filtersIcon: IconAction;   // Color Filters (no theme color)
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateSetting: (key: keyof ThemeSettings, value: string) => void;
  resetTheme: () => void;
}

const defaultSettings: ThemeSettings = {
  glassBg: "rgba(10, 10, 10, 0.8)",
  glassBorder: "rgba(255, 255, 255, 0.1)",
  textPrimary: "#ffffff",
  primaryColor: "#3b82f6", // Blue-500
  secondaryColor: "#a855f7", // Purple-500
  tertiaryColor: "#10b981", // Emerald-500
  quaternaryColor: "#f59e0b", // Amber-500
  quinaryColor: "#f43f5e", // Rose-500
  // Icon defaults
  primaryIcon: "grid",
  secondaryIcon: "sparkles",
  tertiaryIcon: "folder_heart",  // Collections
  quaternaryIcon: "hard_drive",  // Folders
  quinaryIcon: "box",           // Projects
  filtersIcon: "palette",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage on mount (lazy initialization)
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse theme settings", e);
      }
    }
    return defaultSettings;
  });

  // Apply to CSS variables whenever settings change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-glass-bg", settings.glassBg);
    root.style.setProperty("--color-glass-border", settings.glassBorder);
    root.style.setProperty("--color-text-primary", settings.textPrimary);
    root.style.setProperty("--color-primary", settings.primaryColor);
    root.style.setProperty("--color-secondary", settings.secondaryColor);
    root.style.setProperty("--color-tertiary", settings.tertiaryColor);
    root.style.setProperty("--color-quaternary", settings.quaternaryColor);
    root.style.setProperty("--color-quinary", settings.quinaryColor);
    
    // Derived values (could be made explicit settings later)
    // E.g. Accent is usually lighter than Bg
    // For now we just stick to the main overrides.
    
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: keyof ThemeSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetTheme = () => {
    setSettings(defaultSettings);
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSetting, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
