import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { IHealthService, HealthSnapshot } from '../../application/services/health.service.interface.js';
import { logger } from '../logging/logger.js';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { env } from '../config/env.js';

export class HealthService implements IHealthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: Redis
  ) {}

  async check(): Promise<HealthSnapshot> {
    const snapshot: HealthSnapshot = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        server: 'HEALTHY',
        database: 'CONNECTED',
        redis: 'CONNECTED',
        fer201: env.FER201_GRADING_ENABLED ? 'READY' : 'DISABLED',
        chromium: 'AVAILABLE',
        ai: env.GEMINI_API_KEY || env.GEMINI_API_KEYS ? 'CONFIGURED' : 'MISSING_KEY',
        fer201Migration: 'APPLIED',
      },
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
    try {
      await this.prisma.submissionParticipant.count({ take: 1 });
    } catch (error) {
      snapshot.services.fer201Migration = 'MISSING';
      logger.error('health_fer201_migration_failed', { stage: 'HEALTHCHECK', error });
    }
    try {
      await fs.access(chromium.executablePath());
    } catch (error) {
      snapshot.services.chromium = 'UNAVAILABLE';
      logger.error('health_fer201_runtime_failed', { stage: 'HEALTHCHECK', error });
    }
    if (env.FER201_GRADING_ENABLED) {
      const fer201Ready = snapshot.services.database === 'CONNECTED'
        && snapshot.services.redis === 'CONNECTED'
        && snapshot.services.chromium === 'AVAILABLE'
        && snapshot.services.ai === 'CONFIGURED'
        && snapshot.services.fer201Migration === 'APPLIED';
      snapshot.services.fer201 = fer201Ready ? 'READY' : 'NOT_READY';
      if (!fer201Ready) snapshot.status = 'DEGRADED';
    }
    return snapshot;
  }
}
