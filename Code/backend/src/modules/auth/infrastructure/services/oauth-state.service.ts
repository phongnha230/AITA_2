import { createHmac, randomBytes } from 'node:crypto';
import { redisConnection } from '../../../../infrastructure/redis/redis.client.js';
import { env } from '../../../../infrastructure/config/env.js';
import { AppError } from '../../../../shared/domain/exceptions/app.error.js';

export class OAuthStateService {
  private readonly memoryStates = new Map<string, number>();

  private hash(state: string): string {
    return createHmac('sha256', env.JWT_SECRET).update(state, 'utf8').digest('hex');
  }

  async create(ttlSeconds: number = 600): Promise<string> {
    const state = randomBytes(32).toString('base64url');
    const key = `aita:oauth-state:${this.hash(state)}`;
    if (redisConnection.status === 'ready') {
      await redisConnection.set(key, '1', 'EX', ttlSeconds);
      return state;
    }
    if (env.NODE_ENV === 'production') {
      throw new AppError('Dịch vụ đăng nhập Google tạm thời không khả dụng.', 503, 'AUTH_STORE_UNAVAILABLE');
    }
    this.memoryStates.set(key, Date.now() + ttlSeconds * 1000);
    return state;
  }

  async consume(state: string): Promise<boolean> {
    const key = `aita:oauth-state:${this.hash(state)}`;
    if (redisConnection.status === 'ready') {
      const result = await redisConnection.eval(
        `local value = redis.call('GET', KEYS[1])
         if value then redis.call('DEL', KEYS[1]); return 1 end
         return 0`,
        1,
        key
      );
      return result === 1;
    }
    if (env.NODE_ENV === 'production') {
      throw new AppError('Dịch vụ đăng nhập Google tạm thời không khả dụng.', 503, 'AUTH_STORE_UNAVAILABLE');
    }
    const expiresAt = this.memoryStates.get(key);
    this.memoryStates.delete(key);
    return expiresAt !== undefined && expiresAt >= Date.now();
  }
}

export const oauthStateService = new OAuthStateService();
