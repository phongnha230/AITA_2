import { IGradingDispatcher } from '../../application/services/grading-dispatcher.interface.js';
import { enqueueSubmission } from '../../../../infrastructure/queue/bullmq.queue.js';

export class BullmqGradingDispatcher implements IGradingDispatcher {
  async dispatch(submissionId: string, stagedPath: string): Promise<void> {
    try {
      await enqueueSubmission({
        submissionId,
        stagedFolderPath: stagedPath,
      });
      console.log(`[BullmqGradingDispatcher] Đã đẩy bài nộp ${submissionId} vào hàng đợi Redis BullMQ`);
    } catch (error) {
      console.warn(
        `[BullmqGradingDispatcher] Không thể kết nối Redis để enqueue (sẽ tiếp tục không chặn request):`,
        error
      );
    }
  }
}

export const bullmqGradingDispatcher = new BullmqGradingDispatcher();
