import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  enqueueMutation,
  getQueuedMutations,
  removeQueuedMutation,
  clearQueuedMutations,
} from '../../src/services/queue.service';

describe('queue.service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('enqueues mutations and retrieves them in order', async () => {
    const mut1 = await enqueueMutation({
      userId: 'user-1',
      input: {
        type: 'note',
        title: 'Offline Note 1',
        content: 'Content 1',
      },
    });

    const mut2 = await enqueueMutation({
      userId: 'user-1',
      input: {
        type: 'link',
        title: 'Offline Link',
        url: 'https://offline.com',
      },
    });

    const queue = await getQueuedMutations();
    expect(queue.length).toBe(2);
    expect(queue[0].id).toBe(mut1.id);
    expect(queue[1].id).toBe(mut2.id);
  });

  it('removes individual mutations from the queue', async () => {
    const mut = await enqueueMutation({
      userId: 'user-1',
      input: {
        type: 'note',
        title: 'To Be Removed',
      },
    });

    await removeQueuedMutation(mut.id);
    const queue = await getQueuedMutations();
    expect(queue.length).toBe(0);
  });

  it('clears all mutations', async () => {
    await enqueueMutation({
      userId: 'user-1',
      input: { type: 'note', title: 'Note A' },
    });
    await enqueueMutation({
      userId: 'user-1',
      input: { type: 'note', title: 'Note B' },
    });

    await clearQueuedMutations();
    const queue = await getQueuedMutations();
    expect(queue.length).toBe(0);
  });
});
