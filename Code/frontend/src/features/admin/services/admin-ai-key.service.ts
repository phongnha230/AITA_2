import api from '../../../lib/api';
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
   * Lấy danh sách API Keys thực từ Backend Database
   */
  async list(): Promise<AiApiKey[]> {
    const res = await api.get('/ai/api-keys');
    const rawList = res.data?.data || [];
    return rawList.map(normalizeAiKey);
  },

  /**
   * Thêm mới API Key vào Backend (được mã hóa AES-256 an toàn)
   */
  async create(payload: CreateAiKeyPayload): Promise<AiApiKey> {
    const res = await api.post('/ai/api-keys', payload);
    return normalizeAiKey(res.data.data);
  },

  /**
   * Bật / Tắt trạng thái khóa API trên Backend
   */
  async setActive(id: string, isActive: boolean): Promise<void> {
    await api.patch(`/ai/api-keys/${id}/toggle`, { isActive });
  },

  /**
   * Kiểm tra tình trạng sức khỏe cụm khóa từ danh sách thực
   */
  async healthCheck(): Promise<{ healthy: number; total: number }> {
    const keys = await this.list();
    return {
      healthy: keys.filter((k) => k.isActive && k.consecutiveFailures < 3).length,
      total: keys.length,
    };
  },

  /**
   * Xóa API Key khỏi Backend Database
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/ai/api-keys/${id}`);
  },
};
