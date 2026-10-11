import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { ItemsProvider, useItems } from '../../src/contexts/items.context';
import { SavedItem } from '../../src/types/item';

// Mock useAuth to provide an authenticated user for tests
const mockUserId = 'test-user-123';
jest.mock('../../src/contexts/auth.context', () => ({
  useAuth: () => ({
    user: { id: mockUserId, email: 'test@example.com' },
    session: { access_token: 'fake-token', user: { id: mockUserId } },
    isLoading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  }),
}));

// In-memory mock store for items.service
let mockDbItems: SavedItem[] = [];

const createMockItem = (
  id: string,
  type: 'note' | 'link' | 'image',
  title: string,
  content: string,
  tags: string[],
  is_archived = false
): SavedItem => ({
  id,
  owner_id: mockUserId,
  type,
  title,
  content,
  url: type === 'link' ? 'https://example.com' : null,
  image_path: null,
  tags,
  is_archived,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

jest.mock('../../src/services/items.service', () => ({
  fetchUserItems: jest.fn(async () => [...mockDbItems]),
  createSavedItem: jest.fn(async ({ input, userId }) => {
    const newItem: SavedItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      owner_id: userId,
      type: input.type,
      title: input.title,
      content: input.content || '',
      url: input.url || null,
      image_path: input.image_path || null,
      tags: input.tags || [],
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockDbItems.unshift(newItem);
    return newItem;
  }),
  updateSavedItem: jest.fn(async ({ itemId, input }) => {
    const idx = mockDbItems.findIndex((i) => i.id === itemId);
    if (idx !== -1) {
      mockDbItems[idx] = { ...mockDbItems[idx], ...input, updated_at: new Date().toISOString() };
      return mockDbItems[idx];
    }
    throw new Error('Not found');
  }),
  deleteSavedItem: jest.fn(async ({ itemId }) => {
    mockDbItems = mockDbItems.filter((i) => i.id !== itemId);
  }),
  toggleItemArchive: jest.fn(async ({ itemId, targetArchivedState }) => {
    const idx = mockDbItems.findIndex((i) => i.id === itemId);
    if (idx !== -1) {
      mockDbItems[idx] = {
        ...mockDbItems[idx],
        is_archived: targetArchivedState,
        updated_at: new Date().toISOString(),
      };
      return mockDbItems[idx];
    }
    throw new Error('Not found');
  }),
}));

jest.mock('../../src/services/storage.service', () => ({
  uploadImage: jest.fn(async () => ({ imagePath: 'test-user-123/mock.jpg' })),
  getSignedImageUrl: jest.fn(async () => 'https://signed-url.com/image.jpg'),
  deleteImage: jest.fn(async () => {}),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <ItemsProvider>{children}</ItemsProvider>;
}

describe('items.context', () => {
  beforeEach(() => {
    mockDbItems = [
      createMockItem('1', 'note', 'Productivity principles', 'Focus on what matters', ['work']),
      createMockItem('2', 'link', 'Useful dev website', 'https://example.com', ['dev']),
      createMockItem('3', 'note', 'Archived thoughts', 'Old note', ['misc'], true),
    ];
  });

  it('initializes with fetched user items and filter "all"', async () => {
    const { result } = await renderHook(() => useItems(), { wrapper });

    expect(result.current.filter).toBe('all');
    expect(result.current.items.length).toBe(3);
    expect(result.current.filteredItems.length).toBe(2); // 2 unarchived
    expect(result.current.counts.all).toBe(2);
    expect(result.current.counts.archived).toBe(1);
  });

  it('filters by category', async () => {
    const { result } = await renderHook(() => useItems(), { wrapper });

    await act(async () => {
      result.current.setFilter('note');
    });

    expect(result.current.filter).toBe('note');
    expect(
      result.current.filteredItems.every(
        (item) => item.type === 'note' && !item.is_archived
      )
    ).toBe(true);

    await act(async () => {
      result.current.setFilter('archived');
    });

    expect(result.current.filter).toBe('archived');
    expect(result.current.filteredItems.every((item) => item.is_archived)).toBe(
      true
    );
  });

  it('filters by search query', async () => {
    const { result } = await renderHook(() => useItems(), { wrapper });

    await act(async () => {
      result.current.setSearchQuery('Productivity');
    });

    expect(result.current.filteredItems.length).toBe(1);
    expect(result.current.filteredItems[0].title).toBe('Productivity principles');
  });

  it('creates, archives, and deletes an item', async () => {
    const { result } = await renderHook(() => useItems(), { wrapper });

    let createdId = '';
    await act(async () => {
      const item = await result.current.createItem({
        type: 'note',
        title: 'New Test Item',
        content: 'Test content here',
        tags: ['test'],
      });
      createdId = item.id;
    });

    expect(result.current.items.some((i) => i.id === createdId)).toBe(true);

    // Archive it
    await act(async () => {
      await result.current.toggleArchive(createdId);
    });

    const found = result.current.getItemById(createdId);
    expect(found?.is_archived).toBe(true);

    // Delete it
    await act(async () => {
      await result.current.deleteItem(createdId);
    });

    expect(result.current.getItemById(createdId)).toBeUndefined();
  });
});
