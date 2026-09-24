/**
 * Data, account and sync for the whole app.
 *
 * - Everything is read from and written to IndexedDB first (works offline).
 * - Each change is queued in an outbox and sent to the server in batches.
 * - The server copy is pulled on start, on reconnect and after sending, and
 *   merged with last-write-wins; queued local changes are never overwritten.
 * - "Use without an account" keeps everything on this device only; creating an
 *   account later uploads it all.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { COLLECTIONS } from '../../shared/records';
import { mergeGlossary } from '../../engine/glossary';
import { api, ApiError, NetworkError, type Session } from '../data/api';
import { localdb, type Snapshot } from '../data/localdb';
import type { ClassDoc, Collection, ConnectivityStatus, GlossaryEntry, LanguageCode, Phrase, RecordMap, SyncOp, TeacherProfile } from '../types';
import { uid } from '../utils';

type StoredSession = ({ mode: 'account' } & Session) | { mode: 'local'; teacher: TeacherProfile };

export interface SyncState {
  status: ConnectivityStatus;
  pending: number;
  lastSyncedAt?: number;
  error?: string;
  localOnly: boolean;
}

interface DataState {
  ready: boolean;
  session: StoredSession | null;
  teacher: TeacherProfile | null;
  records: Snapshot;
  signup: (data: { name: string; email: string; password: string; school?: string; district?: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  startLocal: (profile: { name: string; school?: string; district?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<TeacherProfile>) => Promise<void>;
  put: <K extends Collection>(collection: K, doc: Omit<RecordMap[K], 'updatedAt'> & { updatedAt?: number }) => Promise<RecordMap[K]>;
  putMany: <K extends Collection>(collection: K, docs: (Omit<RecordMap[K], 'updatedAt'> & { updatedAt?: number })[]) => Promise<void>;
  remove: (collection: Collection, id: string) => Promise<void>;
  activeClass: ClassDoc | null;
  setActiveClass: (id: string) => Promise<void>;
  /** Starter glossary merged with the teacher's own words, for a language */
  glossaryFor: (language: LanguageCode) => GlossaryEntry[];
  phrasesFor: (language: LanguageCode) => Phrase[];
  sync: SyncState;
  syncNow: () => Promise<void>;
  exportBackup: () => Promise<Blob>;
}

const EMPTY: Snapshot = Object.fromEntries(COLLECTIONS.map((c) => [c, []])) as unknown as Snapshot;
const DataContext = createContext<DataState | null>(null);

const MAX_BATCH_BYTES = 900_000;

