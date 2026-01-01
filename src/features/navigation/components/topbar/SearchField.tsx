import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Tag, X } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";

interface SearchFieldProps {
  value: string;
  onChange: (term: string) => void;
  availableTags?: string[];
  onTagSelect?: (tag: string | null) => void;
  selectedTag?: string | null;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  availableTags = [],
  onTagSelect,
  selectedTag,
}) => {
  const { t } = useTranslation("navigation");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (value.trim() && isFocused) {
      const match = value.toLowerCase();
      const filtered = availableTags
        .filter((tag) => tag.toLowerCase().includes(match))
        .slice(0, 5); // Limit to top 5
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [value, availableTags, isFocused]);

  const handleSuggestionClick = (tag: string) => {
    if (onTagSelect) {
      onTagSelect(tag);
      onChange(""); // Clear search after selecting tag
      setIsFocused(false);
    }
  };

  const clearTag = () => {
    if (onTagSelect) onTagSelect(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center bg-glass-bg-accent rounded-lg border transition-all shrink-0 ${
        isFocused
          ? "w-48 sm:w-72 border-blue-500/50 ring-1 ring-blue-500/20"
          : "w-32 sm:w-48 border-glass-border-light"
      }`}
    >
      <div className="flex items-center w-full px-3 py-2">
        <Search size={16} className="text-gray-400 mr-2 shrink-0" />

        {/* Active Tag Chip */}
        {selectedTag && (
          <div className="flex items-center gap-1 bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full mr-2 whitespace-nowrap">
            <span className="max-w-[80px] truncate">{selectedTag}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearTag();
              }}
              className="hover:text-white"
            >
              <X size={10} />
            </button>
          </div>
        )}

        <input
          type="text"
          placeholder={selectedTag ? t('searchInTag') : t('searchPlaceholder')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500 min-w-0"
        />
      </div>

      {/* Autocomplete Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/80 backdrop-blur-xl border border-glass-border rounded-xl shadow-2xl overflow-hidden z-100">
          <div className="px-3 py-2 text-xs text-gray-500 font-medium uppercase tracking-wider border-b border-white/5">
            {t('suggestions')}
          </div>
          {suggestions.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSuggestionClick(tag)}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Tag size={12} className="text-blue-400" />
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
