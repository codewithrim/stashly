import { supabase } from './supabase';
import { CreateItemInput, SavedItem, UpdateItemInput } from '@/types/item';
import { Database } from '@/types/database';

export async function fetchUserItems(userId: string): Promise<SavedItem[]> {
  const { data, error } = await supabase
    .from('saved_items')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch items: ${error.message}`);
  }

  return (data as SavedItem[]) || [];
}

export async function fetchItemById(
  userId: string,
  itemId: string
): Promise<SavedItem | null> {
  const { data, error } = await supabase
    .from('saved_items')
    .select('*')
    .eq('id', itemId)
    .eq('owner_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch item: ${error.message}`);
  }

  return data as SavedItem | null;
}

export async function createSavedItem(params: {
  userId: string;
  input: CreateItemInput;
}): Promise<SavedItem> {
  const { userId, input } = params;

  // Enforce table check constraints
  let url: string | null = null;
  let imagePath: string | null = null;

  if (input.type === 'note') {
    url = null;
    imagePath = null;
  } else if (input.type === 'link') {
    if (!input.url || input.url.trim().length === 0) {
      throw new Error('A URL is required for link items.');
    }
    url = input.url.trim();
    imagePath = null;
  } else if (input.type === 'image') {
    if (!input.image_path || input.image_path.trim().length === 0) {
      throw new Error('An image is required for image items.');
    }
    url = null;
    imagePath = input.image_path.trim();
  }

  const payload = {
    owner_id: userId, // Always taken from authenticated session!
    type: input.type,
    title: input.title.trim(),
    content: input.content?.trim() ?? '',
    url,
    image_path: imagePath,
    tags: input.tags ?? [],
    is_archived: false,
  };

  const { data, error } = await supabase
    .from('saved_items')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create item: ${error.message}`);
  }

  return data as SavedItem;
}

export async function updateSavedItem(params: {
  userId: string;
  itemId: string;
  input: UpdateItemInput;
}): Promise<SavedItem> {
  const { userId, itemId, input } = params;

  const updates: Database['public']['Tables']['saved_items']['Update'] = {};

  if (input.title !== undefined) {
    updates.title = input.title.trim();
  }
  if (input.content !== undefined) {
    updates.content = input.content.trim();
  }
  if (input.url !== undefined) {
    updates.url = input.url;
  }
  if (input.image_path !== undefined) {
    updates.image_path = input.image_path;
  }
  if (input.tags !== undefined) {
    updates.tags = input.tags;
  }
  if (input.is_archived !== undefined) {
    updates.is_archived = input.is_archived;
  }

  const { data, error } = await supabase
    .from('saved_items')
    .update(updates)
    .eq('id', itemId)
    .eq('owner_id', userId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update item: ${error.message}`);
  }

  return data as SavedItem;
}

export async function deleteSavedItem(params: {
  userId: string;
  itemId: string;
}): Promise<void> {
  const { userId, itemId } = params;

  const { error } = await supabase
    .from('saved_items')
    .delete()
    .eq('id', itemId)
    .eq('owner_id', userId);

  if (error) {
    throw new Error(`Failed to delete item: ${error.message}`);
  }
}

export async function toggleItemArchive(params: {
  userId: string;
  itemId: string;
  targetArchivedState: boolean;
}): Promise<SavedItem> {
  return updateSavedItem({
    userId: params.userId,
    itemId: params.itemId,
    input: { is_archived: params.targetArchivedState },
  });
}
