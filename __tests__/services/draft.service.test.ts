import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveDraft, getDraft, clearDraft } from '../../src/services/draft.service';
import { ItemDraft } from '../../src/types/item';

describe('draft.service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('saves and retrieves a valid draft', async () => {
    const draftInput = {
      type: 'note' as const,
      title: 'In-progress thoughts',
      content: 'Remember to check the docs',
      url: '',
      tags: ['research'],
    };

    await saveDraft(draftInput);
    const loaded = await getDraft();

    expect(loaded).not.toBeNull();
    expect(loaded?.title).toBe('In-progress thoughts');
    expect(loaded?.type).toBe('note');
    expect(loaded?.tags).toEqual(['research']);
    expect(loaded?.lastModified).toBeGreaterThan(0);
  });

  it('returns null if no draft exists', async () => {
    const loaded = await getDraft();
    expect(loaded).toBeNull();
  });

  it('clears draft properly', async () => {
    await saveDraft({
      type: 'link',
      title: 'Awesome library',
      content: '',
      url: 'https://reactnative.dev',
      tags: [],
    });

    let loaded = await getDraft();
    expect(loaded).not.toBeNull();

    await clearDraft();
    loaded = await getDraft();
    expect(loaded).toBeNull();
  });

  it('ignores empty drafts', async () => {
    await AsyncStorage.setItem(
      '@stashly/item_draft_v1',
      JSON.stringify({
        type: 'note',
        title: '',
        content: '',
        url: '',
        tags: [],
        lastModified: Date.now(),
      })
    );

    const loaded = await getDraft();
    expect(loaded).toBeNull();
  });
});
