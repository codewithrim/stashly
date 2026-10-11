import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItemDraft } from '../types/item';

const DRAFT_STORAGE_KEY = '@stashly/item_draft_v1';

export async function saveDraft(draft: Omit<ItemDraft, 'lastModified'>): Promise<void> {
  try {
    const payload: ItemDraft = {
      ...draft,
      lastModified: Date.now(),
    };
    await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    // Non-blocking: fail quietly on storage errors
    console.warn('Failed to save draft:', error);
  }
}

export async function getDraft(): Promise<ItemDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ItemDraft;

    // Check if the draft actually has any content
    const hasContent =
      parsed.title?.trim().length > 0 ||
      parsed.content?.trim().length > 0 ||
      parsed.url?.trim().length > 0 ||
      Boolean(parsed.image_uri) ||
      (parsed.tags && parsed.tags.length > 0);

    if (!hasContent) {
      await clearDraft();
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to read draft:', error);
    return null;
  }
}

export async function clearDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear draft:', error);
  }
}
