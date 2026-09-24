/**
 * HTTP client for the Verniq API. On the website the API is same-origin; the
 * Android app is built with VITE_VERNIQ_API_URL pointing at the server.
 */
import type { Bootstrap, SyncOp, SyncResult, TeacherProfile } from '../types';

export const API_BASE = (import.meta.env.VITE_VERNIQ_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Thrown when the request never reached the server (offline, DNS, timeout). */
export class NetworkError extends Error {}

async function request<T>(path: string, init: RequestInit & { token?: string; timeoutMs?: number } = {}): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), init.timeoutMs ?? 20000);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new NetworkError('Could not reach the Verniq server.');
  } finally {
    clearTimeout(timer);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (body as { error?: string }).error ?? `Request failed (${res.status})`);
  return body as T;
}

export interface Session {
  token: string;
  expiresAt: number;
  teacher: TeacherProfile;
}

export const api = {
  signup: (data: { name: string; email: string; password: string; school?: string; district?: string }) =>
    request<Session>('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (email: string, password: string) => request<Session>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: (token: string) => request<TeacherProfile>('/api/me', { token }),
  updateMe: (token: string, patch: Partial<TeacherProfile>) => request<TeacherProfile>('/api/me', { method: 'PATCH', token, body: JSON.stringify(patch) }),
  bootstrap: (token: string) => request<Bootstrap>('/api/bootstrap', { token, timeoutMs: 45000 }),
  sync: (token: string, ops: SyncOp[]) =>
    request<{ results: SyncResult[]; serverTime: number }>('/api/sync', { method: 'POST', token, body: JSON.stringify({ ops }), timeoutMs: 45000 }),
  health: () => request<{ ok: boolean }>('/api/health', { timeoutMs: 6000 }),
};
