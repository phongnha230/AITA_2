import { createGradingWorker } from './bullmq.worker.js';
import { container } from '../container/container.js';
import { logger } from '../logging/logger.js';

let activeWorker: ReturnType<typeof createGradingWorker> | null = null;

/**
 * Khởi động BullMQ Grading Worker kết nối thực tế với Sandbox Runner và AI Grader
 */
export function startGradingWorker() {
  if (activeWorker) {
    logger.info('grading_worker_already_running');
    return activeWorker;
  }

  activeWorker = createGradingWorker({
    persistLifecycle: true,

    // Giai đoạn 1: Chạy Sandbox (Biên dịch, chạy testcases trên Docker hoặc Local)
    runSandbox: async (jobData) => {
      logger.info('grading_sandbox_started', {
        submissionId: jobData.submissionId,
        stage: 'RUNNING_SANDBOX',
      });
      const summary = await container.sandboxService.gradeSubmission(jobData.submissionId, jobData.language, jobData.gradingRunId);
      return summary;
    },

    // Giai đoạn 2: Chạy AI Grader (Đánh giá Rubric, độ phức tạp thuật toán, feedback)
    runAiGrading: async (jobData) => {
      logger.info('grading_ai_started', {
        submissionId: jobData.submissionId,
        stage: 'RUNNING_AI',
      });
      const aiResult = await container.gradeSubmissionAiUseCase.execute(jobData.submissionId);
      return aiResult;
    },
  });

  logger.info('grading_worker_started');
  return activeWorker;
}

/**
 * Đóng worker an toàn khi shutdown server
 */
export async function stopGradingWorker() {
  if (activeWorker) {
    logger.info('grading_worker_stopping');
    await activeWorker.close();
    activeWorker = null;
  }
}
