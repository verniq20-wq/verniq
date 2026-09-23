import { sleep } from '../utils';

export interface SyncResult {
  updates: number;
  syncedAt: number;
}

/**
 * Synchronise offline content with the server.
 * Demo: simulates downloading a few updates with progress.
 */
export async function syncOfflineData(onProgress?: (progress: number, updates: number) => void): Promise<SyncResult> {
  const updates = 3;
  for (let p = 0; p <= 100; p += 8) {
    onProgress?.(Math.min(p, 100) / 100, updates);
    await sleep(110);
  }
  onProgress?.(1, updates);
  return { updates, syncedAt: Date.now() };
}
