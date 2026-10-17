import { IGradingDispatcher } from '../../application/services/grading-dispatcher.interface.js';
import { enqueueSubmission } from '../../../../infrastructure/queue/bullmq.queue.js';
import { AppError } from '../../../../shared/domain/exceptions/app.error.js';
import { logger } from '../../../../infrastructure/logging/logger.js';

export class BullmqGradingDispatcher implements IGradingDispatcher {
  async dispatch(submissionId: string, stagedPath: string, requestedById?: string): Promise<void> {
    try {
      await enqueueSubmission({
        submissionId,
        stagedFolderPath: stagedPath,
        requestedById,
      });
    } catch (error) {
      logger.error('submission_grading_enqueue_failed', {
        submissionId,
        stage: 'GRADING_QUEUE',
        error,
      });
      throw new AppError(
        'Bài nộp đã được lưu nhưng chưa thể đưa vào hàng đợi chấm. Vui lòng nộp lại sau.',
        503,
        'GRADING_QUEUE_UNAVAILABLE',
        { submissionId }
      );
    }
  }
}

export const bullmqGradingDispatcher = new BullmqGradingDispatcher();
