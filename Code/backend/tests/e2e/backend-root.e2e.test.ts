import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { configureTestEnvironment } from '../helpers/test-env.js';

vi.mock('../../src/infrastructure/queue/bullmq.queue.js', () => ({
  enqueueSubmission: vi.fn(),
  getGradingJobStatus: vi.fn(),
  gradingQueue: {},
}));

describe('backend HTTP server', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    configureTestEnvironment();
    const { default: app } = await import('../../src/app.js');

    server = await new Promise<Server>((resolve, reject) => {
      const candidate = app.listen(0, '127.0.0.1', () => resolve(candidate));
      candidate.once('error', reject);
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }

    const [{ redisConnection }, { default: prisma }] = await Promise.all([
      import('../../src/infrastructure/redis/redis.client.js'),
      import('../../src/infrastructure/database/prisma.client.js'),
    ]);

    try {
      redisConnection.disconnect();
      await prisma.$disconnect();
    } catch (error) {
      console.error('[E2E cleanup] Failed to close infrastructure clients:', error);
      throw error;
    }
  });

  it('serves the public service descriptor with security headers', async () => {
    const response = await fetch(baseUrl);
    const body = (await response.json()) as {
      project: string;
      status: string;
    };

    expect(response.status).toBe(200);
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(body.project).toContain('AITA');
    expect(body.status).toBe('online');
  });
});
