import { Request, Response } from 'express';
import prisma from '../../infrastructure/database/prisma.client.js';
import {
  getGradingJobStatus,
  gradingQueue,
  enqueueSubmission,
} from '../../infrastructure/queue/bullmq.queue.js';



export class JobController {

  /**
   * GET /jobs/:submissionId
   *
   * Trả về trạng thái hiện tại của Grading Job
   * dựa trên submissionId.
   */
  public static async getJobStatus(
    req: Request,
    res: Response
  ): Promise<void> {

    try {

      const { submissionId } = req.params;

      // ======================================================
      // VALIDATE INPUT
      // ======================================================

      if (!submissionId) {
        res.status(400).json({
          success: false,
          message: 'submissionId is required.',
        });

        return;
      }

      // ======================================================
      // GET JOB STATUS
      // ======================================================

      const jobStatus =
        await getGradingJobStatus(submissionId);

      // ======================================================
      // NOT FOUND
      // ======================================================

      if (!jobStatus) {
        res.status(404).json({
          success: false,
          message:
            'Grading job not found for this submission.',
        });

        return;
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      res.status(200).json({
        success: true,
        data: jobStatus,
      });

    } catch (error: unknown) {

      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error';

      console.error(
        '[JobController] Failed to get job status:',
        error
      );

      res.status(500).json({
        success: false,
        message:
          'Failed to get grading job status.',
        error:
          process.env.NODE_ENV === 'development'
            ? message
            : undefined,
      });
    }
  }

  /**
   * GET /jobs/:submissionId/events
   *
   * Server-Sent Events (SSE) để Frontend nhận trạng thái chấm bài theo thời gian thực (Realtime stream)
   */
  public static async streamJobEvents(
    req: Request,
    res: Response
  ): Promise<void> {
    const { submissionId } = req.params;

    if (!submissionId) {
      res.status(400).json({ success: false, message: 'submissionId is required.' });
      return;
    }

    // Thiết lập SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let isClientConnected = true;

    req.on('close', () => {
      isClientConnected = false;
    });

    const interval = setInterval(async () => {
      if (!isClientConnected) {
        clearInterval(interval);
        return;
      }

      try {
        const jobStatus = await getGradingJobStatus(submissionId);
        if (jobStatus) {
          res.write(`data: ${JSON.stringify(jobStatus)}\n\n`);

          // Nếu job đã hoàn tất (COMPLETED hoặc FAILED), đóng stream an toàn
          if (jobStatus.status === 'COMPLETED' || jobStatus.status === 'FAILED') {
            clearInterval(interval);
            res.write(`event: end\ndata: ${JSON.stringify({ finished: true, status: jobStatus.status })}\n\n`);
            res.end();
          }
        }
      } catch (err: any) {
        console.error('[JobController SSE] Error polling job status:', err.message);
      }
    }, 1000);
  }

  /**
   * GET /jobs/metrics/overview
   * Lấy số liệu thống kê tổng thể hàng đợi BullMQ & CSDL
   */
  public static async getQueueMetrics(_req: Request, res: Response): Promise<void> {
    try {
      let bullmq: Record<string, number> = { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0 };
      try {
        bullmq = (await gradingQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused')) as Record<string, number>;
      } catch {
        // Redis offline / fallback
      }

      const dbCounts = await prisma.gradingJob.groupBy({
        by: ['status'],
        _count: { _all: true },
      });

      const dbStatuses: Record<string, number> = {};
      let total = 0;
      for (const item of dbCounts) {
        dbStatuses[item.status] = item._count._all;
        total += item._count._all;
      }

      res.status(200).json({
        success: true,
        data: {
          bullmq,
          database: {
            total,
            statuses: dbStatuses,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi lấy metrics hàng đợi' });
    }
  }

  /**
   * GET /jobs/queue/jobs
   * Lấy danh sách jobs gần đây trong hệ thống
   */
  public static async listQueueJobs(_req: Request, res: Response): Promise<void> {
    try {
      const jobs = await prisma.gradingJob.findMany({
        take: 50,
        orderBy: { queuedAt: 'desc' },
        include: {
          submission: {
            select: {
              id: true,
              userId: true,
              assignmentId: true,
              status: true,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: jobs,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi lấy danh sách jobs' });
    }
  }

  /**
   * POST /jobs/:submissionId/retry
   * Thử lại tiến trình chấm bài bị lỗi
   */
  public static async retryJob(req: Request, res: Response): Promise<void> {
    try {
      const { submissionId } = req.params;
      const job = await prisma.gradingJob.findUnique({
        where: { submissionId },
        include: { submission: true },
      });

      if (!job) {
        res.status(404).json({ success: false, message: 'Không tìm thấy job cần retry.' });
        return;
      }

      await prisma.gradingJob.update({
        where: { submissionId },
        data: {
          status: 'QUEUED',
          retryCount: { increment: 1 },
          errorStage: null,
        },
      });

      if (job.submission?.zipFilePath) {
        await enqueueSubmission({
          submissionId,
          stagedFolderPath: job.submission.zipFilePath,
          assignmentId: job.submission.assignmentId,
        });
      }

      res.status(200).json({
        success: true,
        message: `Đã đưa job ${submissionId} trở lại hàng đợi để chấm lại.`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi retry job' });
    }
  }

}