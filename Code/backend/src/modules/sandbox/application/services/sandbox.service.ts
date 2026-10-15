import fs from 'node:fs/promises';
import { SandboxRunnerFactory } from '../../infrastructure/sandbox-runner.factory.js';
import { IArtifactExtractor } from '../../../submission/application/services/artifact-extractor.interface.js';
import { SandboxExecutionSummary, TestCaseInput } from '../../domain/interfaces/sandbox-runner.interface.js';
import { ISandboxRepository } from '../../domain/interfaces/sandbox.repository.interface.js';

export interface ISandboxService {
  gradeSubmission(submissionId: string, languageOverride?: string): Promise<SandboxExecutionSummary>;
}

export const calculatePerformanceScore = (
  testCases: Array<{ id: string; rationaleTag: string }>,
  results: Array<{ testCaseId: string; passed: boolean }>
): number => {
  const performanceCases = testCases.filter((testCase) => testCase.rationaleTag === 'PERFORMANCE');
  if (performanceCases.length === 0) return 0;
  const passedIds = new Set(results.filter((result) => result.passed).map((result) => result.testCaseId));
  const passedCount = performanceCases.filter((testCase) => passedIds.has(testCase.id)).length;
  return Number((passedCount / performanceCases.length).toFixed(2));
};

export class SandboxService implements ISandboxService {
  constructor(
    private readonly sandboxRepository: ISandboxRepository,
    private readonly artifactExtractor: IArtifactExtractor
  ) {}

  public async gradeSubmission(
    submissionId: string,
    languageOverride?: string
  ): Promise<SandboxExecutionSummary> {
    const submission = await this.sandboxRepository.findSubmissionForGrading(submissionId);
    if (!submission?.zipFilePath) {
      throw new Error(`Không tìm thấy Submission hoặc đường dẫn zipFilePath rỗng: ${submissionId}`);
    }

    let executionFolderPath = submission.zipFilePath;
    try {
      const stat = await fs.stat(submission.zipFilePath);
      if (stat.isFile() && submission.zipFilePath.toLowerCase().endsWith('.zip')) {
        const stagingResult = await this.artifactExtractor.extractAndStage(
          submission.zipFilePath,
          submission.id,
          submission.assignment.maxFileSizeBytes
        );
        executionFolderPath = stagingResult.stagedPath;
        await this.sandboxRepository.updateWorkspacePath(submission.id, executionFolderPath);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Workspace của submission ${submissionId} không tồn tại.`);
      }
      throw error;
    }

    const allTestCases = submission.assignment.testCases;
    const matchedTestCases = submission.paperCode
      ? allTestCases.filter((testCase) =>
          !testCase.paperCode || testCase.paperCode.toUpperCase() === submission.paperCode?.toUpperCase()
        )
      : allTestCases;
    const testCasesToRun = matchedTestCases.length > 0 ? matchedTestCases : allTestCases;
    const testCases: TestCaseInput[] = testCasesToRun.map((testCase) => ({
      id: testCase.id,
      questionNo: testCase.label,
      inputData: testCase.stdinInput || testCase.inputFileContent || '',
      expectedOutput: testCase.expectedStdout || testCase.expectedFileContent || '',
      outputFileName: testCase.expectedFileName,
      timeLimitMs: Math.min(10_000, Math.max(100, testCase.timeLimitMs)),
      memoryLimitMb: Math.min(512, Math.max(32, Math.round(testCase.memoryLimitKb / 1024) || 256)),
      score: testCase.rationaleTag === 'PERFORMANCE' ? 0 : testCase.points,
    }));

    const runner = SandboxRunnerFactory.createRunner(
      languageOverride || submission.assignment.environment || 'C_GCC'
    );
    const summary = await runner.execute(executionFolderPath, testCases);
    const algorithmPerformanceScore = calculatePerformanceScore(testCasesToRun, summary.results);
    const normalizedSandboxScore = Number(
      (((summary.totalScore / (summary.maxScore || 1)) * submission.assignment.functionalMaxScore) || 0).toFixed(2)
    );
    await this.sandboxRepository.replaceTestResults(
      submission,
      summary,
      normalizedSandboxScore,
      algorithmPerformanceScore
    );
    return { ...summary, sandboxScore: normalizedSandboxScore, algorithmPerformanceScore };
  }
}
