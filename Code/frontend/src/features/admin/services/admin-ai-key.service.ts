import api from '../../../lib/api';
import { loadMockDb, mockDelay, saveMockDb } from '../mocks/mock-db';
import type { AiApiKey, CreateAiKeyPayload } from '../types/admin.types';

function normalizeAiKey(raw: any): AiApiKey {
  return {
    id: raw.id,
    provider: raw.provider,
    keyAlias: raw.keyAlias,
    keyHint: raw.keyHint || '...',
    keyPreview: raw.keyHint ? `Key ${raw.keyHint}` : 'sk-***',
    purposeTitle: raw.purposeTitle || (raw.provider === 'GEMINI' ? 'Trợ lý AI & Chấm thi Rubric' : 'Dự phòng LLM Pool'),
    purposeNote: raw.purposeNote || 'Định tuyến tự động Multi-key Pool',
    dailyRequestLimit: raw.dailyRequestLimit ?? 1500,
    currentRequestsToday: raw.currentRequestsToday ?? 0,
    rpmLimit: raw.rpmLimit ?? 15,
    tpmLimit: raw.tpmLimit ?? (raw.rpmLimit ? raw.rpmLimit * 600 : 10000),
    latencyMs: raw.latencyMs ?? 280,
    consecutiveFailures: raw.consecutiveFailures ?? 0,
    isActive: raw.isActive ?? true,
    lastUsedAt: raw.lastUsedAt ? new Date(raw.lastUsedAt).toISOString() : null,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export const adminAiKeyService = {
  /**
   * Lấy danh sách API Keys trong cụm xoay vòng (Graceful Fallback)
   */
  async list(): Promise<AiApiKey[]> {
    try {
      const res = await api.get('/ai/api-keys');
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        return res.data.data.map(normalizeAiKey);
      }
      return [...loadMockDb().aiKeys];
    } catch (error) {
      console.warn('[AdminAiKeyService] Backend /ai/api-keys unreachable, using mock pool:', error);
      await mockDelay(60);
      return [...loadMockDb().aiKeys];
    }
  },

  /**
   * Thêm mới API Key vào hệ thống
   */
  async create(payload: CreateAiKeyPayload): Promise<AiApiKey> {
    try {
      const res = await api.post('/ai/api-keys', payload);
      return normalizeAiKey(res.data.data);
    } catch (error) {
      console.warn('[AdminAiKeyService] Create key API failed, using mock fallback:', error);
      await mockDelay(60);
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
        latencyMs: 220,
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
  },

  /**
   * Bật / Tắt trạng thái khóa API
   */
  async setActive(id: string, isActive: boolean): Promise<void> {
    try {
      await api.patch(`/ai/api-keys/${id}/toggle`, { isActive });
    } catch (error) {
      console.warn(`[AdminAiKeyService] Toggle key failed for ${id}, using mock:`, error);
      await mockDelay(60);
      const db = loadMockDb();
      db.aiKeys = db.aiKeys.map((k) => (k.id === id ? { ...k, isActive, updatedAt: new Date().toISOString() } : k));
      saveMockDb(db);
    }
  },

  /**
   * Kiểm tra tình trạng sức khỏe cụm khóa
   */
  async healthCheck(): Promise<{ healthy: number; total: number }> {
    try {
      const keys = await this.list();
      return {
        healthy: keys.filter((k) => k.isActive && k.consecutiveFailures < 3).length,
        total: keys.length,
      };
    } catch {
      await mockDelay(300);
      const db = loadMockDb();
      return { healthy: db.aiKeys.filter((k) => k.isActive).length, total: db.aiKeys.length };
    }
  },

  /**
   * Xóa API Key khỏi hệ thống
   */
  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/ai/api-keys/${id}`);
    } catch (error) {
      console.warn(`[AdminAiKeyService] Delete key failed for ${id}, using mock:`, error);
      await mockDelay(60);
      const db = loadMockDb();
      db.aiKeys = db.aiKeys.filter((k) => k.id !== id);
      saveMockDb(db);
    }
  },
};
