import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Tag, X } from 'lucide-react';
import { Button, GlassCard, Flex } from '../../../../shared/components/ui';

import { logger } from '../../../../shared/utils/logger';
interface SearchFieldProps {
  value: string;
  onChange: (term: string) => void;
  availableTags?: string[];
  activeTags?: Set<string>;
  onTagToggle?: (tag: string) => void;
  onClearTags?: () => void;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  availableTags = [],
  activeTags = new Set(),
  onTagToggle,
  onClearTags,
}) => {
  const { t } = useTranslation('navigation');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (value.trim() && isFocused) {
      const match = value.toLowerCase();
      const filtered = availableTags
        .filter((tag) => tag.toLowerCase().includes(match) && !activeTags?.has(tag))
        .slice(0, 5); // Limit to top 5
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [value, availableTags, isFocused, activeTags]);

  const handleSuggestionClick = (tag: string) => {
    if (onTagToggle) {
      onTagToggle(tag);
      onChange(''); // Clear search after selecting tag
      setIsFocused(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center rounded-lg border transition-all shrink-0 ${
        isFocused
          ? 'w-48 sm:w-80 border-blue-500/50 ring-1 ring-blue-500/20 bg-glass-bg-accent'
          : 'w-32 sm:w-56 border-glass-border-light bg-glass-bg-accent'
      }`}
    >
      <Flex align="center" className="w-full px-3 py-2 overflow-hidden">
        <Search size={16} className="text-gray-400 mr-2 shrink-0" />

        {/* Active Tag Chips */}
        {activeTags.size > 0 && (
          <Flex align="center" gap="xs" className="mr-2 overflow-hidden shrink-0">
            {Array.from(activeTags)
              .slice(0, 2)
              .map((tag) => (
                <div
                  key={tag}
                  className="flex items-center bg-blue-500/20 text-blue-300 text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap"
                >
                  <span className="max-w-[60px] truncate">{tag}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagToggle?.(tag);
                    }}
                    aria-label="Remove tag filter"
                    className="ml-1 h-3 w-3 p-0 hover:text-white hover:bg-transparent"
                  >
                    <X size={10} />
                  </Button>
                </div>
              ))}
            {activeTags.size > 2 && (
              <div className="text-xs text-blue-400 px-1">+{activeTags.size - 2}</div>
            )}

            <Button
              variant="close"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onClearTags?.();
              }}
              aria-label="Clear all tags"
              className="ml-1"
            >
              <X size={10} />
            </Button>
          </Flex>
        )}

        <input
          type="text"
          placeholder={activeTags.size > 0 ? 'Add tag...' : t('searchPlaceholder')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500 min-w-0"
        />
      </Flex>

      {/* Autocomplete Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <GlassCard
          variant="overlay"
          className="absolute top-full left-0 right-0 mt-2 border border-glass-border rounded-xl shadow-2xl overflow-hidden z-100"
        >
          <div className="px-3 py-2 text-xs text-gray-500 font-medium uppercase tracking-wider border-b border-white/5">
            {t('suggestions')}
          </div>
          {suggestions.map((tag) => (
            <Button
              key={tag}
              variant="ghost"
              onClick={() => handleSuggestionClick(tag)}
              className="w-full justify-start gap-2 rounded-none"
            >
              <Tag size={12} className="text-blue-400" />
              {tag}
            </Button>
          ))}
        </GlassCard>
      )}
    </div>
  );
};
