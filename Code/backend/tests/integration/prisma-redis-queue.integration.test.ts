import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import prisma from '../../src/infrastructure/database/prisma.client.js';
import { redisConnection } from '../../src/infrastructure/redis/redis.client.js';
import { addGradingJob, gradingQueue } from '../../src/infrastructure/queue/bullmq.queue.js';
import { PrismaAiApiKeyRepository } from '../../src/modules/ai/infrastructure/repositories/prisma-ai-api-key.repository.js';
import { ApiKeyCipherService } from '../../src/modules/ai/infrastructure/security/api-key-cipher.service.js';
import { RedisRpmLimiter } from '../../src/modules/ai/infrastructure/credentials/redis-rpm-limiter.js';
import { GeminiCredentialPoolService } from '../../src/modules/ai/infrastructure/credentials/gemini-credential-pool.service.js';
import { PrismaAssignmentRepository } from '../../src/modules/assignment/infrastructure/repositories/prisma-assignment.repository.js';

const describeInfrastructure = process.env.RUN_INFRA_INTEGRATION === 'true' ? describe : describe.skip;

describeInfrastructure('disposable Prisma, Redis and BullMQ infrastructure', () => {
  beforeAll(async () => {
    await prisma.$connect();
    if (redisConnection.status === 'wait') await redisConnection.connect();
  });

  afterAll(async () => {
    await prisma.course.deleteMany({ where: { code: { startsWith: 'CI-DEL-' } } });
    await prisma.course.deleteMany({ where: { code: { startsWith: 'CI-USED-' } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'ci-assignment-delete-' } } });
    await prisma.aiApiKey.deleteMany({ where: { keyAlias: { startsWith: 'CI Gemini Pool' } } });
    const rpmKeys = await redisConnection.keys('ai:key:*:rpm');
    if (rpmKeys.length > 0) await redisConnection.del(...rpmKeys);
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

  it('enforces shared RPM and daily quota atomically across concurrent Gemini calls', async () => {
    const cipher = new ApiKeyCipherService(Buffer.alloc(32, 5).toString('base64'), 'legacy-secret');
    const encrypted = cipher.encrypt('integration-dashboard-key');
    const key = await prisma.aiApiKey.create({
      data: {
        provider: 'GEMINI',
        keyAlias: 'CI Gemini Pool Concurrent',
        keyHint: '...-key',
        ...encrypted,
        dailyRequestLimit: 2,
        rpmLimit: 2,
      },
    });
    const pool = new GeminiCredentialPoolService(
      new PrismaAiApiKeyRepository(prisma),
      new RedisRpmLimiter(redisConnection),
      cipher,
      []
    );

    const results = await Promise.allSettled([
      pool.execute('CHAT_GENERATION', async (apiKey) => apiKey),
      pool.execute('DOCUMENT_EMBEDDING', async (apiKey) => apiKey),
      pool.execute('QUERY_EMBEDDING', async (apiKey) => apiKey),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(2);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    const updated = await prisma.aiApiKey.findUniqueOrThrow({ where: { id: key.id } });
    expect(updated.currentRequestsToday).toBe(2);
  });

  it('resets stale daily usage at the UTC day boundary', async () => {
    const cipher = new ApiKeyCipherService(Buffer.alloc(32, 6).toString('base64'), 'legacy-secret');
    const encrypted = cipher.encrypt('integration-reset-key');
    const key = await prisma.aiApiKey.create({
      data: {
        provider: 'GEMINI',
        keyAlias: 'CI Gemini Pool UTC Reset',
        keyHint: '...-key',
        ...encrypted,
        dailyRequestLimit: 1,
        currentRequestsToday: 1,
        usageDate: new Date('2020-01-01T00:00:00.000Z'),
        rpmLimit: 5,
      },
    });
    const pool = new GeminiCredentialPoolService(
      new PrismaAiApiKeyRepository(prisma),
      new RedisRpmLimiter(redisConnection),
      cipher,
      []
    );

    await expect(pool.execute('GRADING_GENERATION', async (apiKey) => apiKey)).resolves.toBe(
      'integration-reset-key'
    );
    const updated = await prisma.aiApiKey.findUniqueOrThrow({ where: { id: key.id } });
    expect(updated.currentRequestsToday).toBe(1);
    expect(updated.usageDate?.toISOString().slice(0, 10)).toBe(new Date().toISOString().slice(0, 10));
  });

  it('deletes an assignment without submissions and cascades authored resources', async () => {
    const lecturer = await prisma.user.create({
      data: {
        email: `ci-assignment-delete-empty-${Date.now()}@example.com`,
        fullName: 'CI Assignment Lecturer',
        role: 'LECTURER',
      },
    });
    const course = await prisma.course.create({
      data: {
        code: `CI-DEL-${Date.now()}`,
        name: 'CI assignment deletion',
        semester: 'CI',
        lecturerId: lecturer.id,
      },
    });
    const assignment = await prisma.assignment.create({
      data: {
        courseId: course.id,
        title: 'Disposable empty assignment',
        environment: 'C_GCC',
        startTime: new Date(),
        deadline: new Date(Date.now() + 60_000),
        createdBy: lecturer.id,
        testCases: {
          create: {
            label: 'Sample',
            rationaleTag: 'FUNCTIONAL',
          },
        },
        rubricRules: {
          create: {
            criterionName: 'Correctness',
            description: 'Correct result',
            maxPoints: 1,
          },
        },
      },
    });

    const repository = new PrismaAssignmentRepository(prisma);
    await expect(repository.deleteIfNoSubmissions(assignment.id)).resolves.toBe('DELETED');
    await expect(prisma.assignment.findUnique({ where: { id: assignment.id } })).resolves.toBeNull();
    await expect(prisma.testCase.count({ where: { assignmentId: assignment.id } })).resolves.toBe(0);
    await expect(prisma.rubricRule.count({ where: { assignmentId: assignment.id } })).resolves.toBe(0);
  });

  it('does not delete an assignment that already has a submission', async () => {
    const lecturer = await prisma.user.create({
      data: {
        email: `ci-assignment-delete-owner-${Date.now()}@example.com`,
        fullName: 'CI Assignment Owner',
        role: 'LECTURER',
      },
    });
    const student = await prisma.user.create({
      data: {
        email: `ci-assignment-delete-student-${Date.now()}@example.com`,
        fullName: 'CI Assignment Student',
        role: 'STUDENT',
      },
    });
    const course = await prisma.course.create({
      data: {
        code: `CI-USED-${Date.now()}`,
        name: 'CI used assignment',
        semester: 'CI',
        lecturerId: lecturer.id,
      },
    });
    const assignment = await prisma.assignment.create({
      data: {
        courseId: course.id,
        title: 'Disposable used assignment',
        environment: 'JAVA_JDK',
        startTime: new Date(),
        deadline: new Date(Date.now() + 60_000),
        createdBy: lecturer.id,
      },
    });
    await prisma.submission.create({
      data: {
        assignmentId: assignment.id,
        userId: student.id,
        submissionChannel: 'ZIP_UPLOAD',
      },
    });

    const repository = new PrismaAssignmentRepository(prisma);
    await expect(repository.deleteIfNoSubmissions(assignment.id)).resolves.toBe('HAS_SUBMISSIONS');
    await expect(prisma.assignment.findUnique({ where: { id: assignment.id } })).resolves.not.toBeNull();
  });
});
