import { CookieOptions, Response } from 'express';
import { env } from '../../../infrastructure/config/env.js';

export const getCookieOptions = (maxAgeMs: number): CookieOptions => {
  const isProduction = env.NODE_ENV === 'production';
  const sameSite = env.COOKIE_SAME_SITE;
  return {
    httpOnly: true,
    secure: isProduction || sameSite === 'none',
    sameSite,
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

const registrationCookieName = 'registrationChallenge';
const oauthStateCookieName = 'oauthState';

export const setRegistrationChallengeCookie = (res: Response, token: string): void => {
  res.cookie(registrationCookieName, token, getCookieOptions(10 * 60 * 1000));
};

export const clearRegistrationChallengeCookie = (res: Response): void => {
  res.clearCookie(registrationCookieName, getCookieOptions(0));
};

export const getRegistrationChallengeCookieName = (): string => registrationCookieName;

export const setOAuthStateCookie = (res: Response, state: string): void => {
  res.cookie(oauthStateCookieName, state, getCookieOptions(10 * 60 * 1000));
};

export const clearOAuthStateCookie = (res: Response): void => {
  res.clearCookie(oauthStateCookieName, getCookieOptions(0));
};

export const getOAuthStateCookieName = (): string => oauthStateCookieName;
