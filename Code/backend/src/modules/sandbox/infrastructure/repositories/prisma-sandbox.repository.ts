import { PrismaClient, TestCaseVerdict } from '@prisma/client';
import {
  ISandboxRepository,
  SandboxStatusCounts,
  SandboxSubmissionRecord,
} from '../../domain/interfaces/sandbox.repository.interface.js';
import { SandboxExecutionSummary } from '../../domain/interfaces/sandbox-runner.interface.js';

export class PrismaSandboxRepository implements ISandboxRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findSubmissionForGrading(submissionId: string): Promise<SandboxSubmissionRecord | null> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        zipFilePath: true,
        workspacePath: true,
        deployedUrl: true,
        paperCode: true,
        assignment: {
          select: {
            environment: true,
            maxFileSizeBytes: true,
            functionalMaxScore: true,
            testCases: {
              select: {
                id: true,
                label: true,
                paperCode: true,
                stdinInput: true,
                inputFileContent: true,
                expectedStdout: true,
                expectedFileContent: true,
                expectedFileName: true,
                timeLimitMs: true,
                memoryLimitKb: true,
                points: true,
                rationaleTag: true,
              },
            },
          },
        },
      },
    });
    if (!submission) return null;
    return {
      ...submission,
      assignment: {
        ...submission.assignment,
        functionalMaxScore: Number(submission.assignment.functionalMaxScore),
        testCases: submission.assignment.testCases.map((testCase) => ({
          ...testCase,
          points: Number(testCase.points),
          rationaleTag: testCase.rationaleTag,
        })),
      },
    };
  }

  async updateWorkspacePath(submissionId: string, workspacePath: string): Promise<void> {
    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { workspacePath },
    });
  }

  async replaceTestResults(
    submission: SandboxSubmissionRecord,
    summary: SandboxExecutionSummary,
    normalizedSandboxScore: number,
    algorithmPerformanceScore: number
  ): Promise<void> {
    const testCaseById = new Map(submission.assignment.testCases.map((testCase) => [testCase.id, testCase]));
    await this.prisma.$transaction(async (transaction) => {
      await transaction.submissionTestResult.deleteMany({ where: { submissionId: submission.id } });
      if (summary.results.length > 0) {
        await transaction.submissionTestResult.createMany({
          data: summary.results.map((result) => {
            let verdict: TestCaseVerdict = 'FAILED';
            if (result.passed) verdict = 'PASSED';
            else if (result.status === 'TIME_LIMIT_EXCEEDED') verdict = 'TIME_LIMIT_EXCEEDED';
            else if (result.status === 'MEMORY_LIMIT_EXCEEDED') verdict = 'MEMORY_LIMIT_EXCEEDED';
            else if (result.status === 'OUTPUT_LIMIT_EXCEEDED') verdict = 'OUTPUT_LIMIT_EXCEEDED';
            else if (result.status === 'RUNTIME_ERROR') verdict = 'RUNTIME_ERROR';
            return {
              submissionId: submission.id,
              testCaseId: result.testCaseId,
              verdict,
              executionTimeMs: result.executionTimeMs,
              memoryUsedKb: result.memoryUsedKb,
              actualStdout: result.actualOutput || null,
              earnedPoints: result.passed && testCaseById.get(result.testCaseId)?.rationaleTag !== 'PERFORMANCE'
                ? (testCaseById.get(result.testCaseId)?.points ?? 0)
                : 0,
              diffLog: result.errorMessage || null,
            };
          }),
        });
      }
      await transaction.submission.update({
        where: { id: submission.id },
        data: {
          sandboxScore: normalizedSandboxScore,
          algorithmPerformanceScore,
          compileSuccess: !summary.compileError,
          compileOutput: summary.compileError || null,
        },
      });
    });
  }

  async getStatusCounts(): Promise<SandboxStatusCounts> {
    const [activeExecutions, totalGradedCount, failedExecutions] = await Promise.all([
      this.prisma.gradingJob.count({ where: { status: 'RUNNING_SANDBOX' } }),
      this.prisma.submission.count({ where: { status: 'GRADED' } }),
      this.prisma.gradingJob.count({ where: { status: 'FAILED' } }),
    ]);
    return { activeExecutions, totalGradedCount, failedExecutions };
  }
}
