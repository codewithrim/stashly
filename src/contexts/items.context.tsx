import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { CreateItemInput, FilterCategory, SavedItem, UpdateItemInput } from '@/types/item';
import {
  fetchUserItems,
  createSavedItem,
  updateSavedItem,
  deleteSavedItem,
  toggleItemArchive,
} from '@/services/items.service';
import { uploadImage, getSignedImageUrl, deleteImage } from '@/services/storage.service';
import {
  enqueueMutation,
  getQueuedMutations,
  removeQueuedMutation,
} from '@/services/queue.service';
import { useAuth } from './auth.context';

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
  syncOfflineQueue: () => Promise<void>;
  createItem: (input: CreateItemInput & { imageUri?: string | null }) => Promise<SavedItem>;
  updateItem: (id: string, input: UpdateItemInput & { imageUri?: string | null }) => Promise<SavedItem>;
  deleteItem: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  getItemById: (id: string) => SavedItem | undefined;
  getSignedUrl: (imagePath: string) => Promise<string | null>;
}

const ItemsContext = createContext<ItemsContextType | null>(null);

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const userId = auth?.user?.id;

  const [items, setItems] = useState<SavedItem[]>([]);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const refreshItems = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const userItems = await fetchUserItems(userId);
      setItems(userItems);
    } catch (err) {
      console.error('Error fetching items from Supabase:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Automatically fetch items when user signs in
  useEffect(() => {
    if (!userId) return;

    let isCurrent = true;

    const loadItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userItems = await fetchUserItems(userId);
        if (isCurrent) {
          setItems(userItems);
        }
      } catch (err) {
        if (isCurrent) {
          console.error('Error fetching items from Supabase:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch items');
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      isCurrent = false;
    };
  }, [userId]);

  const getSignedUrl = useCallback(
    async (imagePath: string): Promise<string | null> => {
      if (!imagePath) return null;
      if (signedUrls[imagePath]) {
        return signedUrls[imagePath];
      }
      const url = await getSignedImageUrl(imagePath);
      if (url) {
        setSignedUrls((prev) => ({ ...prev, [imagePath]: url }));
      }
      return url;
    },
    [signedUrls]
  );

  const syncOfflineQueue = useCallback(async () => {
    if (!userId) return;

    try {
      const queued = await getQueuedMutations();
      const userQueued = queued.filter((m) => m.userId === userId);

      for (const item of userQueued) {
        try {
          const created = await createSavedItem({
            userId,
            input: item.input,
          });
          setItems((prev) => [created, ...prev.filter((p) => p.id !== item.id)]);
          await removeQueuedMutation(item.id);
        } catch (err) {
          console.warn('Failed to replay queued mutation:', err);
          break; // Stop replaying if still offline or network failing
        }
      }
    } catch (err) {
      console.warn('Error syncing offline queue:', err);
    }
  }, [userId]);

  const createItem = useCallback(
    async (input: CreateItemInput & { imageUri?: string | null }): Promise<SavedItem> => {
      if (!userId) {
        throw new Error('You must be signed in to save items.');
      }

      let uploadedPath: string | null = null;
      if (input.type === 'image' && input.imageUri) {
        try {
          const uploadResult = await uploadImage({
            userId,
            localUri: input.imageUri,
          });
          uploadedPath = uploadResult.imagePath;
        } catch (uploadErr) {
          console.warn('Image upload error (saving with local reference):', uploadErr);
          uploadedPath = input.imageUri;
        }
      }

      try {
        const created = await createSavedItem({
          userId,
          input: {
            ...input,
            image_path: uploadedPath ?? input.image_path,
          },
        });

        setItems((prev) => [created, ...prev]);
        return created;
      } catch (networkError) {
        // Enqueue mutation locally if cloud write fails (e.g. offline)
        console.warn('Network error saving to cloud, buffering in offline queue:', networkError);
        const queued = await enqueueMutation({
          userId,
          input: {
            ...input,
            image_path: uploadedPath ?? input.image_path,
          },
        });

        // Optimistic local item
        const optimisticItem: SavedItem = {
          id: queued.id,
          owner_id: userId,
          type: input.type,
          title: input.title,
          content: input.content || '',
          url: input.url || null,
          image_path: uploadedPath ?? input.image_path ?? null,
          tags: input.tags || [],
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setItems((prev) => [optimisticItem, ...prev]);
        return optimisticItem;
      }
    },
    [userId]
  );

  const updateItem = useCallback(
    async (id: string, input: UpdateItemInput & { imageUri?: string | null }): Promise<SavedItem> => {
      if (!userId) {
        throw new Error('You must be signed in to edit items.');
      }

      const { imageUri, ...updateInput } = input;
      let finalInput = { ...updateInput };

      // If a new local image was picked, upload it
      if (imageUri) {
        const uploadResult = await uploadImage({
          userId,
          localUri: imageUri,
        });
        finalInput.image_path = uploadResult.imagePath;
      }

      const updated = await updateSavedItem({
        userId,
        itemId: id,
        input: finalInput,
      });

      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    [userId]
  );

  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) {
        throw new Error('You must be signed in to delete items.');
      }

      const existing = items.find((i) => i.id === id);

      await deleteSavedItem({
        userId,
        itemId: id,
      });

      if (existing?.image_path) {
        await deleteImage(existing.image_path);
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [userId, items]
  );

  const toggleArchive = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) {
        throw new Error('You must be signed in to archive items.');
      }

      const target = items.find((i) => i.id === id);
      if (!target) return;

      const updated = await toggleItemArchive({
        userId,
        itemId: id,
        targetArchivedState: !target.is_archived,
      });

      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    },
    [userId, items]
  );

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
      if (filter === 'archived') {
        if (!item.is_archived) return false;
      } else {
        if (item.is_archived) return false;
        if (filter !== 'all' && item.type !== filter) return false;
      }

      if (selectedTag && !item.tags.includes(selectedTag)) {
        return false;
      }

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
      syncOfflineQueue,
      createItem,
      updateItem,
      deleteItem,
      toggleArchive,
      getItemById,
      getSignedUrl,
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
      syncOfflineQueue,
      createItem,
      updateItem,
      deleteItem,
      toggleArchive,
      getItemById,
      getSignedUrl,
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
