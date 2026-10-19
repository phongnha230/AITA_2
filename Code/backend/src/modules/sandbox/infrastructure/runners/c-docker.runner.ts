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

    // 1. Tìm file mã nguồn .c
    const sourceFiles = this.getCSourceFiles(stagedFolderPath);
    if (sourceFiles.length === 0) {
      return {
        success: false,
        compileError:
          'COMPILE_ERROR: Không tìm thấy file mã nguồn C (.c) trong thư mục bài làm.',
        totalTests: testCases.length,
        passedTests: 0,
        totalScore: 0,
        maxScore: testCases.reduce((sum, tc) => sum + tc.score, 0),
        results: [],
      };
    }

    // 2. Biên dịch mã nguồn gcc với cờ Clean Code Static Analysis (-Wall -Wextra)
    const relativeSources = sourceFiles.map((sourceFile) => path.relative(stagedFolderPath, sourceFile));

    let compilerWarnings: string | null = null;
    try {
      const { stderr } = await execFileAsync(isDocker ? 'docker' : 'gcc', isDocker
        ? [
            'run', '--rm', '--network', 'none', '--cpus', '1.0', '--pids-limit', '50', '--cap-drop', 'ALL',
            '--security-opt', 'no-new-privileges', '-v', `${path.resolve(stagedFolderPath)}:/app`, '-w', '/app',
            'gcc:alpine', 'gcc', '-O2', '-Wall', '-Wextra', '-I', '/app',
            ...relativeSources.map((sourceFile) => `/app/${sourceFile.replace(/\\/g, '/')}`), '-o', '/app/main.out',
          ]
        : [
            '-O2', '-Wall', '-Wextra', '-I', stagedFolderPath,
            ...sourceFiles, '-o', path.join(stagedFolderPath, 'main.out'),
          ], { timeout: 10000, windowsHide: true });
      if (stderr && stderr.trim().length > 0) {
        compilerWarnings = stderr.trim();
      }
    } catch (compileError: unknown) {
      const errorMsg = getProcessError(compileError);
      return {
        success: false,
        compileError: errorMsg,
        totalTests: testCases.length,
        passedTests: 0,
        totalScore: 0,
        maxScore: testCases.reduce((sum, tc) => sum + tc.score, 0),
        results: [],
      };
    }

    // 3. Thực thi từng testcase
    const results: TestCaseResult[] = [];
    let passedCount = 0;
    let totalScore = 0;

    for (const tc of testCases) {
      const result = await this.runSingleTestCase(
        stagedFolderPath,
        tc,
        isDocker
      );
      results.push(result);
      if (result.passed) {
        passedCount++;
        totalScore += tc.score;
      }
    }

    return {
      success: true,
      compileError: null,
      compilerWarnings,
      totalTests: testCases.length,
      passedTests: passedCount,
      totalScore: Number(totalScore.toFixed(2)),
      maxScore: Number(
        testCases.reduce((sum, tc) => sum + tc.score, 0).toFixed(2)
      ),
      results,
    };
  }

  private getCSourceFiles(rootPath: string): string[] {
    const sourceFiles: string[] = [];
    const visit = (directoryPath: string): void => {
      for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
        const entryPath = path.join(directoryPath, entry.name);
        if (entry.isDirectory() && entry.name !== 'bin') visit(entryPath);
        else if (entry.isFile() && entry.name.toLowerCase().endsWith('.c')) sourceFiles.push(entryPath);
      }
    };
    visit(rootPath);
    return sourceFiles.sort((first, second) => {
      const firstName = path.basename(first).toLowerCase();
      const secondName = path.basename(second).toLowerCase();
      if (firstName === 'main.c') return -1;
      if (secondName === 'main.c') return 1;
      return first.localeCompare(second);
    });
  }

  private async runSingleTestCase(
    stagedFolderPath: string,
    tc: TestCaseInput,
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
          './main.out',
        ]);
      } else {
        const exePath = path.join(
          stagedFolderPath,
          process.platform === 'win32' ? 'main.out.exe' : 'main.out'
        );
        childProcess = spawn(exePath);
      }

      // Bộ đếm Timeout Watchdog
      const timer = setTimeout(() => {
        isTimedOut = true;
        killProcessTree(childProcess);
      }, tc.timeLimitMs);

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
      if (tc.inputData) {
        childProcess.stdin?.write(tc.inputData + '\n');
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
