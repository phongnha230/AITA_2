import api from '../../../lib/api';
import type { AiApiKey, CreateAiKeyPayload } from '../types/admin.types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const requiredString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`AI key response thiếu ${field}.`);
  return value;
};

const requiredNumber = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`AI key response có ${field} không hợp lệ.`);
  }
  return value;
};

const optionalDate = (value: unknown): string | null =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value))
    ? new Date(value).toISOString()
    : null;

function normalizeAiKey(value: unknown): AiApiKey {
  if (!isRecord(value)) throw new Error('AI key response không hợp lệ.');
  const raw = value;
  const provider = requiredString(raw.provider, 'provider');
  if (!['GEMINI', 'OPENAI', 'ANTHROPIC', 'DEEPSEEK'].includes(provider)) {
    throw new Error('AI key response có provider không được hỗ trợ.');
  }
  const availabilityStatus = requiredString(raw.availabilityStatus, 'availabilityStatus');
  if (!['AVAILABLE', 'COOLDOWN', 'QUOTA_EXHAUSTED', 'DISABLED'].includes(availabilityStatus)) {
    throw new Error('AI key response có trạng thái không hợp lệ.');
  }
  return {
    id: requiredString(raw.id, 'id'),
    provider: provider as AiApiKey['provider'],
    source: 'DASHBOARD',
    keyAlias: requiredString(raw.keyAlias, 'keyAlias'),
    keyHint: requiredString(raw.keyHint, 'keyHint'),
    keyPreview: `Key ${requiredString(raw.keyHint, 'keyHint')}`,
    purposeTitle: typeof raw.purposeTitle === 'string'
      ? raw.purposeTitle
      : provider === 'GEMINI' ? 'Trợ lý AI & Chấm thi Rubric' : 'Dự phòng LLM Pool',
    purposeNote: typeof raw.purposeNote === 'string'
      ? raw.purposeNote
      : 'Định tuyến tự động Multi-key Pool',
    dailyRequestLimit: requiredNumber(raw.dailyRequestLimit, 'dailyRequestLimit'),
    currentRequestsToday: requiredNumber(raw.currentRequestsToday, 'currentRequestsToday'),
    usageDate: optionalDate(raw.usageDate),
    rpmLimit: requiredNumber(raw.rpmLimit, 'rpmLimit'),
    tpmLimit: typeof raw.tpmLimit === 'number' ? raw.tpmLimit : undefined,
    latencyMs: typeof raw.latencyMs === 'number' ? raw.latencyMs : null,
    consecutiveFailures: requiredNumber(raw.consecutiveFailures, 'consecutiveFailures'),
    isActive: raw.isActive === true,
    cooldownUntil: optionalDate(raw.cooldownUntil),
    lastErrorCode: typeof raw.lastErrorCode === 'string' ? raw.lastErrorCode : null,
    availabilityStatus: availabilityStatus as AiApiKey['availabilityStatus'],
    lastUsedAt: optionalDate(raw.lastUsedAt),
    createdAt: optionalDate(raw.createdAt) ?? new Date(0).toISOString(),
    updatedAt: optionalDate(raw.updatedAt) ?? new Date(0).toISOString(),
  };
}

export const adminAiKeyService = {
  /**
   * Lấy danh sách API Keys thực từ Backend Database
   */
  async list(): Promise<AiApiKey[]> {
    const res = await api.get('/ai/api-keys');
    const rawList = res.data?.data || [];
    if (!Array.isArray(rawList)) throw new Error('Danh sách AI key không hợp lệ.');
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
      healthy: keys.filter((k) => k.availabilityStatus === 'AVAILABLE').length,
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
