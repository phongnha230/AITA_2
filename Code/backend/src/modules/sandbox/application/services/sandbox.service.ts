import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../../../infrastructure/config/env.js';
import { SandboxRunnerFactory } from '../../infrastructure/sandbox-runner.factory.js';
import { IArtifactExtractor } from '../../../submission/application/services/artifact-extractor.interface.js';
import { SandboxExecutionSummary, TestCaseInput } from '../../domain/interfaces/sandbox-runner.interface.js';
import { ISandboxRepository } from '../../domain/interfaces/sandbox.repository.interface.js';

export interface ISandboxService {
  gradeSubmission(submissionId: string, languageOverride?: string, gradingRunId?: string): Promise<SandboxExecutionSummary>;
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

const WEB_RUNNER_LANGUAGES = new Set([
  'WEB', 'REACT', 'REACT_JS', 'NEXTJS', 'HTML_CSS_JS', 'PLAYWRIGHT', 'VERCEL', 'SWP391', 'FER201',
]);

export class SandboxService implements ISandboxService {
  constructor(
    private readonly sandboxRepository: ISandboxRepository,
    private readonly artifactExtractor: IArtifactExtractor
  ) {}

  public async gradeSubmission(
    submissionId: string,
    languageOverride?: string,
    gradingRunId?: string
  ): Promise<SandboxExecutionSummary> {
    const submission = await this.sandboxRepository.findSubmissionForGrading(submissionId);
    if (!submission) {
      throw new Error(`Không tìm thấy Submission: ${submissionId}`);
    }

    let executionFolderPath: string = submission.workspacePath || '';
    let workspaceValid = false;

    if (executionFolderPath) {
      try {
        const stat = await fs.stat(executionFolderPath);
        if (stat.isDirectory()) {
          workspaceValid = true;
        }
      } catch {
        workspaceValid = false;
      }
    }

    if (!workspaceValid) {
      // Tự động khôi phục và giải nén từ tệp snapshot cục bộ hoặc Cloudinary
      let localZipPath: string | null = null;
      let tempDownloadedFile: string | null = null;

      const candidates = [submission.sourceSnapshotPath, submission.zipFilePath].filter(Boolean) as string[];
      for (const candidate of candidates) {
        if (!/^https?:\/\//i.test(candidate)) {
          try {
            const stat = await fs.stat(candidate);
            if (stat.isFile()) {
              localZipPath = candidate;
              break;
            }
          } catch {}
        }
      }

      if (!localZipPath) {
        const remoteUrl = candidates.find((c) => /^https?:\/\//i.test(c));
        if (remoteUrl) {
          try {
            const cloudRes = await fetch(remoteUrl);
            if (cloudRes.ok) {
              const tempDir = path.resolve(env.UPLOAD_DIR || './uploads', 'submissions-zip-tmp');
              await fs.mkdir(tempDir, { recursive: true });
              tempDownloadedFile = path.join(tempDir, `sandbox-${submissionId}-${Date.now()}.zip`);
              const buf = Buffer.from(await cloudRes.arrayBuffer());
              await fs.writeFile(tempDownloadedFile, buf);
              localZipPath = tempDownloadedFile;
            }
          } catch (cloudErr) {
            console.error('Lỗi khi tải file zip từ cloud:', cloudErr);
          }
        }
      }

      if (!localZipPath) {
        throw new Error(`Workspace của submission ${submissionId} không tồn tại và không tìm thấy file zip để phục hồi.`);
      }

      try {
        const stagingResult = await this.artifactExtractor.extractAndStage(
          localZipPath,
          submission.id,
          submission.assignment.maxFileSizeBytes
        );
        executionFolderPath = stagingResult.stagedPath;
        await this.sandboxRepository.updateWorkspacePath(submission.id, executionFolderPath);
      } finally {
        if (tempDownloadedFile) {
          try {
            await fs.unlink(tempDownloadedFile);
          } catch {}
        }
      }
    }

    const allTestCases = submission.assignment.testCases;
    const matchedTestCases = submission.paperCode
      ? allTestCases.filter((testCase) =>
          !testCase.paperCode || testCase.paperCode.toUpperCase() === submission.paperCode?.toUpperCase()
        )
      : allTestCases;
    const testCasesToRun = matchedTestCases.length > 0 ? matchedTestCases : allTestCases;
    const testCases: TestCaseInput[] = testCasesToRun.map((testCase) => {
      const match = testCase.label.match(/Q\d+/i);
      const questionNo = match ? match[0].toUpperCase() : testCase.label;
      const tcAny = testCase as unknown as Record<string, unknown>;
      return {
        id: testCase.id,
        questionNo,
        label: testCase.label,
        subMethod: (tcAny.subMethod as string) || null,
        inputData: testCase.stdinInput || testCase.inputFileContent || '',
        stdinInput: testCase.stdinInput,
        inputFileContent: testCase.inputFileContent,
        expectedOutput: testCase.expectedStdout || testCase.expectedFileContent || '',
        outputFileName: testCase.expectedFileName,
        timeLimitMs: Math.min(10_000, Math.max(100, testCase.timeLimitMs)),
        memoryLimitMb: Math.min(512, Math.max(32, Math.round(testCase.memoryLimitKb / 1024) || 256)),
        score: testCase.rationaleTag === 'PERFORMANCE' ? 0 : Number(testCase.points),
        isHarness: Boolean(tcAny.isHarness || tcAny.kind === 'unit-list'),
        kind: typeof tcAny.kind === 'string' ? tcAny.kind : undefined,
      };
    });

    const language = languageOverride || submission.assignment.environment || 'C_GCC';
    const runner = SandboxRunnerFactory.createRunner(language);
    const requireDocker = !WEB_RUNNER_LANGUAGES.has(language.trim().toUpperCase());
    if (!executionFolderPath) throw new Error(`Không thể xác định thư mục workspace cho bài nộp: ${submissionId}`);
    const summary = await runner.execute(executionFolderPath, testCases, {
      targetBaseUrl: submission.deployedUrl ?? undefined,
      requireDocker,
    });
    const algorithmPerformanceScore = calculatePerformanceScore(testCasesToRun, summary.results);
    const normalizedSandboxScore = Number(
      (((summary.totalScore / (summary.maxScore || 1)) * submission.assignment.functionalMaxScore) || 0).toFixed(2)
    );
    await this.sandboxRepository.replaceTestResults(
      submission,
      summary,
      normalizedSandboxScore,
      algorithmPerformanceScore,
      gradingRunId
    );
    return {
      ...summary,
      results: summary.results.map(({ evidenceBase64: _evidenceBase64, ...result }) => result),
      sandboxScore: normalizedSandboxScore,
      algorithmPerformanceScore,
    };
  }
}
