export type ItemType = 'note' | 'link' | 'image';

export interface SavedItem {
  id: string;
  owner_id: string;
  type: ItemType;
  title: string;
  content: string;
  url: string | null;
  image_path: string | null;
  tags: string[];
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export type FilterCategory = 'all' | 'note' | 'link' | 'image' | 'archived';

export interface CreateItemInput {
  type: ItemType;
  title: string;
  content?: string;
  url?: string | null;
  image_path?: string | null;
  tags?: string[];
}

export interface UpdateItemInput {
  title?: string;
  content?: string;
  url?: string | null;
  image_path?: string | null;
  tags?: string[];
  is_archived?: boolean;
}

export interface ItemDraft {
  type: ItemType;
  title: string;
  content: string;
  url: string;
  image_uri?: string | null;
  tags: string[];
  lastModified: number;
}
