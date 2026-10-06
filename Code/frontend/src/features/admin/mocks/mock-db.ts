import type { AdminSettings, AdminUser, AiApiKey, QueueJob } from '../types/admin.types';
import { seedAiKeys, seedJobs, seedUsers } from './mock-seed';

const STORAGE_KEY = 'aita_mock_db_v1';
const SETTINGS_KEY = 'aita_mock_settings_v1';

export interface MockDb {
  users: AdminUser[];
  aiKeys: AiApiKey[];
  jobs: QueueJob[];
}

export const DEFAULT_SETTINGS: AdminSettings = {
  router: { strategy: 'round-robin', tokensPerExam: 50000 },
  sandbox: { cpuLimit: 1, ramLimitMb: 512, timeoutMs: 2000, networkDisabled: true, seccompEnforced: true, forkBombShield: true },
  workersPaused: false,
};

const seed = (): MockDb => ({ users: seedUsers(), aiKeys: seedAiKeys(), jobs: seedJobs() });

let memory: MockDb | null = null;

export const saveMockDb = (db: MockDb): void => {
  memory = db;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage full or blocked: keep working from memory for this page session.
  }
};

/** Reads the mock DB from localStorage, seeding it on first use. */
export const loadMockDb = (): MockDb => {
  if (memory) return memory;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        memory = JSON.parse(raw) as MockDb;
        return memory;
      }
    } catch {
      // Corrupt JSON: fall through and re-seed.
    }
  }
  const fresh = seed();
  if (typeof window !== 'undefined') saveMockDb(fresh);
  else memory = fresh;
  return fresh;
};

export const loadSettings = (): AdminSettings => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SETTINGS_KEY) : null;
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AdminSettings>;
      return {
        router: { ...DEFAULT_SETTINGS.router, ...saved.router },
        sandbox: { ...DEFAULT_SETTINGS.sandbox, ...saved.sandbox },
        workersPaused: saved.workersPaused ?? false,
      };
    }
  } catch {
    // fall back to defaults
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (patch: Partial<AdminSettings>): AdminSettings => {
  const next = { ...loadSettings(), ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
};

export const resetMockDb = (): void => {
  memory = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch {
    // ignore
  }
};

/** Simulated network latency so loading states are visible. */
export const mockDelay = (ms = 250): Promise<void> => new Promise((r) => setTimeout(r, ms));
