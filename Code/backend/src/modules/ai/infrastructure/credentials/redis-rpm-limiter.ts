import crypto from 'node:crypto';
import type { Redis } from 'ioredis';

const WINDOW_MS = 60_000;
const KEY_TTL_MS = 120_000;

const RESERVE_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local cutoff = now - tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]
redis.call('ZREMRANGEBYSCORE', key, 0, cutoff)
local count = redis.call('ZCARD', key)
if count >= limit then
  return 0
end
redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, tonumber(ARGV[5]))
return 1
`;

export interface RpmReservation {
  redisKey: string;
  member: string;
}

export interface IRpmLimiter {
  reserve(keyId: string, limit: number, now?: Date): Promise<RpmReservation | null>;
  release(reservation: RpmReservation): Promise<void>;
}

export class RedisRpmLimiter implements IRpmLimiter {
  constructor(private readonly redis: Redis) {}

  public async reserve(
    keyId: string,
    limit: number,
    now: Date = new Date()
  ): Promise<RpmReservation | null> {
    const redisKey = `ai:key:${keyId}:rpm`;
    const member = `${now.getTime()}:${crypto.randomUUID()}`;
    const result = await this.redis.eval(
      RESERVE_SCRIPT,
      1,
      redisKey,
      String(now.getTime()),
      String(WINDOW_MS),
      String(limit),
      member,
      String(KEY_TTL_MS)
    );
    return Number(result) === 1 ? { redisKey, member } : null;
  }

  public async release(reservation: RpmReservation): Promise<void> {
    await this.redis.zrem(reservation.redisKey, reservation.member);
  }
}
