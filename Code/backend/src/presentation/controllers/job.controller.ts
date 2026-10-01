import { Request, Response } from 'express';

import {
  getGradingJobStatus,
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
}