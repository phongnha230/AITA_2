import api from '../../../lib/api';
import type { AiApiKey, CreateAiKeyPayload } from '../types/admin.types';

export const adminAiKeyService = {
  async list(): Promise<AiApiKey[]> {
    const res = await api.get('/ai/api-keys');
    return res.data.data;
  },

  async create(payload: CreateAiKeyPayload): Promise<AiApiKey> {
    const res = await api.post('/ai/api-keys', payload);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/ai/api-keys/${id}`);
  },
};
