import prisma from '../database/prisma.client.js';
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

      // Kiểm tra trạng thái biên dịch và cấu hình đề thi
      const sub = await prisma.submission.findUnique({
        where: { id: jobData.submissionId },
        select: {
          compileSuccess: true,
          assignment: {
            select: { algorithmMaxScore: true, cleanCodeMaxScore: true }
          }
        }
      });

      if (sub?.compileSuccess === false) {
        logger.info('ai_grading_skipped_on_compile_error', { submissionId: jobData.submissionId });
        return {
          aiScore: 0,
          algorithmScore: 0,
          cleanCodeScore: 0,
          codeQualityFeedback: 'Chương trình bị lỗi biên dịch (Compile Error). Không thực hiện chấm điểm tiêu chí AI.',
          detectedTimeComplexity: null,
        };
      }

      const isPurePE = (Number(sub?.assignment?.algorithmMaxScore ?? 0) + Number(sub?.assignment?.cleanCodeMaxScore ?? 0)) === 0;
      const aiResult = await container.gradeSubmissionAiUseCase.execute(jobData.submissionId);

      if (isPurePE && aiResult) {
        return {
          ...aiResult,
          aiScore: 0,
          algorithmScore: 0,
          cleanCodeScore: 0,
        };
      }

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
