import { ChildProcess, exec, execFile, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { env } from '../../../../infrastructure/config/env.js';
import { OutputComparator } from '../comparator/output-comparator.js';
import {
  ISandboxRunner,
  SandboxExecutionSummary,
  TestCaseInput,
  TestCaseResult,
} from '../../domain/interfaces/sandbox-runner.interface.js';
import { logger } from '../../../../infrastructure/logging/logger.js';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);
const MAX_OUTPUT_BYTES = 5 * 1024 * 1024; // 5MB max output buffer

function killProcessTree(childProcess: ChildProcess): void {
  if (!childProcess || !childProcess.pid) return;
  try {
    if (process.platform === 'win32') {
      exec(`taskkill /pid ${childProcess.pid} /T /F`, () => {});
    } else {
      childProcess.kill('SIGKILL');
    }
  } catch (error) {
    logger.warn('sandbox_process_kill_failed', { stage: 'SANDBOX_EXECUTION', error });
  }
}

function getProcessError(error: unknown): string {
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    for (const key of ['stderr', 'stdout', 'message']) {
      if (typeof record[key] === 'string' && record[key]) return record[key];
    }
  }
  return String(error);
}

interface CompiledBinaryInfo {
  binaryName: string;
  compileError?: string;
}

export class CDockerRunner implements ISandboxRunner {
  private async isDockerDaemonRunning(): Promise<boolean> {
    if (!env.USE_DOCKER_SANDBOX) return false;
    try {
      await execAsync('docker ps', { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  public async execute(
    stagedFolderPath: string,
    testCases: TestCaseInput[],
    context?: { targetBaseUrl?: string; requireDocker?: boolean }
  ): Promise<SandboxExecutionSummary> {
    const isDocker = await this.isDockerDaemonRunning();
    if (context?.requireDocker && !isDocker) {
      throw new Error('Docker Sandbox is unavailable; local execution is disabled for this request.');
    }

    const allSourceFiles = this.getAllCSourceFiles(stagedFolderPath);
    if (allSourceFiles.length === 0) {
      return {
        success: false,
        compileError: 'COMPILE_ERROR: Không tìm thấy file mã nguồn C (.c) trong thư mục bài làm.',
        totalTests: testCases.length,
        passedTests: 0,
        totalScore: 0,
        maxScore: testCases.reduce((sum, tc) => sum + tc.score, 0),
        results: [],
      };
    }

    // 1. Gom nhóm các câu hỏi cần biên dịch
    const questionNos = Array.from(new Set(testCases.map((tc) => tc.questionNo || 'Q1')));
    const binaries = new Map<string, CompiledBinaryInfo>();
    let lastCompilerWarnings: string | null = null;

    for (const qNo of questionNos) {
      const sourceFile = this.findSourceForQuestion(stagedFolderPath, qNo, allSourceFiles);
      if (!sourceFile) {
        binaries.set(qNo, {
          binaryName: '',
          compileError: `COMPILE_ERROR: Không tìm thấy file mã nguồn .c phù hợp cho câu hỏi ${qNo}.`,
        });
        continue;
      }

      const outBinaryName = `${qNo.toLowerCase()}.out`;
      const relSource = path.relative(stagedFolderPath, sourceFile).replace(/\\/g, '/');
      const relSourceDir = path.relative(stagedFolderPath, path.dirname(sourceFile)).replace(/\\/g, '/');

      const compileArgs = isDocker
        ? [
            'run', '--rm', '--network', 'none', '--cpus', '1.0', '--pids-limit', '50', '--cap-drop', 'ALL',
            '--security-opt', 'no-new-privileges', '-v', `${path.resolve(stagedFolderPath)}:/app`, '-w', '/app',
            'gcc:alpine', 'gcc', '-O2', '-Wall', '-Wextra',
            '-I', '/app',
            '-I', `/app/${relSourceDir}`,
            `/app/${relSource}`,
            '-o', `/app/${outBinaryName}`,
            '-lm',
          ]
        : [
            '-O2', '-Wall', '-Wextra',
            '-I', stagedFolderPath,
            '-I', path.dirname(sourceFile),
            sourceFile,
            '-o', path.join(stagedFolderPath, process.platform === 'win32' ? `${qNo.toLowerCase()}.exe` : outBinaryName),
            '-lm',
          ];

      try {
        const { stderr } = await execFileAsync(isDocker ? 'docker' : 'gcc', compileArgs, {
          cwd: stagedFolderPath,
          timeout: 10000,
          windowsHide: true,
        });
        if (stderr && stderr.trim().length > 0) {
          lastCompilerWarnings = stderr.trim();
        }
        binaries.set(qNo, { binaryName: outBinaryName });
      } catch (compileError: unknown) {
        binaries.set(qNo, {
          binaryName: '',
          compileError: getProcessError(compileError),
        });
      }
    }

    // Nếu tất cả các câu đều compile lỗi
    const allFailed = questionNos.every((q) => binaries.get(q)?.compileError);
    if (allFailed && questionNos.length > 0) {
      const firstError = binaries.get(questionNos[0])?.compileError || 'COMPILE_ERROR';
      return {
        success: false,
        compileError: firstError,
        totalTests: testCases.length,
        passedTests: 0,
        totalScore: 0,
        maxScore: testCases.reduce((sum, tc) => sum + tc.score, 0),
        results: [],
      };
    }

    // 2. Chạy từng testcase
    const results: TestCaseResult[] = [];
    let passedCount = 0;

    for (const tc of testCases) {
      const qNo = tc.questionNo || 'Q1';
      const binaryInfo = binaries.get(qNo);

      if (!binaryInfo || binaryInfo.compileError) {
        results.push({
          testCaseId: tc.id,
          questionNo: tc.questionNo,
          passed: false,
          status: 'COMPILE_ERROR',
          actualOutput: '',
          expectedOutput: tc.expectedOutput,
          executionTimeMs: 0,
          memoryUsedKb: 0,
          earnedScore: 0,
          errorMessage: binaryInfo?.compileError || `Không thể biên dịch câu hỏi ${qNo}`,
        });
        continue;
      }

      const res = await this.runSingleTestCase(
        stagedFolderPath,
        tc,
        binaryInfo.binaryName,
        isDocker
      );
      results.push(res);
      if (res.passed) {
        passedCount++;
      }
    }

    // 3. Cơ chế All-or-Nothing theo từng câu (FPT PE Exam Rule):
    // Sinh viên phải vượt qua 100% testcases của câu đó mới được tính điểm câu đó.
    let totalScore = 0;
    for (const qNo of questionNos) {
      const qCases = testCases.filter((tc) => (tc.questionNo || 'Q1') === qNo);
      const qResults = results.filter((r) => (r.questionNo || 'Q1') === qNo);
      const isQuestionFullPass =
        qResults.length === qCases.length &&
        qResults.every((r) => r.passed);

      const qTotalMarks = qCases.reduce((sum, tc) => sum + tc.score, 0);

      if (isQuestionFullPass) {
        totalScore += qTotalMarks;
        for (const r of qResults) {
          const matchedTc = qCases.find((tc) => tc.id === r.testCaseId);
          r.earnedScore = matchedTc?.score ?? 0;
        }
      } else {
        for (const r of qResults) {
          r.earnedScore = 0;
        }
      }
    }

    return {
      success: true,
      compileError: null,
      compilerWarnings: lastCompilerWarnings,
      totalTests: testCases.length,
      passedTests: passedCount,
      totalScore: Number(totalScore.toFixed(2)),
      maxScore: Number(
        testCases.reduce((sum, tc) => sum + tc.score, 0).toFixed(2)
      ),
      results,
    };
  }

  private getAllCSourceFiles(rootPath: string): string[] {
    const sourceFiles: string[] = [];
    const visit = (directoryPath: string): void => {
      for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
        const entryPath = path.join(directoryPath, entry.name);
        if (entry.isDirectory() && entry.name !== 'bin' && entry.name !== 'run') {
          visit(entryPath);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.c')) {
          sourceFiles.push(entryPath);
        }
      }
    };
    visit(rootPath);
    return sourceFiles;
  }

  private findSourceForQuestion(
    stagedFolderPath: string,
    questionNo: string,
    allFiles: string[]
  ): string | null {
    const qNum = questionNo.replace(/\D/g, '');
    const exactTarget = `${questionNo.toLowerCase()}.c`;

    // 1. Khớp chính xác tên file: Q1.c / q1.c
    const exactMatches = allFiles.filter(
      (f) => path.basename(f).toLowerCase() === exactTarget
    );
    if (exactMatches.length === 1) return exactMatches[0];
    if (exactMatches.length > 1) {
      // Ưu tiên file nằm trong thư mục chứa số câu hỏi (ví dụ: 1/src/Q1.c hoặc Q1/Q1.c)
      const preferred = exactMatches.find((f) => {
        const parts = f.split(path.sep);
        return parts.some(
          (p) => p.toLowerCase() === questionNo.toLowerCase() || p === qNum
        );
      });
      if (preferred) return preferred;
      return exactMatches[0];
    }

    // 2. Tìm theo thư mục câu hỏi (ví dụ: staged/1/... hoặc staged/Q1/...)
    const inQuestionDir = allFiles.filter((f) => {
      const parts = f.split(path.sep);
      return parts.some(
        (p) => p.toLowerCase() === questionNo.toLowerCase() || p === qNum
      );
    });
    if (inQuestionDir.length > 0) {
      const mainMatch = inQuestionDir.find(
        (f) =>
          path.basename(f).toLowerCase() === 'main.c' ||
          path.basename(f).toLowerCase() === exactTarget
      );
      if (mainMatch) return mainMatch;
      return inQuestionDir[0];
    }

    // 3. Fallback: Nếu chỉ có 1 file duy nhất trong bài nộp
    if (allFiles.length === 1) return allFiles[0];

    return null;
  }

  private async runSingleTestCase(
    stagedFolderPath: string,
    tc: TestCaseInput,
    binaryName: string,
    isDocker: boolean
  ): Promise<TestCaseResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let isTimedOut = false;
      let isOutputLimitExceeded = false;

      let childProcess: ChildProcess;
      if (isDocker) {
        childProcess = spawn('docker', [
          'run',
          '--rm',
          '-i',
          '--network',
          'none',
          '--cpus',
          '1.0',
          '--pids-limit',
          '50',
          '--cap-drop',
          'ALL',
          '--security-opt',
          'no-new-privileges',
          '--memory',
          `${tc.memoryLimitMb}m`,
          '-v',
          `${path.resolve(stagedFolderPath)}:/app`,
          '-w',
          '/app',
          'gcc:alpine',
          `./${binaryName}`,
        ]);
      } else {
        const exePath = path.join(
          stagedFolderPath,
          process.platform === 'win32'
            ? `${binaryName.replace(/\.out$/, '')}.exe`
            : binaryName
        );
        childProcess = spawn(exePath);
      }

      // Bộ đếm Timeout Watchdog: Bổ sung padding khởi tạo container Docker trên Windows/WSL2
      const watchdogTimeoutMs = isDocker
        ? Math.max(tc.timeLimitMs + 8000, 10000)
        : tc.timeLimitMs;

      const timer = setTimeout(() => {
        isTimedOut = true;
        killProcessTree(childProcess);
      }, watchdogTimeoutMs);

      childProcess.stdout?.on('data', (d: Buffer) => {
        if (stdout.length + d.length > MAX_OUTPUT_BYTES) {
          isOutputLimitExceeded = true;
          killProcessTree(childProcess);
          return;
        }
        stdout += d.toString();
      });

      childProcess.stderr?.on('data', (d: Buffer) => {
        if (stderr.length + d.length <= MAX_OUTPUT_BYTES) {
          stderr += d.toString();
        }
      });

      // Bơm input vào stdin
      const input = tc.stdinInput ?? tc.inputData ?? '';
      if (input) {
        childProcess.stdin?.write(input + '\n');
        childProcess.stdin?.end();
      }

      childProcess.on('close', (code: number | null) => {
        clearTimeout(timer);
        const duration = Date.now() - startTime;

        if (isTimedOut) {
          return resolve({
            testCaseId: tc.id,
            questionNo: tc.questionNo,
            passed: false,
            status: 'TIME_LIMIT_EXCEEDED',
            actualOutput: stdout,
            expectedOutput: tc.expectedOutput,
            executionTimeMs: duration,
            memoryUsedKb: 0,
            errorMessage: `Time Limit Exceeded: Bài làm chạy quá ${tc.timeLimitMs}ms`,
          });
        }

        if (isOutputLimitExceeded) {
          return resolve({
            testCaseId: tc.id,
            questionNo: tc.questionNo,
            passed: false,
            status: 'OUTPUT_LIMIT_EXCEEDED',
            actualOutput: stdout.slice(0, 1000) + '... [TRUNCATED]',
            expectedOutput: tc.expectedOutput,
            executionTimeMs: duration,
            memoryUsedKb: 0,
            errorMessage: 'Output Limit Exceeded: Chương trình in quá 5MB dữ liệu (vòng lặp in vô tận).',
          });
        }

        const isMatch = OutputComparator.compare(stdout, tc.expectedOutput);
        resolve({
          testCaseId: tc.id,
          questionNo: tc.questionNo,
          passed: isMatch,
          status: isMatch
            ? 'PASSED'
            : code !== 0
            ? 'RUNTIME_ERROR'
            : 'WRONG_ANSWER',
          actualOutput: stdout,
          expectedOutput: tc.expectedOutput,
          executionTimeMs: duration,
          memoryUsedKb: 0,
          errorMessage: code !== 0 ? stderr : undefined,
        });
      });

      childProcess.on('error', (err: Error) => {
        clearTimeout(timer);
        resolve({
          testCaseId: tc.id,
          questionNo: tc.questionNo,
          passed: false,
          status: 'RUNTIME_ERROR',
          actualOutput: stdout,
          expectedOutput: tc.expectedOutput,
          executionTimeMs: Date.now() - startTime,
          memoryUsedKb: 0,
          errorMessage: err.message,
        });
      });
    });
  }
}
