import { Redis } from 'ioredis';
import { env } from '../config/env.js';

export const redisConnection = new Redis({
  host: env.REDIS_HOST || '127.0.0.1',
  port: Number(env.REDIS_PORT) || 6379,
  password: env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
  maxRetriesPerRequest: null,
});
