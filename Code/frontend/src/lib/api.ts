import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;
    const url = config?.url || '';
    const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh-token'].some((path) =>
      url.includes(path),
    );

    if (error.response?.status !== 401 || !config || config._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    config._retry = true;
    refreshPromise ??= api
      .post('/auth/refresh-token')
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });

    try {
      await refreshPromise;
      return api(config);
    } catch {
      return Promise.reject(error);
    }
  }
);

export default api;