export function DataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [records, setRecords] = useState<Snapshot>(EMPTY);
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [reachable, setReachable] = useState(true);
  const sessionRef = useRef<StoredSession | null>(null);
  sessionRef.current = session;
  const flushing = useRef(false);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ─── Load from device ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [s, snapshot, outbox, last] = await Promise.all([
        localdb.getMeta<StoredSession>('session'),
        localdb.loadAll(),
        localdb.outbox(),
        localdb.getMeta<number>('lastSyncedAt'),
      ]);
      setSession(s ?? null);
      setRecords(snapshot);
      setPending(outbox.length);
      setLastSyncedAt(last);
      setReady(true);
    })().catch((e) => {
      console.error('[data] could not open local storage', e);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const saveSession = useCallback(async (s: StoredSession | null) => {
    setSession(s);
    await localdb.setMeta('session', s);
  }, []);

  // ─── Sync ─────────────────────────────────────────────────
  const handleAuthFailure = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 401) {
      setError('Your session has expired. Sign in again to back up your work.');
      return true;
    }
    return false;
  }, []);

  const pull = useCallback(async () => {
    const s = sessionRef.current;
    if (!s || s.mode !== 'account') return;
    const boot = await api.bootstrap(s.token);
    const outbox = await localdb.outbox();
    const pendingKeys = new Set(outbox.map(({ op }) => `${op.collection}:${op.id}`));
    const local = await localdb.loadAll();
    const merged = {} as Record<Collection, unknown[]>;
    for (const c of COLLECTIONS) {
      const localById = new Map((local[c] as { id: string; updatedAt: number }[]).map((d) => [d.id, d]));
      const out: { id: string; updatedAt: number }[] = [];
      const seen = new Set<string>();
      for (const sd of boot.records[c] as { id: string; updatedAt: number }[]) {
        const ld = localById.get(sd.id);
        seen.add(sd.id);
        out.push(ld && pendingKeys.has(`${c}:${sd.id}`) && ld.updatedAt > sd.updatedAt ? ld : sd);
      }
      for (const ld of localById.values()) if (!seen.has(ld.id) && pendingKeys.has(`${c}:${ld.id}`)) out.push(ld);
      merged[c] = out;
    }
    await localdb.replaceAll(merged as unknown as Snapshot);
    setRecords(merged as unknown as Snapshot);
    const teacher = { ...boot.teacher };
    await saveSession({ ...s, teacher });
    const now = Date.now();
    setLastSyncedAt(now);
    await localdb.setMeta('lastSyncedAt', now);
  }, [saveSession]);

  const flush = useCallback(
    async (alsoPull = true) => {
      const s = sessionRef.current;
      if (!s || s.mode !== 'account' || flushing.current) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      flushing.current = true;
      setBusy(true);
      try {
        let queue = await localdb.outbox();
        while (queue.length) {
          // Batch by size so recorded audio does not exceed request limits
          const batch: typeof queue = [];
          let bytes = 0;
          for (const item of queue) {
            const size = JSON.stringify(item.op).length;
            if (batch.length && bytes + size > MAX_BATCH_BYTES) break;
            batch.push(item);
            bytes += size;
            if (batch.length >= 200) break;
          }
          const res = await api.sync(s.token, batch.map((b) => b.op));
          const failed = res.results.filter((r) => !r.ok);
          if (failed.length) console.warn('[sync] rejected by server', failed);
          await localdb.dequeue(batch.map((b) => b.key));
          queue = await localdb.outbox();
          setPending(queue.length);
        }
        if (alsoPull) await pull();
        setError(undefined);
        setReachable(true);
      } catch (e) {
        if (e instanceof NetworkError) setReachable(false);
        else if (!handleAuthFailure(e)) setError(e instanceof Error ? e.message : 'Sync failed');
      } finally {
        flushing.current = false;
        setBusy(false);
      }
    },
    [handleAuthFailure, pull],
  );

  const scheduleFlush = useCallback(() => {
    clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => void flush(false), 1200);
  }, [flush]);

  // Sync when signed in, when the connection returns, and every few minutes
  useEffect(() => {
    if (!ready || session?.mode !== 'account') return;
    void flush(true);
    const t = setInterval(() => void flush(true), 3 * 60 * 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session?.mode === 'account' ? session.token : null]);

  useEffect(() => {
    if (online && session?.mode === 'account') void flush(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  // ─── Writes ───────────────────────────────────────────────
  const enqueue = useCallback(
    async (op: SyncOp) => {
      if (sessionRef.current?.mode !== 'account') return;
      await localdb.enqueue(op);
      setPending((p) => p + 1);
      scheduleFlush();
    },
    [scheduleFlush],
  );

  const put = useCallback(
    async <K extends Collection>(collection: K, doc: Omit<RecordMap[K], 'updatedAt'> & { updatedAt?: number }) => {
      const full = { ...doc, updatedAt: Date.now() } as RecordMap[K];
      await localdb.put(collection, full);
      setRecords((r) => ({ ...r, [collection]: upsert(r[collection] as RecordMap[K][], full) }));
      await enqueue({ op: 'put', collection, id: full.id, data: full });
      return full;
    },
    [enqueue],
  );

  const putMany = useCallback(
    async <K extends Collection>(collection: K, docs: (Omit<RecordMap[K], 'updatedAt'> & { updatedAt?: number })[]) => {
      const now = Date.now();
      const full = docs.map((d) => ({ ...d, updatedAt: now }) as RecordMap[K]);
      for (const d of full) await localdb.put(collection, d);
      setRecords((r) => {
        let list = r[collection] as RecordMap[K][];
        for (const d of full) list = upsert(list, d);
        return { ...r, [collection]: list };
      });
      for (const d of full) await enqueue({ op: 'put', collection, id: d.id, data: d });
    },
    [enqueue],
  );

  const remove = useCallback(
    async (collection: Collection, id: string) => {
      await localdb.remove(collection, id);
      setRecords((r) => ({ ...r, [collection]: (r[collection] as { id: string }[]).filter((d) => d.id !== id) }));
      await enqueue({ op: 'delete', collection, id, updatedAt: Date.now() });
    },
    [enqueue],
  );

  // ─── Account ──────────────────────────────────────────────
  const adoptAccount = useCallback(
    async (res: Session) => {
      const previous = sessionRef.current;
      const s: StoredSession = { mode: 'account', ...res };
      await saveSession(s);
      sessionRef.current = s;
      if (previous?.mode === 'local') {
        // Upload everything created while using the app without an account
        const all = await localdb.loadAll();
        for (const c of COLLECTIONS) for (const d of all[c] as { id: string }[]) await localdb.enqueue({ op: 'put', collection: c, id: d.id, data: d });
        if (previous.teacher.activeClassId || previous.teacher.onboarded) {
          const patch = { activeClassId: previous.teacher.activeClassId, onboarded: previous.teacher.onboarded, school: previous.teacher.school || res.teacher.school, district: previous.teacher.district || res.teacher.district };
          const teacher = await api.updateMe(res.token, patch).catch(() => ({ ...res.teacher, ...patch }));
          const updated: StoredSession = { mode: 'account', ...res, teacher };
          await saveSession(updated);
          sessionRef.current = updated;
        }
      } else if (!previous || previous.mode !== 'account' || previous.teacher.id !== res.teacher.id) {
        await localdb.replaceAll(EMPTY);
        setRecords(EMPTY);
      }
      setPending((await localdb.outbox()).length);
      await flush(true);
    },
    [flush, saveSession],
  );

  const signup = useCallback(async (data: Parameters<DataState['signup']>[0]) => adoptAccount(await api.signup(data)), [adoptAccount]);
  const login = useCallback(async (email: string, password: string) => adoptAccount(await api.login(email, password)), [adoptAccount]);

  const startLocal = useCallback(
    async (profile: { name: string; school?: string; district?: string }) => {
      await saveSession({ mode: 'local', teacher: { id: `local-${uid('t')}`, email: '', onboarded: false, ...profile } });
    },
    [saveSession],
  );

  const logout = useCallback(async () => {
    await localdb.wipe();
    setRecords(EMPTY);
    setPending(0);
    setSession(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<TeacherProfile>) => {
      const s = sessionRef.current;
      if (!s) return;
      const teacher = { ...s.teacher, ...patch };
      await saveSession({ ...s, teacher } as StoredSession);
      if (s.mode === 'account') {
        try {
          await api.updateMe(s.token, patch);
        } catch (e) {
          // Profile changes are small; they will be re-sent on the next change
          if (!(e instanceof NetworkError)) console.warn('[profile]', e);
        }
      }
    },
    [saveSession],
  );

  // ─── Derived ──────────────────────────────────────────────
  const teacher = session?.teacher ?? null;
  const activeClass = useMemo(() => {
    const classes = records.classes;
    return classes.find((c) => c.id === teacher?.activeClassId) ?? classes[0] ?? null;
  }, [records.classes, teacher?.activeClassId]);

  const setActiveClass = useCallback((id: string) => updateProfile({ activeClassId: id }), [updateProfile]);

  const glossaryFor = useCallback((language: LanguageCode) => mergeGlossary(language, records.glossary), [records.glossary]);
  const phrasesFor = useCallback((language: LanguageCode) => records.phrases.filter((p) => p.language === language), [records.phrases]);

  const status: ConnectivityStatus = session?.mode !== 'account'
    ? 'offline'
    : !online || !reachable
      ? 'offline'
      : busy
        ? 'syncing'
        : error
          ? 'sync-required'
          : 'online';

  const syncNow = useCallback(async () => {
    setReachable(true);
    await flush(true);
  }, [flush]);

  const exportBackup = useCallback(async () => {
    const all = await localdb.loadAll();
    return new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), teacher, records: all }, null, 2)], { type: 'application/json' });
  }, [teacher]);

  const value = useMemo<DataState>(
    () => ({
      ready,
      session,
      teacher,
      records,
      signup,
      login,
      startLocal,
      logout,
      updateProfile,
      put,
      putMany,
      remove,
      activeClass,
      setActiveClass,
      glossaryFor,
      phrasesFor,
      sync: { status, pending, lastSyncedAt, error, localOnly: session?.mode === 'local' },
      syncNow,
      exportBackup,
    }),
    [ready, session, teacher, records, signup, login, startLocal, logout, updateProfile, put, putMany, remove, activeClass, setActiveClass, glossaryFor, phrasesFor, status, pending, lastSyncedAt, error, syncNow, exportBackup],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function upsert<T extends { id: string }>(list: T[], doc: T): T[] {
  const i = list.findIndex((d) => d.id === doc.id);
  if (i === -1) return [...list, doc];
  const next = list.slice();
  next[i] = doc;
  return next;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataState {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
