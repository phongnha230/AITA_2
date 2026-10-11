import fs from 'node:fs';
import prisma from '../../../../infrastructure/database/prisma.client.js';
import { Prisma, TestCaseVerdict } from '@prisma/client';
import { SandboxRunnerFactory } from '../../infrastructure/sandbox-runner.factory.js';
import { zipExtractorService } from '../../../submission/infrastructure/storage/zip-extractor.service.js';
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

    // Đảm bảo đường dẫn thực thi là một thư mục workspace đã giải nén
    let executionFolderPath = submission.zipFilePath;
    if (
      fs.existsSync(submission.zipFilePath) &&
      fs.statSync(submission.zipFilePath).isFile() &&
      submission.zipFilePath.toLowerCase().endsWith('.zip')
    ) {
      const stagingResult = await zipExtractorService.extractAndStage(
        submission.zipFilePath,
        submission.id
      );
      executionFolderPath = stagingResult.stagedPath;
      await prisma.submission.update({
        where: { id: submission.id },
        data: { zipFilePath: executionFolderPath },
      });
    }

    // 2. Chuẩn bị danh sách testcases (lọc theo mã đề paperCode nếu có)
    const allTestCases = submission.assignment.testCases || [];
    const matchedTestCases = submission.paperCode
      ? allTestCases.filter(
          (tc: any) =>
            !tc.paperCode ||
            tc.paperCode.toUpperCase() === submission.paperCode!.toUpperCase()
        )
      : allTestCases;

    const testCasesToRun = matchedTestCases.length > 0 ? matchedTestCases : allTestCases;

    const testCases: TestCaseInput[] = testCasesToRun.map(
      (tc: any) => ({
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
    const summary = await runner.execute(executionFolderPath, testCases);

    // 5. Lưu kết quả chi tiết từng testcase vào bảng submission_test_results
    await prisma.$transaction(async (tx: any) => {
      // Xóa kết quả cũ nếu có
      await tx.submissionTestResult.deleteMany({
        where: { submissionId: submission.id },
      });

      // Thêm mới kết quả từng test
      if (summary.results.length > 0) {
        await tx.submissionTestResult.createMany({
          data: summary.results.map((r: any) => {
            const tc = submission.assignment.testCases.find((t: any) => t.id === r.testCaseId);
            let verdict: TestCaseVerdict = 'FAILED';
            if (r.passed) {
              verdict = 'PASSED';
            } else if (r.status === 'TIME_LIMIT_EXCEEDED') {
              verdict = 'TIME_LIMIT_EXCEEDED';
            } else if (r.status === 'MEMORY_LIMIT_EXCEEDED') {
              verdict = 'MEMORY_LIMIT_EXCEEDED';
            } else if (r.status === 'OUTPUT_LIMIT_EXCEEDED') {
              verdict = 'OUTPUT_LIMIT_EXCEEDED';
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

    const normalizedSandboxScore = Number(
      (((summary.totalScore / (summary.maxScore || 1)) * 7.0) || 0).toFixed(2)
    );

    return {
      ...summary,
      sandboxScore: normalizedSandboxScore,
    };
  }
}
