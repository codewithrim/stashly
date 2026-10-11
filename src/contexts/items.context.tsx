import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { CreateItemInput, FilterCategory, ItemType, SavedItem, UpdateItemInput } from '@/types/item';

interface ItemsContextType {
  items: SavedItem[];
  filteredItems: SavedItem[];
  filter: FilterCategory;
  setFilter: (category: FilterCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  counts: Record<FilterCategory, number>;
  isLoading: boolean;
  error: string | null;
  refreshItems: () => Promise<void>;
  createItem: (input: CreateItemInput) => Promise<SavedItem>;
  updateItem: (id: string, input: UpdateItemInput) => Promise<SavedItem>;
  deleteItem: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  getItemById: (id: string) => SavedItem | undefined;
}

const ItemsContext = createContext<ItemsContextType | null>(null);

// Initial items to allow immediate interaction during Foundation testing
const INITIAL_MOCK_ITEMS: SavedItem[] = [
  {
    id: 'sample-note-1',
    owner_id: 'local-user',
    type: 'note',
    title: 'Productivity principles',
    content: '1. Focus on high leverage tasks.\n2. Write down thoughts to free up RAM.\n3. Review saved items weekly.',
    url: null,
    image_path: null,
    tags: ['productivity', 'habits'],
    is_archived: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'sample-link-1',
    owner_id: 'local-user',
    type: 'link',
    title: 'Expo Router Documentation',
    content: 'File-based routing for React Native and web.',
    url: 'https://docs.expo.dev/router/introduction',
    image_path: null,
    tags: ['dev', 'expo', 'react-native'],
    is_archived: false,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'sample-link-2',
    owner_id: 'local-user',
    type: 'link',
    title: 'Supabase Postgres Best Practices',
    content: 'RLS policies, performance tuning, and declarative schemas.',
    url: 'https://supabase.com/docs/guides/database',
    image_path: null,
    tags: ['database', 'supabase', 'security'],
    is_archived: false,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 'sample-archived-1',
    owner_id: 'local-user',
    type: 'note',
    title: 'Grocery list from last week',
    content: 'Oat milk, avocados, dark chocolate, coffee beans.',
    url: null,
    image_path: null,
    tags: ['personal'],
    is_archived: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>(INITIAL_MOCK_ITEMS);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In Stage 1: mock simulated refresh delay
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createItem = useCallback(async (input: CreateItemInput): Promise<SavedItem> => {
    const newItem: SavedItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      owner_id: 'local-user',
      type: input.type,
      title: input.title.trim(),
      content: input.content?.trim() ?? '',
      url: input.type === 'link' ? (input.url?.trim() ?? null) : null,
      image_path: input.type === 'image' ? (input.image_path ?? null) : null,
      tags: input.tags ?? [],
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const updateItem = useCallback(
    async (id: string, input: UpdateItemInput): Promise<SavedItem> => {
      let updated: SavedItem | undefined;

      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            updated = {
              ...item,
              title: input.title !== undefined ? input.title.trim() : item.title,
              content: input.content !== undefined ? input.content.trim() : item.content,
              url: input.url !== undefined ? input.url : item.url,
              image_path: input.image_path !== undefined ? input.image_path : item.image_path,
              tags: input.tags !== undefined ? input.tags : item.tags,
              is_archived: input.is_archived !== undefined ? input.is_archived : item.is_archived,
              updated_at: new Date().toISOString(),
            };
            return updated;
          }
          return item;
        })
      );

      if (!updated) {
        throw new Error('Item not found');
      }
      return updated;
    },
    []
  );

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleArchive = useCallback(async (id: string): Promise<void> => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            is_archived: !item.is_archived,
            updated_at: new Date().toISOString(),
          };
        }
        return item;
      })
    );
  }, []);

  const getItemById = useCallback(
    (id: string): SavedItem | undefined => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  const counts = useMemo<Record<FilterCategory, number>>(() => {
    const unarchived = items.filter((i) => !i.is_archived);
    return {
      all: unarchived.length,
      note: unarchived.filter((i) => i.type === 'note').length,
      link: unarchived.filter((i) => i.type === 'link').length,
      image: unarchived.filter((i) => i.type === 'image').length,
      archived: items.filter((i) => i.is_archived).length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Archive filter check
      if (filter === 'archived') {
        if (!item.is_archived) return false;
      } else {
        if (item.is_archived) return false;
        if (filter !== 'all' && item.type !== filter) return false;
      }

      // Selected tag filter check
      if (selectedTag && !item.tags.includes(selectedTag)) {
        return false;
      }

      // Search query check
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesContent = item.content.toLowerCase().includes(query);
        const matchesUrl = item.url ? item.url.toLowerCase().includes(query) : false;
        const matchesTags = item.tags.some((tag) => tag.toLowerCase().includes(query));

        if (!matchesTitle && !matchesContent && !matchesUrl && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [items, filter, selectedTag, searchQuery]);

  const value = useMemo(
    () => ({
      items,
      filteredItems,
      filter,
      setFilter,
      searchQuery,
      setSearchQuery,
      selectedTag,
      setSelectedTag,
      counts,
      isLoading,
      error,
      refreshItems,
      createItem,
      updateItem,
      deleteItem,
      toggleArchive,
      getItemById,
    }),
    [
      items,
      filteredItems,
      filter,
      searchQuery,
      selectedTag,
      counts,
      isLoading,
      error,
      refreshItems,
      createItem,
      updateItem,
      deleteItem,
      toggleArchive,
      getItemById,
    ]
  );

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
}

export function useItems(): ItemsContextType {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
}
