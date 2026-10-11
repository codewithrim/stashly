import { supabase } from '../../src/services/supabase';
import {
  fetchUserItems,
  createSavedItem,
  updateSavedItem,
  deleteSavedItem,
  toggleItemArchive,
} from '../../src/services/items.service';

jest.mock('../../src/services/supabase', () => {
  const mSupabase = {
    from: jest.fn(),
  };
  return { supabase: mSupabase };
});

describe('items.service', () => {
  const userId = 'user-abc';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchUserItems queries saved_items for the specific user and orders by created_at', async () => {
    const mockData = [
      { id: '1', title: 'Item 1', owner_id: userId, type: 'note', tags: [] },
    ];

    const orderMock = jest.fn().mockResolvedValue({ data: mockData, error: null });
    const eqMock = jest.fn().mockReturnValue({ order: orderMock });
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
    (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

    const result = await fetchUserItems(userId);

    expect(supabase.from).toHaveBeenCalledWith('saved_items');
    expect(selectMock).toHaveBeenCalledWith('*');
    expect(eqMock).toHaveBeenCalledWith('owner_id', userId);
    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toEqual(mockData);
  });

  it('createSavedItem throws an error for link items without a valid url', async () => {
    await expect(
      createSavedItem({
        userId,
        input: {
          type: 'link',
          title: 'Missing Link',
          url: '',
        },
      })
    ).rejects.toThrow('A URL is required for link items.');
  });

  it('createSavedItem inserts item and returns created row', async () => {
    const mockCreated = {
      id: 'item-new',
      owner_id: userId,
      type: 'note',
      title: 'Valid Note',
      content: 'Hello',
      url: null,
      image_path: null,
      tags: ['test'],
    };

    const singleMock = jest.fn().mockResolvedValue({ data: mockCreated, error: null });
    const selectMock = jest.fn().mockReturnValue({ single: singleMock });
    const insertMock = jest.fn().mockReturnValue({ select: selectMock });
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    const result = await createSavedItem({
      userId,
      input: {
        type: 'note',
        title: 'Valid Note',
        content: 'Hello',
        tags: ['test'],
      },
    });

    expect(supabase.from).toHaveBeenCalledWith('saved_items');
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        owner_id: userId,
        type: 'note',
        title: 'Valid Note',
        content: 'Hello',
      })
    );
    expect(result).toEqual(mockCreated);
  });

  it('deleteSavedItem enforces user ownership check in query', async () => {
    const eqItemMock = jest.fn().mockResolvedValue({ error: null });
    const eqOwnerMock = jest.fn().mockReturnValue({ eq: eqItemMock });
    const deleteMock = jest.fn().mockReturnValue({ eq: eqOwnerMock });
    (supabase.from as jest.Mock).mockReturnValue({ delete: deleteMock });

    await deleteSavedItem({ userId, itemId: 'item-123' });

    expect(supabase.from).toHaveBeenCalledWith('saved_items');
    expect(eqOwnerMock).toHaveBeenCalledWith('id', 'item-123');
    expect(eqItemMock).toHaveBeenCalledWith('owner_id', userId);
  });
});
