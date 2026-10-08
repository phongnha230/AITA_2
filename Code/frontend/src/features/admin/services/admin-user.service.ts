import api from '../../../lib/api';
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

export const adminUserService = {
  /**
   * Lấy danh sách người dùng từ Backend với phân trang & bộ lọc
   */
  async list(query: UserQuery): Promise<{ users: AdminUser[]; meta: PageMeta }> {
    const params = Object.fromEntries(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    );
    const res = await api.get('/users', { params });
    const rawList = res.data?.data || [];
    return {
      users: rawList.map(normalizeUser),
      meta: res.data?.meta || {
        page: query.page,
        limit: query.limit,
        total: rawList.length,
        totalPages: Math.ceil(rawList.length / query.limit) || 1,
      },
    };
  },

  /**
   * Lấy toàn bộ người dùng để xuất CSV (tối đa 100 dòng theo phân trang backend)
   */
  async listAll(query: Omit<UserQuery, 'page' | 'limit'>): Promise<AdminUser[]> {
    const res = await this.list({ ...query, page: 1, limit: 100 });
    return res.users;
  },

  /**
   * Tạo hàng loạt tài khoản từ danh sách import CSV trực tiếp vào Backend
   */
  async createBatch(payloads: CreateUserPayload[]): Promise<{ created: number; skipped: number }> {
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
  },

  /**
   * Thống kê KPI người dùng thực từ Database
   */
  async stats(): Promise<UserStats> {
    const res = await api.get('/users/admin-dashboard');
    const d = res.data?.data;
    return {
      total: d?.totalUsers ?? 0,
      lecturers: d?.usersByRole?.lecturer ?? 0,
      students: d?.usersByRole?.student ?? 0,
      admins: d?.usersByRole?.admin ?? 0,
      suspended: d?.usersByStatus?.suspended ?? 0,
      pending: d?.usersByStatus?.pendingActivation ?? 0,
      newThisWeek: 0,
    };
  },

  /**
   * Tạo tài khoản người dùng đơn lẻ trực tiếp vào Backend
   */
  async create(payload: CreateUserPayload): Promise<AdminUser> {
    const res = await api.post('/users', {
      email: payload.email,
      fullName: payload.fullName,
      password: payload.password || 'password123',
      role: payload.role,
      status: payload.status || 'ACTIVE',
    });
    return normalizeUser(res.data.data);
  },

  /**
   * Cập nhật thông tin tài khoản người dùng trực tiếp vào Backend
   */
  async update(id: string, payload: UpdateUserPayload): Promise<AdminUser> {
    const res = await api.patch(`/users/${id}`, payload);
    return normalizeUser(res.data.data);
  },

  /**
   * Đặt lại mật khẩu tài khoản trực tiếp qua Backend API
   */
  async resetPassword(id: string, newPassword: string): Promise<void> {
    await api.post(`/users/${id}/reset-password`, { newPassword });
  },
};
