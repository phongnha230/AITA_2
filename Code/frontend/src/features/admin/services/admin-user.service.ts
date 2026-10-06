import api from '../../../lib/api';
import { USE_MOCK } from '../../../config/mock';
import { loadMockDb, mockDelay, saveMockDb } from '../mocks/mock-db';
import { CLASS_CATALOG } from '../mocks/ops.mock';
import type { AdminUser, CreateUserPayload, PageMeta, UpdateUserPayload, UserQuery, UserStats } from '../types/admin.types';

const mockList = (query: UserQuery): { users: AdminUser[]; meta: PageMeta } => {
  const search = query.search?.trim().toLowerCase();
  const filtered = loadMockDb().users.filter(
    (u) =>
      (!query.role || u.role === query.role) &&
      (!query.status || u.status === query.status) &&
      (!search || `${u.fullName} ${u.email} ${u.userCode ?? ''}`.toLowerCase().includes(search)),
  );
  const start = (query.page - 1) * query.limit;
  return {
    users: filtered.slice(start, start + query.limit),
    meta: { page: query.page, limit: query.limit, total: filtered.length, totalPages: Math.ceil(filtered.length / query.limit) },
  };
};

const mockStats = (): UserStats => {
  const users = loadMockDb().users;
  const count = (fn: (u: AdminUser) => boolean) => users.filter(fn).length;
  return {
    total: users.length,
    lecturers: count((u) => u.role === 'LECTURER'),
    students: count((u) => u.role === 'STUDENT'),
    admins: count((u) => u.role === 'ADMIN'),
    suspended: count((u) => u.status === 'SUSPENDED'),
    pending: count((u) => u.status === 'PENDING_ACTIVATION'),
    newThisWeek: 12,
  };
};

const mockPatch = (id: string, patch: Partial<AdminUser>): AdminUser => {
  const db = loadMockDb();
  const index = db.users.findIndex((u) => u.id === id);
  if (index < 0) throw new Error('Không tìm thấy người dùng.');
  const updated = { ...db.users[index], ...patch, updatedAt: new Date().toISOString() };
  if (patch.assignedClasses) {
    const students = patch.assignedClasses.reduce((s, code) => s + (CLASS_CATALOG.find((c) => c.code === code)?.students ?? 0), 0);
    updated.departmentNote = `${patch.assignedClasses.length} lớp (${students} SV)`;
  }
  db.users[index] = updated;
  saveMockDb(db);
  return updated;
};

export const adminUserService = {
  async list(query: UserQuery): Promise<{ users: AdminUser[]; meta: PageMeta }> {
    if (USE_MOCK) {
      await mockDelay();
      return mockList(query);
    }
    const params = Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== ''));
    const res = await api.get('/users', { params });
    return { users: res.data.data, meta: res.data.meta };
  },

  /** Every user matching the filter (for CSV export). Real API is capped at 100 rows per request. */
  async listAll(query: Omit<UserQuery, 'page' | 'limit'>): Promise<AdminUser[]> {
    if (USE_MOCK) {
      await mockDelay(150);
      return mockList({ ...query, page: 1, limit: Number.MAX_SAFE_INTEGER }).users;
    }
    return (await this.list({ ...query, page: 1, limit: 100 })).users;
  },

  async createBatch(payloads: CreateUserPayload[]): Promise<{ created: number; skipped: number }> {
    if (USE_MOCK) {
      let created = 0;
      let skipped = 0;
      for (const p of payloads) {
        try {
          await this.create(p);
          created++;
        } catch {
          skipped++;
        }
      }
      return { created, skipped };
    }
    const res = await api.post('/users/batch', { users: payloads });
    const created = Array.isArray(res.data.data) ? res.data.data.length : payloads.length;
    return { created, skipped: payloads.length - created };
  },

  async stats(): Promise<UserStats> {
    if (USE_MOCK) {
      await mockDelay(150);
      return mockStats();
    }
    const total = async (extra: Partial<UserQuery>) => (await this.list({ page: 1, limit: 1, ...extra })).meta.total;
    const [all, lecturers, students, admins, suspended, pending] = await Promise.all([
      total({}),
      total({ role: 'LECTURER' }),
      total({ role: 'STUDENT' }),
      total({ role: 'ADMIN' }),
      total({ status: 'SUSPENDED' }),
      total({ status: 'PENDING_ACTIVATION' }),
    ]);
    return { total: all, lecturers, students, admins, suspended, pending };
  },

  async create(payload: CreateUserPayload): Promise<AdminUser> {
    if (USE_MOCK) {
      await mockDelay(60);
      const db = loadMockDb();
      if (db.users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
        throw new Error('Email đã tồn tại trong hệ thống.');
      }
      const now = new Date().toISOString();
      const code = `${payload.role === 'ADMIN' ? 'ADM' : payload.role === 'LECTURER' ? 'FE' : 'HE'}${Date.now().toString().slice(-5)}`;
      const created: AdminUser = {
        id: `u-${code.toLowerCase()}`,
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role,
        status: payload.status ?? 'ACTIVE',
        userCode: code,
        subtitle: 'Mới tạo',
        mustChangePassword: true,
        department: '—',
        avatarUrl: null,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
      };
      db.users.unshift(created);
      saveMockDb(db);
      return created;
    }
    const res = await api.post('/users', payload);
    return res.data.data;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<AdminUser> {
    if (USE_MOCK) {
      await mockDelay(150);
      return mockPatch(id, payload);
    }
    const res = await api.patch(`/users/${id}`, payload);
    return res.data.data;
  },

  async resetPassword(id: string, newPassword: string): Promise<void> {
    if (USE_MOCK) {
      await mockDelay(150);
      mockPatch(id, { mustChangePassword: true });
      return;
    }
    await api.post(`/users/${id}/reset-password`, { newPassword });
  },
};
