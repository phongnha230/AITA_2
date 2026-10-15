import { Job, Queue, Worker } from 'bullmq';
import prisma from '../../../../infrastructure/database/prisma.client.js';
import { redisConnection } from '../../../../infrastructure/redis/redis.client.js';
import { CHUNKER_VERSION, CodeChunker } from '../chunking/code-chunker.js';
import { ISolutionVectorStore } from '../vector/chroma-vector.service.js';
import { env } from '../../../../infrastructure/config/env.js';
import {
  IRagIndexingQueue,
  RagIndexingRequest,
} from '../../application/services/rag-indexing-queue.interface.js';
import { logger } from '../../../../infrastructure/logging/logger.js';
import {
  getRagIndexRetryDelay,
  RAG_INDEX_MAX_ATTEMPTS,
} from '../../../../infrastructure/queue/retry-policy.js';

export const RAG_INDEXING_QUEUE_NAME = 'rag-indexing';

export interface RagIndexingJobData {
  solutionId: string;
  contentHash: string;
}

export const ragIndexingQueue = new Queue<RagIndexingJobData>(RAG_INDEXING_QUEUE_NAME, {
  connection: redisConnection,
});

export const enqueueRagIndexing = async (data: RagIndexingJobData): Promise<void> => {
  await ragIndexingQueue.add('index-solution', data, {
    jobId: `rag-index:${data.solutionId}:${data.contentHash}`,
    attempts: RAG_INDEX_MAX_ATTEMPTS,
    backoff: { type: 'rag-indexing' },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 500 },
  });
};

export class BullMqRagIndexingQueue implements IRagIndexingQueue {
  enqueue(data: RagIndexingRequest): Promise<void> {
    return enqueueRagIndexing(data);
  }
}

let activeWorker: Worker<RagIndexingJobData> | null = null;

const processIndexingJob = async (
  job: Job<RagIndexingJobData>,
  vectorService: ISolutionVectorStore
): Promise<{ stale: boolean }> => {
  const solution = await prisma.assignmentSolution.findUnique({
    where: { id: job.data.solutionId },
    include: { assignment: true },
  });
  if (
    !solution ||
    !solution.isActive ||
    solution.activeKey !== solution.assignmentId ||
    solution.contentHash !== job.data.contentHash
  ) {
    return { stale: true };
  }

  try {
    const fileName = solution.assignment.environment === 'JAVA_JDK' ? 'Solution.java' : 'solution.c';
    const chunks = CodeChunker.chunkSourceCode(
      solution.sourceCode,
      solution.assignment.environment,
      fileName
    );
    const version = {
      assignmentId: solution.assignmentId,
      solutionId: solution.id,
      contentHash: solution.contentHash,
      environment: solution.assignment.environment,
      embeddingModel: env.GEMINI_EMBEDDING_MODEL,
      chunkerVersion: CHUNKER_VERSION,
    };
    await vectorService.indexSolutionVersion(version, chunks);

    const updated = await prisma.assignmentSolution.updateMany({
      where: {
        id: solution.id,
        isActive: true,
        activeKey: solution.assignmentId,
        contentHash: solution.contentHash,
      },
      data: {
        indexStatus: 'READY',
        indexedAt: new Date(),
        indexError: null,
        embeddingModel: env.GEMINI_EMBEDDING_MODEL,
        chunkerVersion: CHUNKER_VERSION,
        chromaDocId: `${solution.id}:${solution.contentHash}`,
      },
    });
    if (updated.count !== 1) return { stale: true };

    await vectorService.deleteStaleVersions(solution.assignmentId, solution.contentHash);
    return { stale: false };
  } catch (error) {
    const finalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
    await prisma.assignmentSolution.updateMany({
      where: { id: solution.id, contentHash: solution.contentHash },
      data: {
        indexStatus: finalAttempt ? 'FAILED' : 'PENDING',
        indexError: error instanceof Error ? error.message.slice(0, 2_000) : 'Unknown indexing error',
      },
    });
    throw error;
  }
};

export const startRagIndexingWorker = (
  vectorService: ISolutionVectorStore
): Worker<RagIndexingJobData> => {
  if (activeWorker) return activeWorker;
  activeWorker = new Worker<RagIndexingJobData>(
    RAG_INDEXING_QUEUE_NAME,
    (job) => processIndexingJob(job, vectorService),
    {
    connection: redisConnection,
    concurrency: 2,
    settings: {
      backoffStrategy: (attemptsMade, type) => {
        if (type !== 'rag-indexing') return -1;
        return getRagIndexRetryDelay(attemptsMade);
      },
    },
    }
  );
  activeWorker.on('failed', (job, error) => {
    logger.error('rag_indexing_failed', {
      jobId: job?.id,
      solutionId: job?.data.solutionId,
      attempt: job?.attemptsMade,
      stage: 'RAG_INDEXING',
      error,
    });
  });
  return activeWorker;
};

export const stopRagIndexingWorker = async (): Promise<void> => {
  if (!activeWorker) return;
  await activeWorker.close();
  activeWorker = null;
};
