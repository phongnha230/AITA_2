import { CookieOptions, Response } from 'express';
import { env } from '../../../infrastructure/config/env.js';

export const getCookieOptions = (maxAgeMs: number): CookieOptions => {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
};

export const setAuthCookies = (res: Response, token: string, refreshToken?: string): void => {
  // Access Token: 15 minutes (or according to policy)
  res.cookie('token', token, getCookieOptions(15 * 60 * 1000));
  if (refreshToken) {
    // Refresh Token: 30 days
    res.cookie('refreshToken', refreshToken, getCookieOptions(30 * 24 * 60 * 60 * 1000));
  }
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('token', getCookieOptions(0));
  res.clearCookie('refreshToken', getCookieOptions(0));
};
