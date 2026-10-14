import { SandboxExecutionSummary } from './sandbox-runner.interface.js';

export interface SandboxTestCaseRecord {
  id: string;
  label: string;
  paperCode: string | null;
  stdinInput: string | null;
  inputFileContent: string | null;
  expectedStdout: string | null;
  expectedFileContent: string | null;
  expectedFileName: string | null;
  timeLimitMs: number;
  memoryLimitKb: number;
  points: number;
}

export interface SandboxSubmissionRecord {
  id: string;
  zipFilePath: string | null;
  paperCode: string | null;
  assignment: {
    environment: string;
    maxFileSizeBytes: bigint;
    testCases: SandboxTestCaseRecord[];
  };
}

export interface SandboxStatusCounts {
  activeExecutions: number;
  totalGradedCount: number;
  failedExecutions: number;
}

export interface ISandboxRepository {
  findSubmissionForGrading(submissionId: string): Promise<SandboxSubmissionRecord | null>;
  updateWorkspacePath(submissionId: string, workspacePath: string): Promise<void>;
  replaceTestResults(
    submission: SandboxSubmissionRecord,
    summary: SandboxExecutionSummary,
    normalizedSandboxScore: number
  ): Promise<void>;
  getStatusCounts(): Promise<SandboxStatusCounts>;
}
