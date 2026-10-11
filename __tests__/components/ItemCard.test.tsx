import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ItemCard } from '../../src/components/items/ItemCard';
import { SavedItem } from '../../src/types/item';

const mockItem: SavedItem = {
  id: 'item-1',
  owner_id: 'user-1',
  type: 'note',
  title: 'Test Note Title',
  content: 'Some interesting note content',
  url: null,
  image_path: null,
  tags: ['ideas', 'work'],
  is_archived: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('ItemCard', () => {
  it('renders title, content snippet, and tags', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <ItemCard item={mockItem} onPress={onPress} />
    );

    expect(getByText('Test Note Title')).toBeTruthy();
    expect(getByText('Some interesting note content')).toBeTruthy();
    expect(getByText('#ideas')).toBeTruthy();
    expect(getByText('#work')).toBeTruthy();
  });

  it('triggers onPress when card is pressed', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <ItemCard item={mockItem} onPress={onPress} />
    );

    fireEvent.press(getByRole('button', { name: /note: test note title/i }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('triggers onToggleArchive when archive icon is pressed', async () => {
    const onToggleArchive = jest.fn();
    const { getByLabelText } = await render(
      <ItemCard
        item={mockItem}
        onPress={jest.fn()}
        onToggleArchive={onToggleArchive}
      />
    );

    fireEvent.press(getByLabelText('Archive item'));
    expect(onToggleArchive).toHaveBeenCalledTimes(1);
  });

  it('displays domain for link type item', async () => {
    const linkItem: SavedItem = {
      ...mockItem,
      type: 'link',
      url: 'https://news.ycombinator.com/item?id=123',
    };

    const { getByText } = await render(
      <ItemCard item={linkItem} onPress={jest.fn()} />
    );

    expect(getByText('news.ycombinator.com')).toBeTruthy();
  });
});
