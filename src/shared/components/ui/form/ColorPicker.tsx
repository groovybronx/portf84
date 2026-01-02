import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconAction } from "../../Icon";
import { IconPicker } from "./IconPicker";
import { Button } from "../Button";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors: { name: string; value: string }[];
  icon?: IconAction;
  onIconChange?: (icon: IconAction) => void;
  withIconPicker?: boolean;
  availableIcons?: IconAction[];
  usedIcons?: IconAction[];
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  colors,
  icon,
  onIconChange,
  withIconPicker = false,
  availableIcons = [],
  usedIcons = [],
}) => {
  const [showIconPicker, setShowIconPicker] = useState(false);

  return (
    <div className="bg-glass-bg-accent rounded-xl p-3 border border-glass-border-light">
      <div className="flex items-center justify-between mb-3">
        {/* Color Swatches */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-[240px]">
          {colors.map((color) => (
            <Button
              key={color.value}
              onClick={() => onChange(color.value)}
              variant="ghost"
              size="icon-sm"
              className={`rounded-md shrink-0 transition-transform ${
                value === color.value
                  ? "ring-2 ring-white scale-110 z-10"
                  : "opacity-60 hover:opacity-100 hover:scale-105"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
              type="button"
            />
          ))}
        </div>

        {/* Optional Icon Trigger */}
        {withIconPicker && icon && onIconChange && (
          <Button
            onClick={() => setShowIconPicker(!showIconPicker)}
            variant="ghost"
            size="icon"
            className={`rounded-lg shadow-inner border border-white/10 transition-all shrink-0 ml-2 ${
              showIconPicker
                ? "ring-2 ring-white/30 scale-105"
                : "hover:scale-105"
            }`}
            style={{ backgroundColor: value }}
            title="Change Icon"
            type="button"
          >
            <Icon action={icon} size={20} className="text-white drop-shadow-md" />
          </Button>
        )}
      </div>

      {/* Icon Picker Dropdown */}
      <AnimatePresence>
        {showIconPicker && icon && onIconChange && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-glass-border">
              <IconPicker
                value={icon}
                onChange={(newIcon) => {
                  onIconChange(newIcon);
                  setShowIconPicker(false);
                }}
                icons={availableIcons}
                usedIcons={usedIcons}
                label="Select Icon"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
