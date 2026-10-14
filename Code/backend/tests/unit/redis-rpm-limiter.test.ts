import { describe, expect, it, vi } from 'vitest';
import type { Redis } from 'ioredis';
import { RedisRpmLimiter } from '../../src/modules/ai/infrastructure/credentials/redis-rpm-limiter.js';

describe('RedisRpmLimiter', () => {
  it('reserves and releases a sliding-window slot', async () => {
    const evalMock = vi.fn().mockResolvedValue(1);
    const zremMock = vi.fn().mockResolvedValue(1);
    const redis = { eval: evalMock, zrem: zremMock } as unknown as Redis;
    const limiter = new RedisRpmLimiter(redis);
    const reservation = await limiter.reserve('key-1', 5, new Date('2026-10-14T10:00:00Z'));
    expect(reservation?.redisKey).toBe('ai:key:key-1:rpm');
    expect(evalMock).toHaveBeenCalledOnce();
    if (!reservation) throw new Error('Expected reservation');
    await limiter.release(reservation);
    expect(zremMock).toHaveBeenCalledWith(reservation.redisKey, reservation.member);
  });

  it('returns null when the key reached its RPM limit', async () => {
    const redis = { eval: vi.fn().mockResolvedValue(0) } as unknown as Redis;
    const limiter = new RedisRpmLimiter(redis);
    await expect(limiter.reserve('key-1', 1)).resolves.toBeNull();
  });
});
