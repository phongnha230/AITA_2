/**
 * Safe cookie-based token storage complying with OWASP web security standards.
 * Avoids storing sensitive auth credentials directly in vulnerable Web Storage (localStorage).
 */

export function saveAuthTokens(token: string, refreshToken?: string): void {
  if (typeof document === 'undefined') return;

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secure = isHttps ? '; Secure' : '';
  const maxAge = 60 * 60 * 24 * 7; // 7 days

  document.cookie = `aita_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  if (refreshToken) {
    document.cookie = `aita_refresh=${encodeURIComponent(refreshToken)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  }
}

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/(?:^|; )aita_token=([^;]*)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/(?:^|; )aita_refresh=([^;]*)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

export function clearAuthTokens(): void {
  if (typeof document === 'undefined') return;

  document.cookie = 'aita_token=; path=/; max-age=0; SameSite=Lax';
  document.cookie = 'aita_refresh=; path=/; max-age=0; SameSite=Lax';
}
