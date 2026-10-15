import { NextFunction, Request, Response } from 'express';
import { redisConnection } from '../../../../infrastructure/redis/redis.client.js';
import { env } from '../../../../infrastructure/config/env.js';
import { AppError } from '../../../../shared/domain/exceptions/app.error.js';

interface RateLimitOptions {
  scope: string;
  max: number;
  windowSeconds: number;
  identity: (request: Request) => string;
}

interface MemoryCounter {
  count: number;
  expiresAt: number;
}

const memoryCounters = new Map<string, MemoryCounter>();

export const createAuthRateLimiter = (options: RateLimitOptions) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const rawIdentity = options.identity(req).trim().toLowerCase();
    const key = `aita:rate:${options.scope}:${req.ip || 'unknown'}:${rawIdentity}`;

    try {
      if (redisConnection.status === 'ready') {
        const result = await redisConnection
          .multi()
          .incr(key)
          .expire(key, options.windowSeconds, 'NX')
          .exec();
        const count = Number(result?.[0]?.[1] ?? 0);
        if (count > options.max) {
          throw new AppError('Quá nhiều yêu cầu. Vui lòng thử lại sau.', 429, 'AUTH_RATE_LIMITED');
        }
        next();
        return;
      }

      if (env.NODE_ENV === 'production') {
        throw new AppError('Dịch vụ xác thực tạm thời không khả dụng.', 503, 'AUTH_STORE_UNAVAILABLE');
      }

      const now = Date.now();
      const current = memoryCounters.get(key);
      const counter = !current || current.expiresAt <= now
        ? { count: 1, expiresAt: now + options.windowSeconds * 1000 }
        : { ...current, count: current.count + 1 };
      memoryCounters.set(key, counter);
      if (counter.count > options.max) {
        throw new AppError('Quá nhiều yêu cầu. Vui lòng thử lại sau.', 429, 'AUTH_RATE_LIMITED');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
