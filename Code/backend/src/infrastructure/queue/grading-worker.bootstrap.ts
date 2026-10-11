import { createGradingWorker } from './bullmq.worker.js';
import { SandboxService } from '../../modules/sandbox/application/services/sandbox.service.js';
import { gradeSubmissionAiUseCase } from '../../modules/ai/presentation/routes/ai.route.js';

let activeWorker: ReturnType<typeof createGradingWorker> | null = null;

/**
 * Khởi động BullMQ Grading Worker kết nối thực tế với Sandbox Runner và AI Grader
 */
export function startGradingWorker() {
  if (activeWorker) {
    console.log('⚡ [GradingWorker] Worker is already running.');
    return activeWorker;
  }

  activeWorker = createGradingWorker({
    persistLifecycle: true,

    // Giai đoạn 1: Chạy Sandbox (Biên dịch, chạy testcases trên Docker hoặc Local)
    runSandbox: async (jobData) => {
      console.log(`🚀 [GradingWorker] Starting Sandbox execution for submission: ${jobData.submissionId}`);
      const summary = await SandboxService.gradeSubmission(jobData.submissionId, jobData.language);
      return summary;
    },

    // Giai đoạn 2: Chạy AI Grader (Đánh giá Rubric, độ phức tạp thuật toán, feedback)
    runAiGrading: async (jobData) => {
      console.log(`🤖 [GradingWorker] Starting AI Rubric Grading for submission: ${jobData.submissionId}`);
      const aiResult = await gradeSubmissionAiUseCase.execute(jobData.submissionId);
      return aiResult;
    },
  });

  console.log('✅ [GradingWorker] BullMQ Grading Worker initialized and listening for jobs.');
  return activeWorker;
}

/**
 * Đóng worker an toàn khi shutdown server
 */
export async function stopGradingWorker() {
  if (activeWorker) {
    console.log('🛑 [GradingWorker] Closing worker...');
    await activeWorker.close();
    activeWorker = null;
  }
}
