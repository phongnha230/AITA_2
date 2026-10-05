import api from '../../../lib/api';
import type { AdminUser, CreateUserPayload, PageMeta, UpdateUserPayload, UserQuery } from '../types/admin.types';

export const adminUserService = {
  async list(query: UserQuery): Promise<{ users: AdminUser[]; meta: PageMeta }> {
    const params = Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== ''));
    const res = await api.get('/users', { params });
    return { users: res.data.data, meta: res.data.meta };
  },

  async create(payload: CreateUserPayload): Promise<AdminUser> {
    const res = await api.post('/users', payload);
    return res.data.data;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<AdminUser> {
    const res = await api.patch(`/users/${id}`, payload);
    return res.data.data;
  },

  async resetPassword(id: string, newPassword: string): Promise<void> {
    await api.post(`/users/${id}/reset-password`, { newPassword });
  },
};
