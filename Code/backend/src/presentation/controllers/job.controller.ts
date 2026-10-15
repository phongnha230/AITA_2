import { Request, Response } from 'express';
import { IJobAdminService } from '../../application/services/job-admin.service.interface.js';
import { logger } from '../../infrastructure/logging/logger.js';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export class JobController {
  constructor(private readonly jobService: IJobAdminService) {}

  public getJobStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { submissionId } = req.params;
      if (!submissionId) {
        res.status(400).json({ success: false, message: 'submissionId is required.' });
        return;
      }
      const status = await this.jobService.getStatus(submissionId);
      if (!status) {
        res.status(404).json({ success: false, message: 'Grading job not found for this submission.' });
        return;
      }
      res.status(200).json({ success: true, data: status });
    } catch (error) {
      this.handleError(req, res, error, 'job_status_failed');
    }
  };

  public streamJobEvents = async (req: Request, res: Response): Promise<void> => {
    const { submissionId } = req.params;
    if (!submissionId) {
      res.status(400).json({ success: false, message: 'submissionId is required.' });
      return;
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let connected = true;
    req.on('close', () => { connected = false; });
    const interval = setInterval(async () => {
      if (!connected) {
        clearInterval(interval);
        return;
      }
      try {
        const status = await this.jobService.getStatus(submissionId) as { status?: string } | null;
        if (!status) return;
        res.write(`data: ${JSON.stringify(status)}\n\n`);
        if (status.status === 'COMPLETED' || status.status === 'FAILED') {
          clearInterval(interval);
          res.write(`event: end\ndata: ${JSON.stringify({ finished: true, status: status.status })}\n\n`);
          res.end();
        }
      } catch (error) {
        logger.error('job_sse_poll_failed', {
          requestId: req.header('x-request-id'), submissionId, stage: 'SSE_POLL', error,
        });
      }
    }, 1_000);
  };

  public getQueueMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({ success: true, data: await this.jobService.getMetrics() });
    } catch (error) {
      this.handleError(req, res, error, 'queue_metrics_failed');
    }
  };

  public listQueueJobs = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({ success: true, data: await this.jobService.listJobs() });
    } catch (error) {
      this.handleError(req, res, error, 'queue_list_failed');
    }
  };

  public retryAllFailed = async (req: Request, res: Response): Promise<void> => {
    try {
      const retriedCount = await this.jobService.retryAllFailed();
      res.status(200).json({ success: true, data: { retriedCount }, message: `Đã thử lại ${retriedCount} jobs.` });
    } catch (error) {
      this.handleError(req, res, error, 'queue_retry_all_failed');
    }
  };

  public clearCompleted = async (req: Request, res: Response): Promise<void> => {
    try {
      const clearedCount = await this.jobService.clearCompleted();
      res.status(200).json({ success: true, data: { clearedCount } });
    } catch (error) {
      this.handleError(req, res, error, 'queue_clear_completed_failed');
    }
  };

  public flushDeadLetter = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedCount = await this.jobService.flushDeadLetter();
      res.status(200).json({ success: true, data: { deletedCount } });
    } catch (error) {
      this.handleError(req, res, error, 'queue_flush_dlq_failed');
    }
  };

  public retryJob = async (req: Request, res: Response): Promise<void> => {
    try {
      const retried = await this.jobService.retryJob(req.params.submissionId);
      if (!retried) {
        res.status(404).json({ success: false, message: 'Không tìm thấy job cần retry.' });
        return;
      }
      res.status(200).json({ success: true, message: `Đã đưa job ${req.params.submissionId} trở lại hàng đợi.` });
    } catch (error) {
      this.handleError(req, res, error, 'queue_retry_failed');
    }
  };

  private handleError(req: Request, res: Response, error: unknown, event: string): void {
    logger.error(event, {
      requestId: req.header('x-request-id'),
      submissionId: req.params.submissionId,
      stage: 'JOB_ADMIN',
      error,
    });
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? errorMessage(error) : 'Thao tác hàng đợi thất bại.',
    });
  }
}
