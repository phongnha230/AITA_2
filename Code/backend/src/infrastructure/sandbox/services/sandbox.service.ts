import prisma from "../../database/prisma.client";
import { Prisma } from "@prisma/client";
import { SandboxRunnerFactory } from "../sandbox-runner.factory";
import {
  SandboxExecutionSummary,
  TestCaseInput,
} from "../interfaces/sandbox-runner.interface";

export class SandboxService {
  /**
   * Chạy chấm toàn bộ testcase cho một bài nộp và lưu kết quả vào CSDL
   */
  public static async gradeSubmission(
    submissionId: string,
    languageOverride?: string,
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

    if (!submission || !submission.stagedPath) {
      throw new Error(
        `Không tìm thấy Submission hoặc stagedPath rỗng: ${submissionId}`,
      );
    }

    // 2. Chuẩn bị danh sách testcases với type rõ ràng
    const testCases: TestCaseInput[] = (submission.assignment.testCases || []).map(
      (tc: any) => ({
        id: tc.id,
        questionNo: tc.questionNo,
        inputData: tc.inputData,
        expectedOutput: tc.expectedOutput,
        outputFileName: tc.outputFileName,
        timeLimitMs: tc.timeLimitMs,
        memoryLimitMb: tc.memoryLimitMb,
        score: Number(tc.score),
      }),
    );

    // 3. Xác định ngôn ngữ
    const language =
      languageOverride ||
      submission.assignment.allowedLanguages.split(",")[0] ||
      "C";

    // 4. Khởi tạo runner qua Factory Method và chạy bài làm
    const runner = SandboxRunnerFactory.createRunner(language);
    const summary = await runner.execute(submission.stagedPath, testCases);

    // 5. Lưu kết quả chi tiết từng testcase vào bảng submission_test_results
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Xóa kết quả cũ nếu có
      await tx.submissionTestResult.deleteMany({
        where: { submissionId: submission.id },
      });

      // Thêm mới kết quả từng test
      if (summary.results.length > 0) {
        await tx.submissionTestResult.createMany({
          data: summary.results.map((r: any) => ({
            submissionId: submission.id,
            testCaseId: r.testCaseId,
            passed: r.passed,
            actualOutput: r.actualOutput,
            executionTimeMs: r.executionTimeMs,
            memoryUsedKb: r.memoryUsedKb,
            errorMessage: r.errorMessage || null,
          })),
        });
      }

      // Cập nhật điểm sandbox_score của bài nộp (tối đa 7.0 theo barem)
      const normalizedSandboxScore = Number(
        (((summary.totalScore / (summary.maxScore || 1)) * 7.0) || 0).toFixed(2),
      );
      await tx.submission.update({
        where: { id: submission.id },
        data: {
          sandboxScore: normalizedSandboxScore,
        },
      });
    });

    return summary;
  }
}
