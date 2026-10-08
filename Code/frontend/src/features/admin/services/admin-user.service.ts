import api from '../../../lib/api';
import { loadMockDb, mockDelay, saveMockDb } from '../mocks/mock-db';
import { CLASS_CATALOG } from '../mocks/ops.mock';
import type { AdminUser, CreateUserPayload, PageMeta, UpdateUserPayload, UserQuery, UserStats } from '../types/admin.types';

function normalizeUser(raw: any): AdminUser {
  return {
    id: raw.id,
    email: raw.email,
    fullName: raw.fullName,
    avatarUrl: raw.avatarUrl ?? null,
    role: raw.role,
    status: raw.status,
    userCode: raw.userCode ?? (raw.email.split('@')[0]?.toUpperCase()),
    subtitle: raw.role === 'LECTURER' ? 'Giảng viên' : raw.role === 'ADMIN' ? 'Quản trị viên' : 'Sinh viên',
    department: raw.department ?? (raw.role === 'LECTURER' ? 'Bộ môn Kỹ thuật phần mềm' : 'Khoa CNTT'),
    departmentNote: raw.departmentNote ?? null,
    assignedClasses: raw.assignedClasses ?? [],
    sandboxAiEnabled: raw.sandboxAiEnabled ?? true,
    mustChangePassword: raw.mustChangePassword ?? false,
    lastLoginAt: raw.lastLoginAt ? new Date(raw.lastLoginAt).toISOString() : null,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : new Date().toISOString(),
  };
}

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
    meta: { page: query.page, limit: query.limit, total: filtered.length, totalPages: Math.ceil(filtered.length / query.limit) || 1 },
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
  /**
   * Lấy danh sách người dùng với phân trang & bộ lọc (Graceful Fallback)
   */
  async list(query: UserQuery): Promise<{ users: AdminUser[]; meta: PageMeta }> {
    try {
      const params = Object.fromEntries(
        Object.entries(query).filter(([, v]) => v !== undefined && v !== '' && v !== null)
      );
      const res = await api.get('/users', { params });
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        return {
          users: res.data.data.map(normalizeUser),
          meta: res.data.meta || {
            page: query.page,
            limit: query.limit,
            total: res.data.data.length,
            totalPages: Math.ceil(res.data.data.length / query.limit) || 1,
          },
        };
      }
      return mockList(query);
    } catch (error) {
      console.warn('[AdminUserService] Backend /users unreachable, falling back to mock dataset:', error);
      await mockDelay(60);
      return mockList(query);
    }
  },

  /**
   * Lấy toàn bộ người dùng để xuất CSV
   */
  async listAll(query: Omit<UserQuery, 'page' | 'limit'>): Promise<AdminUser[]> {
    try {
      const res = await this.list({ ...query, page: 1, limit: 100 });
      return res.users;
    } catch {
      return mockList({ ...query, page: 1, limit: Number.MAX_SAFE_INTEGER }).users;
    }
  },

  /**
   * Tạo hàng loạt tài khoản từ danh sách import CSV
   */
  async createBatch(payloads: CreateUserPayload[]): Promise<{ created: number; skipped: number }> {
    try {
      const formatted = payloads.map((p) => ({
        email: p.email,
        fullName: p.fullName,
        password: p.password || 'password123',
        role: p.role,
        status: p.status || 'ACTIVE',
      }));
      const res = await api.post('/users/batch', { users: formatted });
      const createdCount =
        typeof res.data?.data?.count === 'number'
          ? res.data.data.count
          : Array.isArray(res.data?.data)
          ? res.data.data.length
          : payloads.length;
      return { created: createdCount, skipped: payloads.length - createdCount };
    } catch (error) {
      console.warn('[AdminUserService] Batch create failed, applying mock fallback:', error);
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
  },

  /**
   * Thống kê KPI người dùng
   */
  async stats(): Promise<UserStats> {
    try {
      const res = await api.get('/users/admin-dashboard');
      const d = res.data?.data;
      if (d) {
        return {
          total: d.totalUsers ?? 0,
          lecturers: d.usersByRole?.lecturer ?? 0,
          students: d.usersByRole?.student ?? 0,
          admins: d.usersByRole?.admin ?? 0,
          suspended: d.usersByStatus?.suspended ?? 0,
          pending: d.usersByStatus?.pendingActivation ?? 0,
          newThisWeek: 12,
        };
      }
    } catch (error) {
      console.warn('[AdminUserService] Dashboard stats unavailable, using mock:', error);
    }
    return mockStats();
  },

  /**
   * Tạo tài khoản người dùng đơn lẻ
   */
  async create(payload: CreateUserPayload): Promise<AdminUser> {
    try {
      const res = await api.post('/users', {
        email: payload.email,
        fullName: payload.fullName,
        password: payload.password || 'password123',
        role: payload.role,
        status: payload.status || 'ACTIVE',
      });
      return normalizeUser(res.data.data);
    } catch (error: any) {
      console.warn('[AdminUserService] API create user failed, falling back to mock:', error);
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
  },

  /**
   * Cập nhật thông tin tài khoản người dùng
   */
  async update(id: string, payload: UpdateUserPayload): Promise<AdminUser> {
    try {
      const res = await api.patch(`/users/${id}`, payload);
      return normalizeUser(res.data.data);
    } catch (error) {
      console.warn(`[AdminUserService] API update user failed for ${id}, fallback mock:`, error);
      await mockDelay(60);
      return mockPatch(id, payload);
    }
  },

  /**
   * Đặt lại mật khẩu tài khoản
   */
  async resetPassword(id: string, newPassword: string): Promise<void> {
    try {
      await api.post(`/users/${id}/reset-password`, { newPassword });
    } catch (error) {
      console.warn(`[AdminUserService] API reset password failed for ${id}, fallback mock:`, error);
      await mockDelay(60);
      mockPatch(id, { mustChangePassword: true });
    }
  },
};
