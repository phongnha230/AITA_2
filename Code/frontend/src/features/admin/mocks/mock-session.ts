import type { User } from '../../auth/services/auth.service';

const MOCK_ADMIN: User = {
  id: 'u-adm_root',
  email: 'admin@fpt.edu.vn',
  fullName: 'Quản trị viên Hệ thống',
  role: 'ADMIN',
};

/** In mock mode, signs in a fake admin so /admin/* is reachable without a backend. */
export const ensureMockSession = (): User => {
  try {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      const parsed = JSON.parse(stored) as User;
      if (parsed.role === 'ADMIN') return parsed;
    }
    localStorage.setItem('token', 'mock-admin-token');
    localStorage.setItem('user', JSON.stringify(MOCK_ADMIN));
  } catch {
    // localStorage unavailable; the in-memory user is still usable for this render.
  }
  return MOCK_ADMIN;
};
