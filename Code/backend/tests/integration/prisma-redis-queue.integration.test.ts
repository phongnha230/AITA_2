import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import prisma from '../../src/infrastructure/database/prisma.client.js';
import { redisConnection } from '../../src/infrastructure/redis/redis.client.js';
import { addGradingJob, gradingQueue } from '../../src/infrastructure/queue/bullmq.queue.js';

const describeInfrastructure = process.env.RUN_INFRA_INTEGRATION === 'true' ? describe : describe.skip;

describeInfrastructure('disposable Prisma, Redis and BullMQ infrastructure', () => {
  beforeAll(async () => {
    await prisma.$connect();
    if (redisConnection.status === 'wait') await redisConnection.connect();
  });

  afterAll(async () => {
    await gradingQueue.obliterate({ force: true });
    await gradingQueue.close();
    await redisConnection.quit();
    await prisma.$disconnect();
  });

  it('connects to the disposable SQL database', async () => {
    const result = await prisma.$queryRaw<Array<{ value: number }>>`SELECT 1 AS value`;
    expect(Number(result[0]?.value)).toBe(1);
  });

  it('connects to Redis and enqueues a grading job', async () => {
    await expect(redisConnection.ping()).resolves.toBe('PONG');
    const job = await addGradingJob({
      submissionId: '00000000-0000-0000-0000-000000000001',
      stagedFolderPath: '/tmp/aita-ci',
      language: 'C',
    });
    expect(job.id).toBeTruthy();
    expect(await gradingQueue.getJob(job.id ?? '')).not.toBeNull();
  });
});
