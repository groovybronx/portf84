import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Grid, List, Tag as TagIcon, Sparkles } from 'lucide-react';
import { Button, Flex, Stack, Grid as LayoutGrid, GlassCard } from '@/shared/components/ui';
import { getTagsWithUsageStats, TagWithUsage } from '@/services/storage/tags';
import {
	loadTagHubSettings,
	saveTagHubSettings,
	type TagHubSettings,
} from '@/shared/utils/tagHubSettings';

type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | 'manual' | 'ai' | 'unused' | 'mostUsed';

interface BrowseTabProps {
  onSelectTag?: (tagName: string) => void;
}

export const BrowseTab: React.FC<BrowseTabProps> = ({ onSelectTag }) => {
  const { t } = useTranslation(['tags', 'common']);
  const [tags, setTags] = useState<TagWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load persisted settings on mount
  const [settings, setSettings] = useState<TagHubSettings>(() => loadTagHubSettings());
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced save function
  const debouncedSave = useCallback((newSettings: TagHubSettings) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTagHubSettings(newSettings);
    }, 500);
  }, []);

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof TagHubSettings>(
    key: K,
    value: TagHubSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value, lastUpdated: Date.now() };
      debouncedSave(newSettings);
      return newSettings;
    });
  }, [debouncedSave]);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    try {
      const allTags = await getTagsWithUsageStats();
      setTags(allTags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tags based on search and filter mode
  const filteredTags = tags.filter((tag) => {
    // Search filter
    if (searchTerm && !tag.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Type filter
    if (settings.filterMode === 'manual' && tag.type !== 'manual') return false;
    if (settings.filterMode === 'ai' && tag.type !== 'ai') return false;

    return true;
  });

  const handleSearchFocus = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
  };

  // Keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        document.getElementById('tag-search')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Stack spacing="md" className="p-6">
      {/* Search and View Controls */}
      <Flex align="center" gap="md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            id="tag-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchFocus}
            placeholder={t('tags:searchTags')}
            className="w-full bg-glass-bg-accent border border-glass-border text-white text-sm px-10 py-2 rounded-lg focus:outline-none focus:border-blue-500/50"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 bg-glass-bg px-1.5 py-0.5 rounded">
            /
          </span>
        </div>

        {/* View Mode Toggle */}
        <GlassCard variant="accent" padding="sm" className="shrink-0">
          <Flex gap="xs">
          <Button
            onClick={() => updateSetting('viewMode', 'grid')}
            aria-label={t('tags:gridView')}
            className={`p-2 rounded ${
              settings.viewMode === 'grid'
                ? 'bg-blue-500/20 text-blue-300'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Grid size={16} />
          </Button>
          <Button
            onClick={() => updateSetting('viewMode', 'list')}
            aria-label={t('tags:listView')}
            className={`p-2 rounded ${
              settings.viewMode === 'list'
                ? 'bg-blue-500/20 text-blue-300'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <List size={16} />
          </Button>
          </Flex>
        </GlassCard>
      </Flex>

      {/* Filters */}
      <Flex gap="sm" className="overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'all' as FilterMode, label: t('tags:allTags') },
          { id: 'manual' as FilterMode, label: t('tags:manualTags') },
          { id: 'ai' as FilterMode, label: t('tags:aiTags') },
          { id: 'unused' as FilterMode, label: t('tags:unusedTags') },
          { id: 'mostUsed' as FilterMode, label: t('tags:mostUsed') },
        ].map((filter) => (
          <Button
            key={filter.id}
            onClick={() => updateSetting('filterMode', filter.id)}
            className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap ${
              settings.filterMode === filter.id
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                : 'text-gray-400 hover:bg-glass-bg-active bg-glass-bg'
            }`}
          >
            {filter.label}
          </Button>
        ))}
      </Flex>

      {/* Tags Display */}
      {loading ? (
        <Flex align="center" justify="center" className="py-12 text-gray-500">
          <div className="animate-spin mr-2">⏳</div>
          {t('common:loading')}
        </Flex>
      ) : filteredTags.length === 0 ? (
        <Flex direction="col" align="center" justify="center" gap="md" className="py-12">
          <Flex className="w-16 h-16 bg-gray-500/10 rounded-full" align="center" justify="center">
            <TagIcon className="w-8 h-8 text-gray-500" />
          </Flex>
          <h3 className="text-lg font-medium text-white">{t('tags:noTagsYet')}</h3>
          <p className="text-sm text-white/40">{t('tags:noSimilarTags')}</p>
        </Flex>
      ) : settings.viewMode === 'grid' ? (
        <LayoutGrid cols={4} gap="md" className="sm:grid-cols-3 grid-cols-2">
          {filteredTags.map((tag) => (
            <GlassCard
              key={tag.id}
              variant="accent"
              padding="md"
              border
              className="hover:border-blue-500/50 transition-all cursor-pointer group"
              onClick={() => onSelectTag?.(tag.name)}
            >
              <Flex align="start" justify="between" className="mb-2">
                <span className="text-sm font-medium text-white truncate flex-1">{tag.name}</span>
                <GlassCard variant="accent" padding="sm" className="text-xs text-gray-500">
                  {tag.usageCount}
                </GlassCard>
                {tag.type === 'ai' && (
                  <Sparkles className="w-3 h-3 text-purple-400 shrink-0 ml-1" />
                )}
              </Flex>
              <div className="text-xs text-gray-500">
                {tag.type === 'manual' ? t('tags:manualTags') : t('tags:aiTags')}
              </div>
            </GlassCard>
          ))}
        </LayoutGrid>
      ) : (
        <Stack spacing="sm">
          {filteredTags.map((tag) => (
            <GlassCard
              key={tag.id}
              variant="accent"
              padding="sm"
              border
              className="hover:border-blue-500/50 transition-all cursor-pointer flex items-center justify-between group"
              onClick={() => onSelectTag?.(tag.name)}
            >
              <Flex align="center" gap="sm">
                <TagIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-white">{tag.name}</span>
                <span className="text-xs text-gray-500">({tag.usageCount})</span>
                {tag.type === 'ai' && <Sparkles className="w-3 h-3 text-purple-400" />}
              </Flex>
              <div className="text-xs text-gray-500">
                {tag.type === 'manual' ? t('tags:manualTags') : t('tags:aiTags')}
              </div>
            </GlassCard>
          ))}
        </Stack>
      )}

      {/* Results Count */}
      {!loading && filteredTags.length > 0 && (
        <div className="text-xs text-gray-500 text-center pt-2">
          {t('tags:showingEntries', {
            start: 1,
            end: filteredTags.length,
            total: tags.length,
          })}
        </div>
      )}
    </Stack>
  );
};
