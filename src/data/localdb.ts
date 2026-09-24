/**
 * On-device storage (IndexedDB). Every record the teacher creates lives here
 * first, so the app works fully offline; changes are queued in the outbox and
 * sent to the server when a connection is available.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { COLLECTIONS } from '../../shared/records';
import type { Collection, RecordMap, SyncOp } from '../types';

interface VerniqDB extends DBSchema {
  classes: { key: string; value: RecordMap['classes'] };
  students: { key: string; value: RecordMap['students'] };
  attendance: { key: string; value: RecordMap['attendance'] };
  assessments: { key: string; value: RecordMap['assessments'] };
  lessons: { key: string; value: RecordMap['lessons'] };
  materials: { key: string; value: RecordMap['materials'] };
  glossary: { key: string; value: RecordMap['glossary'] };
  phrases: { key: string; value: RecordMap['phrases'] };
  outbox: { key: number; value: SyncOp & { queuedAt: number } };
  meta: { key: string; value: unknown };
}

let dbPromise: Promise<IDBPDatabase<VerniqDB>> | null = null;

function db() {
  dbPromise ??= openDB<VerniqDB>('verniq', 1, {
    upgrade(d) {
      for (const c of COLLECTIONS) d.createObjectStore(c, { keyPath: 'id' });
      d.createObjectStore('outbox', { autoIncrement: true });
      d.createObjectStore('meta');
    },
  });
  return dbPromise;
}

export type Snapshot = { [K in Collection]: RecordMap[K][] };

export const localdb = {
  async loadAll(): Promise<Snapshot> {
    const d = await db();
    const entries = await Promise.all(COLLECTIONS.map(async (c) => [c, await d.getAll(c)] as const));
    return Object.fromEntries(entries) as Snapshot;
  },
  async put<K extends Collection>(collection: K, doc: RecordMap[K]) {
    const d = await db();
    await d.put(collection, doc as never);
  },
  async remove(collection: Collection, id: string) {
    const d = await db();
    await d.delete(collection, id);
  },
  async replaceAll(snapshot: Snapshot) {
    const d = await db();
    const tx = d.transaction(COLLECTIONS, 'readwrite');
    for (const c of COLLECTIONS) {
      const store = tx.objectStore(c);
      await store.clear();
      for (const doc of snapshot[c]) await store.put(doc as never);
    }
    await tx.done;
  },
  async enqueue(op: SyncOp) {
    const d = await db();
    await d.add('outbox', { ...op, queuedAt: Date.now() });
  },
  async outbox(): Promise<{ key: number; op: SyncOp }[]> {
    const d = await db();
    const tx = d.transaction('outbox');
    const out: { key: number; op: SyncOp }[] = [];
    let cursor = await tx.store.openCursor();
    while (cursor) {
      const { queuedAt: _q, ...op } = cursor.value;
      void _q;
      out.push({ key: cursor.key, op: op as SyncOp });
      cursor = await cursor.continue();
    }
    return out;
  },
  async dequeue(keys: number[]) {
    const d = await db();
    const tx = d.transaction('outbox', 'readwrite');
    for (const k of keys) await tx.store.delete(k);
    await tx.done;
  },
  async getMeta<T>(key: string): Promise<T | undefined> {
    return (await (await db()).get('meta', key)) as T | undefined;
  },
  async setMeta(key: string, value: unknown) {
    await (await db()).put('meta', value, key);
  },
  async wipe() {
    const d = await db();
    const stores = [...COLLECTIONS, 'outbox', 'meta'] as const;
    const tx = d.transaction(stores, 'readwrite');
    for (const s of stores) await tx.objectStore(s).clear();
    await tx.done;
  },
};
