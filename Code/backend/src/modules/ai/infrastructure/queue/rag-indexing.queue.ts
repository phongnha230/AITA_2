import { Job, Queue, Worker } from 'bullmq';
import prisma from '../../../../infrastructure/database/prisma.client.js';
import { redisConnection } from '../../../../infrastructure/redis/redis.client.js';
import { CHUNKER_VERSION, CodeChunker } from '../chunking/code-chunker.js';
import { ChromaVectorService } from '../vector/chroma-vector.service.js';
import { env } from '../../../../infrastructure/config/env.js';

export const RAG_INDEXING_QUEUE_NAME = 'rag-indexing';
const retryDelaysMs = [10_000, 30_000, 120_000, 300_000, 900_000];

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
    attempts: 6,
    backoff: { type: 'rag-indexing' },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 500 },
  });
};

let activeWorker: Worker<RagIndexingJobData> | null = null;

const processIndexingJob = async (job: Job<RagIndexingJobData>): Promise<{ stale: boolean }> => {
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

  const vectorService = new ChromaVectorService();
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

export const startRagIndexingWorker = (): Worker<RagIndexingJobData> => {
  if (activeWorker) return activeWorker;
  activeWorker = new Worker<RagIndexingJobData>(RAG_INDEXING_QUEUE_NAME, processIndexingJob, {
    connection: redisConnection,
    concurrency: 2,
    settings: {
      backoffStrategy: (attemptsMade, type) => {
        if (type !== 'rag-indexing') return -1;
        return retryDelaysMs[Math.min(attemptsMade - 1, retryDelaysMs.length - 1)];
      },
    },
  });
  activeWorker.on('failed', (job, error) => {
    console.error('[RagIndexingWorker] Indexing failed', {
      solutionId: job?.data.solutionId,
      attempt: job?.attemptsMade,
      error: error.message,
    });
  });
  return activeWorker;
};

export const stopRagIndexingWorker = async (): Promise<void> => {
  if (!activeWorker) return;
  await activeWorker.close();
  activeWorker = null;
};
