import api from '../../../lib/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  avatarUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  redirectTo: string;
}

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { username, password });
    const data = response.data.data;
    if (typeof window !== 'undefined') {
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('aita_token', data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('user_role', data.user.role);
    }
    return data;
  },

  async register(data: { email: string; password: string; fullName: string; role?: string }): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    const authData = response.data.data;
    if (typeof window !== 'undefined') {
      if (authData.token) {
        localStorage.setItem('token', authData.token);
        localStorage.setItem('aita_token', authData.token);
      }
      if (authData.refreshToken) {
        localStorage.setItem('refreshToken', authData.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(authData.user));
      if (authData.user.role) localStorage.setItem('user_role', authData.user.role);
    }
    return authData;
  },

  async sendOtp(email: string, fullName?: string, recaptchaToken?: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/send-otp', { email, fullName, recaptchaToken });
    return response.data;
  },

  async verifyOtp(email: string, otp: string): Promise<{ valid: boolean }> {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data.data;
  },

  async getGoogleAuthUrl(): Promise<string> {
    const response = await api.get('/auth/google');
    return response.data.data.url;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/users/profile');
      if (response.data?.data && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data.data;
    } catch {
      try {
        const fallback = await api.get('/auth/me');
        if (fallback.data?.data && typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(fallback.data.data));
        }
        return fallback.data.data;
      } catch {
        return null;
      }
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('aita_token');
        localStorage.removeItem('aita_user');
        localStorage.removeItem('user_role');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
  },

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};
