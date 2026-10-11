import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateItemInput } from '@/types/item';

const OFFLINE_QUEUE_KEY = '@stashly_offline_queue_v1';

export interface QueuedMutation {
  id: string;
  userId: string;
  input: CreateItemInput;
  createdAt: number;
}

export async function getQueuedMutations(): Promise<QueuedMutation[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to load offline mutation queue:', error);
    return [];
  }
}

export async function enqueueMutation(params: {
  userId: string;
  input: CreateItemInput;
}): Promise<QueuedMutation> {
  const mutation: QueuedMutation = {
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: params.userId,
    input: params.input,
    createdAt: Date.now(),
  };

  try {
    const queue = await getQueuedMutations();
    queue.push(mutation);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn('Failed to enqueue offline mutation:', error);
  }

  return mutation;
}

export async function removeQueuedMutation(mutationId: string): Promise<void> {
  try {
    const queue = await getQueuedMutations();
    const filtered = queue.filter((m) => m.id !== mutationId);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('Failed to remove queued mutation:', error);
  }
}

export async function clearQueuedMutations(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.warn('Failed to clear offline queue:', error);
  }
}
