import { PrismaClient, TestCaseVerdict } from '@prisma/client';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { env } from '../../../../infrastructure/config/env.js';
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
        gradingSnapshot: true,
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
                isHidden: true,
              },
            },
          },
        },
      },
    });
    if (!submission) return null;
    const snapshot = submission.gradingSnapshot as unknown as SandboxSubmissionRecord['gradingSnapshot'];
    return {
      ...submission,
      gradingSnapshot: snapshot,
      assignment: {
        ...submission.assignment,
        environment: snapshot?.assignment.environment ?? submission.assignment.environment,
        maxFileSizeBytes: snapshot ? BigInt(snapshot.assignment.maxFileSizeBytes) : submission.assignment.maxFileSizeBytes,
        functionalMaxScore: snapshot?.assignment.functionalMaxScore ?? Number(submission.assignment.functionalMaxScore),
        testCases: (snapshot?.testCases ?? submission.assignment.testCases).map((testCase) => ({
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
    algorithmPerformanceScore: number,
    gradingRunId?: string
  ): Promise<void> {
    const testCaseById = new Map(submission.assignment.testCases.map((testCase) => [testCase.id, testCase]));
    const gradingResults = summary.results.map(({ evidenceBase64: _evidence, ...result }) => {
      const testCase = testCaseById.get(result.testCaseId);
      const maxPoints = testCase?.points ?? 0;
      return {
        ...result,
        label: testCase?.label ?? result.questionNo,
        earnedPoints: testCase?.rationaleTag === 'PERFORMANCE' ? 0 : result.earnedScore ?? (result.passed ? maxPoints : 0),
        maxPoints,
      };
    });
    const evidenceFiles: Array<{ testCaseId: string; storagePath: string; sha256: string; size: number }> = [];
    if (gradingRunId) {
      const evidenceRoot = path.resolve(env.UPLOAD_DIR, 'grading-evidence', gradingRunId);
      await fs.mkdir(evidenceRoot, { recursive: true });
      try {
        for (const result of summary.results) {
          if (!result.evidenceBase64) continue;
          const bytes = Buffer.from(result.evidenceBase64, 'base64');
          if (bytes.length > 5 * 1024 * 1024) continue;
          const storagePath = path.join(evidenceRoot, `${randomUUID()}.jpg`);
          await fs.writeFile(storagePath, bytes, { flag: 'wx', mode: 0o600 });
          evidenceFiles.push({
            testCaseId: result.testCaseId,
            storagePath,
            sha256: createHash('sha256').update(bytes).digest('hex'),
            size: bytes.length,
          });
        }
      } catch (error) {
        await Promise.all(evidenceFiles.map((file) => fs.rm(file.storagePath, { force: true })));
        throw error;
      }
    }
    try {
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
              earnedPoints: testCaseById.get(result.testCaseId)?.rationaleTag === 'PERFORMANCE'
                ? 0
                : result.earnedScore ?? (result.passed ? testCaseById.get(result.testCaseId)?.points ?? 0 : 0),
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
      if (gradingRunId) {
        const stageKey = submission.assignment.environment === 'REACT_JS' ? 'WEB_TESTCASES' : 'TESTCASES';
        const stage = await transaction.gradingRunStage.upsert({
          where: { gradingRunId_stageKey: { gradingRunId, stageKey } },
          create: { gradingRunId, stageKey, status: 'COMPLETED', score: normalizedSandboxScore, maxScore: submission.assignment.functionalMaxScore,
            detailsJson: JSON.parse(JSON.stringify({ results: gradingResults, testCases: submission.assignment.testCases })) as import('@prisma/client').Prisma.InputJsonValue,
            startedAt: new Date(), completedAt: new Date() },
          update: { status: 'COMPLETED', score: normalizedSandboxScore, maxScore: submission.assignment.functionalMaxScore,
            detailsJson: JSON.parse(JSON.stringify({ results: gradingResults, testCases: submission.assignment.testCases })) as import('@prisma/client').Prisma.InputJsonValue,
            completedAt: new Date() },
        });
        if (evidenceFiles.length > 0) {
          await transaction.gradingEvidence.createMany({
            data: evidenceFiles.map((file) => ({ stageId: stage.id, testCaseId: file.testCaseId, storagePath: file.storagePath,
              mimeType: 'image/jpeg', fileSize: file.size, sha256: file.sha256 })),
          });
        }
      }
      });
    } catch (error) {
      await Promise.all(evidenceFiles.map((file) => fs.rm(file.storagePath, { force: true })));
      throw error;
    }
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
