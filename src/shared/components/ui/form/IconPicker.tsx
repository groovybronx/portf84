import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconAction } from "../../Icon";

// Import ALL_ICONS from Icon.tsx once verified/moved
// Since I haven't moved it yet, I will define props to accept icons or use the export after I modify Icon.tsx.
// Better workflow: Modify Icon.tsx first, then create this file using the import.
// But since I'm in a tool call, I will write this assuming ALL_ICONS is available or passed as prop.
// The plan said "icons (list)" as prop. So I will stick to props for maximum flexibility.

interface IconPickerProps {
  value: IconAction;
  onChange: (icon: IconAction) => void;
  icons: IconAction[];
  usedIcons?: IconAction[];
  label?: string;
  className?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  icons,
  usedIcons = [],
  label,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <div className="text-xs text-white/50">{label}</div>}
      <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto pr-1">
        {icons.map((iconAction) => {
          const isUsed = usedIcons.includes(iconAction) && iconAction !== value;
          return (
            <button
              key={iconAction}
              onClick={() => {
                if (!isUsed) {
                  onChange(iconAction);
                }
              }}
              disabled={isUsed}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                value === iconAction
                  ? "bg-primary/20 ring-2 ring-primary scale-110"
                  : isUsed
                  ? "bg-glass-bg opacity-30 cursor-not-allowed"
                  : "bg-glass-bg hover:bg-glass-bg-active opacity-60 hover:opacity-100"
              }`}
              title={isUsed ? `${iconAction} (Already used)` : iconAction}
              type="button"
            >
              <Icon
                action={iconAction}
                size={16}
                className={
                  value === iconAction
                    ? "text-primary"
                    : isUsed
                    ? "text-white/30"
                    : "text-white/70"
                }
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
