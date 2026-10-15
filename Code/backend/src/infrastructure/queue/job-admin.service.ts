import { PrismaClient } from '@prisma/client';
import { logger } from '../logging/logger.js';
import {
  enqueueSubmission,
  getGradingJobStatus,
  gradingQueue,
} from './bullmq.queue.js';
import {
  IJobAdminService,
  JobQueueMetrics,
} from '../../application/services/job-admin.service.interface.js';

export class JobAdminService implements IJobAdminService {
  constructor(private readonly prisma: PrismaClient) {}

  getStatus(submissionId: string): Promise<unknown | null> {
    return getGradingJobStatus(submissionId);
  }

  async getMetrics(): Promise<JobQueueMetrics> {
    let bullmq: Record<string, number> = {
      waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0,
    };
    try {
      bullmq = await gradingQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused');
    } catch (error) {
      logger.warn('queue_metrics_redis_unavailable', { stage: 'QUEUE_METRICS', error });
    }
    const counts = await this.prisma.gradingJob.groupBy({ by: ['status'], _count: { _all: true } });
    const statuses: Record<string, number> = {};
    let total = 0;
    for (const item of counts) {
      statuses[item.status] = item._count._all;
      total += item._count._all;
    }
    return { bullmq, database: { total, statuses } };
  }

  async listJobs(): Promise<unknown[]> {
    return this.prisma.gradingJob.findMany({
      take: 50,
      orderBy: { queuedAt: 'desc' },
      include: {
        submission: {
          select: {
            id: true, userId: true, assignmentId: true, status: true, paperCode: true,
            user: { select: { id: true, fullName: true, studentCode: true, email: true } },
            assignment: {
              select: {
                id: true, title: true, environment: true,
                course: { select: { id: true, code: true, name: true } },
              },
            },
          },
        },
        assignedApiKey: { select: { id: true, keyAlias: true, provider: true } },
      },
    });
  }

  async retryAllFailed(): Promise<number> {
    const failedJobs = await this.prisma.gradingJob.findMany({
      where: { status: 'FAILED' },
      include: { submission: true },
    });
    let retriedCount = 0;
    for (const job of failedJobs) {
      if (!job.submission?.zipFilePath) continue;
      try {
        await enqueueSubmission({
          submissionId: job.submissionId,
          stagedFolderPath: job.submission.zipFilePath,
          assignmentId: job.submission.assignmentId,
        });
        retriedCount += 1;
      } catch (error) {
        logger.error('grading_job_retry_failed', {
          jobId: job.id,
          submissionId: job.submissionId,
          stage: 'QUEUE_RETRY',
          error,
        });
      }
    }
    return retriedCount;
  }

  async retryJob(submissionId: string): Promise<boolean> {
    const job = await this.prisma.gradingJob.findUnique({
      where: { submissionId },
      include: { submission: true },
    });
    if (!job?.submission?.zipFilePath) return false;
    await enqueueSubmission({
      submissionId,
      stagedFolderPath: job.submission.zipFilePath,
      assignmentId: job.submission.assignmentId,
    });
    return true;
  }

  async clearCompleted(): Promise<number> {
    return (await this.prisma.gradingJob.deleteMany({ where: { status: 'COMPLETED' } })).count;
  }

  async flushDeadLetter(): Promise<number> {
    return (await this.prisma.gradingJob.deleteMany({ where: { status: 'FAILED' } })).count;
  }
}
