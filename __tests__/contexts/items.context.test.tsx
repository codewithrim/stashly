import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { ItemsProvider, useItems } from '../../src/contexts/items.context';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ItemsProvider>{children}</ItemsProvider>;
}

describe('items.context', () => {
  it('initializes with default mock items and filter "all"', async () => {
    const { result } = await renderHook(() => useItems(), { wrapper });

    expect(result.current.filter).toBe('all');
    expect(result.current.items.length).toBeGreaterThan(0);
    expect(result.current.filteredItems.length).toBeGreaterThan(0);
    expect(result.current.counts.all).toBeGreaterThan(0);
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

  it('creates and archives an item', async () => {
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
