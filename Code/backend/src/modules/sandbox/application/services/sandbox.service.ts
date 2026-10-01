import prisma from '../../../../infrastructure/database/prisma.client.js';
import { Prisma, TestCaseVerdict } from '@prisma/client';
import { SandboxRunnerFactory } from '../../infrastructure/sandbox-runner.factory.js';
import {
  SandboxExecutionSummary,
  TestCaseInput,
} from '../../domain/interfaces/sandbox-runner.interface.js';

export class SandboxService {
  /**
   * Chạy chấm toàn bộ testcase cho một bài nộp và lưu kết quả vào CSDL
   */
  public static async gradeSubmission(
    submissionId: string,
    languageOverride?: string
  ): Promise<SandboxExecutionSummary> {
    // 1. Lấy thông tin submission và assignment từ Prisma
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: { testCases: true },
        },
      },
    });

    if (!submission || !submission.zipFilePath) {
      throw new Error(
        `Không tìm thấy Submission hoặc đường dẫn zipFilePath rỗng: ${submissionId}`
      );
    }

    // 2. Chuẩn bị danh sách testcases
    const testCases: TestCaseInput[] = (submission.assignment.testCases || []).map(
      (tc) => ({
        id: tc.id,
        questionNo: tc.label,
        inputData: tc.stdinInput || tc.inputFileContent || '',
        expectedOutput: tc.expectedStdout || tc.expectedFileContent || '',
        outputFileName: tc.expectedFileName,
        timeLimitMs: tc.timeLimitMs,
        memoryLimitMb: Math.round(tc.memoryLimitKb / 1024) || 256,
        score: Number(tc.points),
      })
    );

    // 3. Xác định ngôn ngữ môi trường bài tập
    const language =
      languageOverride ||
      submission.assignment.environment ||
      'C_GCC';

    // 4. Khởi tạo runner qua Factory Method và chạy bài làm
    const runner = SandboxRunnerFactory.createRunner(language);
    const summary = await runner.execute(submission.zipFilePath, testCases);

    // 5. Lưu kết quả chi tiết từng testcase vào bảng submission_test_results
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Xóa kết quả cũ nếu có
      await tx.submissionTestResult.deleteMany({
        where: { submissionId: submission.id },
      });

      // Thêm mới kết quả từng test
      if (summary.results.length > 0) {
        await tx.submissionTestResult.createMany({
          data: summary.results.map((r) => {
            const tc = submission.assignment.testCases.find((t) => t.id === r.testCaseId);
            let verdict: TestCaseVerdict = 'FAILED';
            if (r.passed) {
              verdict = 'PASSED';
            } else if (r.status === 'TIME_LIMIT_EXCEEDED') {
              verdict = 'TIME_LIMIT_EXCEEDED';
            } else if (r.status === 'MEMORY_LIMIT_EXCEEDED') {
              verdict = 'MEMORY_LIMIT_EXCEEDED';
            } else if (r.status === 'RUNTIME_ERROR') {
              verdict = 'RUNTIME_ERROR';
            }

            return {
              submissionId: submission.id,
              testCaseId: r.testCaseId,
              verdict,
              executionTimeMs: r.executionTimeMs,
              memoryUsedKb: r.memoryUsedKb,
              actualStdout: r.actualOutput || null,
              earnedPoints: r.passed && tc ? Number(tc.points) : 0,
              diffLog: r.errorMessage || null,
            };
          }),
        });
      }

      // Cập nhật điểm sandbox_score của bài nộp (tối đa 7.0 theo barem)
      const normalizedSandboxScore = Number(
        (((summary.totalScore / (summary.maxScore || 1)) * 7.0) || 0).toFixed(2)
      );
      await tx.submission.update({
        where: { id: submission.id },
        data: {
          sandboxScore: normalizedSandboxScore,
          compileSuccess: summary.compileError ? false : true,
          compileOutput: summary.compileError || null,
        },
      });
    });

    return summary;
  }
}
