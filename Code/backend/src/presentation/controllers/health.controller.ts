import { Request, Response } from 'express';
import prisma from '../../infrastructure/database/prisma.client.js';
import { redisConnection } from '../../infrastructure/queue/redis.client.js';

export class HealthController {
  public static async checkHealth(req: Request, res: Response): Promise<void> {
    const healthStatus: Record<string, any> = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        server: 'HEALTHY',
        database: 'UNKNOWN',
        redis: 'UNKNOWN',
      },
    };

    // Kiểm tra Database
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthStatus.services.database = 'CONNECTED';
    } catch (err: any) {
      healthStatus.services.database = `DISCONNECTED (${err.message})`;
      healthStatus.status = 'DEGRADED';
    }

    // Kiểm tra Redis
    try {
      await redisConnection.connect().catch(() => {});
      const pong = await redisConnection.ping();
      healthStatus.services.redis = pong === 'PONG' ? 'CONNECTED' : 'UNEXPECTED_RESPONSE';
    } catch (err: any) {
      healthStatus.services.redis = `DISCONNECTED (${err.message})`;
      healthStatus.status = 'DEGRADED';
    }

    res.status(200).json({
      success: true,
      data: healthStatus,
    });
  }
}
