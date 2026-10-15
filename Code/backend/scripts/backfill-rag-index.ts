import prisma from '../src/infrastructure/database/prisma.client.js';
import {
  enqueueRagIndexing,
  ragIndexingQueue,
} from '../src/modules/ai/infrastructure/queue/rag-indexing.queue.js';
import { redisConnection } from '../src/infrastructure/redis/redis.client.js';

async function main(): Promise<void> {
  const solutions = await prisma.assignmentSolution.findMany({
    where: { isActive: true, activeKey: { not: null } },
    select: { id: true, contentHash: true },
  });
  for (const solution of solutions) {
    await enqueueRagIndexing({ solutionId: solution.id, contentHash: solution.contentHash });
  }
  console.log(JSON.stringify({ event: 'rag_backfill_enqueued', count: solutions.length }));
}

try {
  await main();
} catch (error) {
  console.error(JSON.stringify({
    event: 'rag_backfill_failed',
    error: error instanceof Error ? error.message : String(error),
  }));
  process.exitCode = 1;
} finally {
  await ragIndexingQueue.close();
  await redisConnection.quit();
  await prisma.$disconnect();
}
