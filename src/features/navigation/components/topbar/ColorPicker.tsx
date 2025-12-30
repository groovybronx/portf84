import React from "react";
import { XCircle, Eye, EyeOff, Palette } from "lucide-react";
import { COLOR_PALETTE } from "../../../../shared/types";

interface ColorPickerProps {
  activeColorFilter: string | null;
  onColorAction: (color: string | null) => void;
  showColorTags: boolean;
  onToggleColorTags: () => void;
  selectionMode: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  activeColorFilter,
  onColorAction,
  showColorTags,
  onToggleColorTags,
  selectionMode,
}) => {
  return (
    <div className="hidden lg:flex items-center gap-2 bg-glass-bg-accent px-3 py-2 rounded-xl border border-glass-border-light shrink-0">
      {Object.entries(COLOR_PALETTE).map(([key, hex]) => (
        <button
          key={key}
          onClick={() =>
            onColorAction(
              activeColorFilter === hex && !selectionMode ? null : hex
            )
          }
          className={`w-4 h-4 rounded-full transition-all border shadow-sm ${
            activeColorFilter === hex && !selectionMode
              ? "scale-125 border-white ring-2 ring-white/20"
              : "border-transparent hover:scale-110 opacity-80 hover:opacity-100 hover:border-white/30"
          }`}
          style={{ backgroundColor: hex }}
        />
      ))}
      <button
        onClick={() => onColorAction(null)}
        className={`w-4 h-4 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition-colors ${
          !activeColorFilter && !selectionMode
            ? "opacity-30 cursor-default"
            : ""
        }`}
      >
        <XCircle size={14} />
      </button>
      <div className="w-px h-4 bg-glass-border/10 mx-1" />
      <button
        onClick={onToggleColorTags}
        className={`w-4 h-4 flex items-center justify-center rounded-full transition-colors ${
          showColorTags ? "text-white" : "text-gray-500 hover:text-white"
        }`}
      >
        {showColorTags ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
    </div>
  );
};
