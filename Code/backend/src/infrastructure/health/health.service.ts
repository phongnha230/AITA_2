import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { IHealthService, HealthSnapshot } from '../../application/services/health.service.interface.js';
import { logger } from '../logging/logger.js';

export class HealthService implements IHealthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: Redis
  ) {}

  async check(): Promise<HealthSnapshot> {
    const snapshot: HealthSnapshot = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: { server: 'HEALTHY', database: 'CONNECTED', redis: 'CONNECTED' },
    };
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      snapshot.services.database = 'DISCONNECTED';
      snapshot.status = 'DEGRADED';
      logger.error('health_database_failed', { stage: 'HEALTHCHECK', error });
    }
    try {
      if (this.redis.status === 'wait') await this.redis.connect();
      const pong = await this.redis.ping();
      snapshot.services.redis = pong === 'PONG' ? 'CONNECTED' : 'UNEXPECTED_RESPONSE';
      if (pong !== 'PONG') snapshot.status = 'DEGRADED';
    } catch (error) {
      snapshot.services.redis = 'DISCONNECTED';
      snapshot.status = 'DEGRADED';
      logger.error('health_redis_failed', { stage: 'HEALTHCHECK', error });
    }
    return snapshot;
  }
}
