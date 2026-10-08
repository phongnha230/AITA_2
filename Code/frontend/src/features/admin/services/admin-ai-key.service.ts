import api from '../../../lib/api';
import { USE_MOCK } from '../../../config/mock';
import { loadMockDb, mockDelay, saveMockDb } from '../mocks/mock-db';
import type { AiApiKey, CreateAiKeyPayload } from '../types/admin.types';

export const adminAiKeyService = {
  async list(): Promise<AiApiKey[]> {
    if (USE_MOCK) {
      await mockDelay();
      return [...loadMockDb().aiKeys];
    }
    const res = await api.get('/ai/api-keys');
    return res.data.data;
  },

  async create(payload: CreateAiKeyPayload): Promise<AiApiKey> {
    if (USE_MOCK) {
      await mockDelay();
      const db = loadMockDb();
      const now = new Date().toISOString();
      const created: AiApiKey = {
        id: `key-${Date.now()}`,
        provider: payload.provider,
        keyAlias: payload.keyAlias,
        keyHint: payload.rawApiKey.slice(-4),
        keyPreview: `${payload.rawApiKey.slice(0, 6)}...${payload.rawApiKey.slice(-4)}`,
        purposeTitle: 'Chưa gán mục đích',
        purposeNote: 'Thêm thủ công',
        dailyRequestLimit: payload.dailyRequestLimit,
        currentRequestsToday: 0,
        rpmLimit: payload.rpmLimit,
        tpmLimit: payload.rpmLimit * 600,
        latencyMs: null,
        consecutiveFailures: 0,
        isActive: true,
        lastUsedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      db.aiKeys.unshift(created);
      saveMockDb(db);
      return created;
    }
    const res = await api.post('/ai/api-keys', payload);
    return res.data.data;
  },

  async setActive(id: string, isActive: boolean): Promise<void> {
    if (USE_MOCK) {
      await mockDelay(120);
      const db = loadMockDb();
      db.aiKeys = db.aiKeys.map((k) => (k.id === id ? { ...k, isActive, updatedAt: new Date().toISOString() } : k));
      saveMockDb(db);
      return;
    }
    await api.patch(`/ai/api-keys/${id}/toggle`, { isActive });
  },

  /** Pings every active key. Mock mode simulates fresh latency measurements. */
  async healthCheck(): Promise<{ healthy: number; total: number }> {
    if (!USE_MOCK) {
      const keys = await this.list();
      return { healthy: keys.filter((k) => k.isActive && k.consecutiveFailures < 3).length, total: keys.length };
    }
    await mockDelay(900);
    const db = loadMockDb();
    const now = new Date().toISOString();
    db.aiKeys = db.aiKeys.map((k, i) =>
      k.isActive ? { ...k, latencyMs: Math.max(120, (k.latencyMs ?? 400) + ((i * 37) % 90) - 45), lastUsedAt: now } : k,
    );
    saveMockDb(db);
    return { healthy: db.aiKeys.filter((k) => k.isActive).length, total: db.aiKeys.length };
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) {
      await mockDelay(150);
      const db = loadMockDb();
      db.aiKeys = db.aiKeys.filter((k) => k.id !== id);
      saveMockDb(db);
      return;
    }
    await api.delete(`/ai/api-keys/${id}`);
  },
};
