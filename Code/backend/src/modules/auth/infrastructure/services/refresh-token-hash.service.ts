import { createHash, timingSafeEqual } from 'node:crypto';

export const hashRefreshToken = (token: string): string =>
  createHash('sha256').update(token, 'utf8').digest('hex');

export const refreshTokenHashesMatch = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left, 'utf8');
  const rightBuffer = Buffer.from(right, 'utf8');
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};
