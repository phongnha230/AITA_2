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
      await execAsync('docker ps', { timeout: 8000 });
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

    // TỐI ƯU CÔNG NGHỆ: 1 Container duy nhất cho toàn bộ bài thi khi chạy Docker
    if (isDocker) {
      return this.executeDockerSingleContainer(stagedFolderPath, testCases, allSourceFiles);
    }

    // 1. Gom nhóm các câu hỏi cần biên dịch (Chế độ Native local không Docker)
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

    // 3. Cơ chế chấm điểm: Partial Credit theo từng Test Case (Khuyến khích sinh viên):
    // Sinh viên vượt qua testcase nào sẽ nhận trọn điểm của testcase đó (r.earnedScore = tc.score).
    // Điểm tổng là tổng điểm các testcase vượt qua.
    let totalScore = 0;
    for (const r of results) {
      const matchedTc = testCases.find((tc) => tc.id === r.testCaseId);
      if (r.passed) {
        const earned = matchedTc?.score ?? 0;
        r.earnedScore = earned;
        totalScore += earned;
      } else {
        r.earnedScore = 0;
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

  /**
   * Tối ưu hóa hiệu năng Docker: Gom toàn bộ quy trình biên dịch (tất cả các câu Q1..Qn)
   * và chạy toàn bộ danh sách test cases vào duy nhất 1 Docker Container.
   * Giúp giảm thời gian chấm từ ~55 giây xuống chỉ còn ~3-5 giây!
   */
  private async executeDockerSingleContainer(
    stagedFolderPath: string,
    testCases: TestCaseInput[],
    allSourceFiles: string[]
  ): Promise<SandboxExecutionSummary> {
    const runnerDir = path.join(stagedFolderPath, '_aita_runner');
    try {
      if (fs.existsSync(runnerDir)) fs.rmSync(runnerDir, { recursive: true, force: true });
    } catch {}
    fs.mkdirSync(runnerDir, { recursive: true });

    const questionNos = Array.from(new Set(testCases.map((tc) => tc.questionNo || 'Q1')));
    let runScript = '#!/bin/sh\ncd /app\n';

    // 1. Biên dịch toàn bộ các câu hỏi trong 1 lượt
    for (const qNo of questionNos) {
      const qLower = qNo.toLowerCase();
      const sourceFile = this.findSourceForQuestion(stagedFolderPath, qNo, allSourceFiles);
      if (!sourceFile) {
        runScript += `echo "COMPILE_ERROR: Không tìm thấy file mã nguồn .c phù hợp cho câu hỏi ${qNo}." > /app/_aita_runner/${qLower}_compile.err\n`;
        runScript += `echo 1 > /app/_aita_runner/${qLower}_compile.status\n`;
        continue;
      }

      const relSource = path.relative(stagedFolderPath, sourceFile).replace(/\\/g, '/');
      const relSourceDir = path.relative(stagedFolderPath, path.dirname(sourceFile)).replace(/\\/g, '/');

      runScript += `gcc -O2 -Wall -Wextra -I /app -I /app/${relSourceDir} /app/${relSource} -o /app/${qLower}.out -lm > /app/_aita_runner/${qLower}_compile.err 2>&1\n`;
      runScript += `echo $? > /app/_aita_runner/${qLower}_compile.status\n`;
    }

    // 2. Chuẩn bị file input và lệnh chạy cho từng testcase
    testCases.forEach((tc, idx) => {
      const qLower = (tc.questionNo || 'Q1').toLowerCase();
      const inPath = path.join(runnerDir, `in_${idx}.txt`);
      const inputContent = (tc.stdinInput ?? tc.inputData ?? '') + '\n';
      fs.writeFileSync(inPath, inputContent);

      const timeSec = Math.max(1, Math.ceil((tc.timeLimitMs || 1000) / 1000) + 1);

      runScript += `if [ -f /app/${qLower}.out ] && [ "$(cat /app/_aita_runner/${qLower}_compile.status 2>/dev/null)" = "0" ]; then\n`;
      runScript += `  timeout -s KILL ${timeSec} /app/${qLower}.out < /app/_aita_runner/in_${idx}.txt > /app/_aita_runner/out_${idx}.txt 2> /app/_aita_runner/err_${idx}.txt\n`;
      runScript += `  echo $? > /app/_aita_runner/exit_${idx}.txt\n`;
      runScript += `else\n`;
      runScript += `  echo 999 > /app/_aita_runner/exit_${idx}.txt\n`;
      runScript += `fi\n`;
    });

    const scriptPath = path.join(runnerDir, 'run.sh');
    fs.writeFileSync(scriptPath, runScript.replace(/\r\n/g, '\n'), { mode: 0o777 });

    const dockerArgs = [
      'run', '--rm', '--network', 'none',
      '--cpus', '1.0', '--pids-limit', '100',
      '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
      '-v', `${path.resolve(stagedFolderPath)}:/app`,
      '-w', '/app',
      'gcc:alpine',
      'sh', '/app/_aita_runner/run.sh',
    ];

    const maxTimeoutMs = Math.max( testCases.length * 2000, 30000);
    try {
      await execFileAsync('docker', dockerArgs, {
        cwd: stagedFolderPath,
        timeout: maxTimeoutMs,
        windowsHide: true,
      });
    } catch (dockerErr: unknown) {
      logger.warn('single_container_docker_run_warning', {
        stage: 'SANDBOX_EXECUTION',
        error: getProcessError(dockerErr),
      });
    }

    // 3. Đọc kết quả biên dịch
    const compileErrors = new Map<string, string>();
    let lastCompilerWarnings: string | null = null;
    let anyCompileSucceeded = false;

    for (const qNo of questionNos) {
      const qLower = qNo.toLowerCase();
      const statusFile = path.join(runnerDir, `${qLower}_compile.status`);
      const errFile = path.join(runnerDir, `${qLower}_compile.err`);
      const status = fs.existsSync(statusFile) ? fs.readFileSync(statusFile, 'utf8').trim() : '1';
      const errMsg = fs.existsSync(errFile) ? fs.readFileSync(errFile, 'utf8').trim() : '';

      if (status !== '0') {
        compileErrors.set(qNo, errMsg || `COMPILE_ERROR câu hỏi ${qNo}`);
      } else {
        anyCompileSucceeded = true;
        if (errMsg) lastCompilerWarnings = errMsg;
      }
    }

    // Nếu tất cả các câu đều lỗi compile
    if (!anyCompileSucceeded && questionNos.length > 0) {
      const firstError = compileErrors.get(questionNos[0]) || 'COMPILE_ERROR';
      try {
        if (fs.existsSync(runnerDir)) fs.rmSync(runnerDir, { recursive: true, force: true });
      } catch {}
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

    // 4. Trích xuất kết quả từng testcase
    const results: TestCaseResult[] = [];
    let passedCount = 0;
    let totalScore = 0;

    testCases.forEach((tc, idx) => {
      const qNo = tc.questionNo || 'Q1';
      const compileErr = compileErrors.get(qNo);

      if (compileErr) {
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
          errorMessage: compileErr,
        });
        return;
      }

      const exitFile = path.join(runnerDir, `exit_${idx}.txt`);
      const outFile = path.join(runnerDir, `out_${idx}.txt`);
      const errFile = path.join(runnerDir, `err_${idx}.txt`);

      const exitCode = fs.existsSync(exitFile) ? fs.readFileSync(exitFile, 'utf8').trim() : '999';
      const stdout = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8') : '';
      const stderr = fs.existsSync(errFile) ? fs.readFileSync(errFile, 'utf8') : '';

      if (stdout.length > MAX_OUTPUT_BYTES) {
        results.push({
          testCaseId: tc.id,
          questionNo: tc.questionNo,
          passed: false,
          status: 'OUTPUT_LIMIT_EXCEEDED',
          actualOutput: stdout.slice(0, 1000) + '... [TRUNCATED]',
          expectedOutput: tc.expectedOutput,
          executionTimeMs: 0,
          memoryUsedKb: 0,
          earnedScore: 0,
          errorMessage: 'Output Limit Exceeded: Chương trình in quá 5MB dữ liệu.',
        });
        return;
      }

      if (exitCode === '137' || exitCode === '143') {
        results.push({
          testCaseId: tc.id,
          questionNo: tc.questionNo,
          passed: false,
          status: 'TIME_LIMIT_EXCEEDED',
          actualOutput: stdout,
          expectedOutput: tc.expectedOutput,
          executionTimeMs: tc.timeLimitMs,
          memoryUsedKb: 0,
          earnedScore: 0,
          errorMessage: `Time Limit Exceeded: Bài làm chạy quá ${tc.timeLimitMs}ms`,
        });
        return;
      }

      const isMatch = OutputComparator.compare(stdout, tc.expectedOutput);
      const isPassed = isMatch && exitCode === '0';
      const earnedScore = isPassed ? tc.score : 0;
      if (isPassed) {
        passedCount++;
        totalScore += earnedScore;
      }

      results.push({
        testCaseId: tc.id,
        questionNo: tc.questionNo,
        passed: isPassed,
        status: isPassed ? 'PASSED' : exitCode !== '0' ? 'RUNTIME_ERROR' : 'WRONG_ANSWER',
        actualOutput: stdout,
        expectedOutput: tc.expectedOutput,
        executionTimeMs: 0,
        memoryUsedKb: 0,
        earnedScore,
        errorMessage: exitCode !== '0' ? stderr : undefined,
      });
    });

    // Dọn dẹp thư mục runner tạm
    try {
      if (fs.existsSync(runnerDir)) fs.rmSync(runnerDir, { recursive: true, force: true });
    } catch {}

    return {
      success: true,
      compileError: null,
      compilerWarnings: lastCompilerWarnings,
      totalTests: testCases.length,
      passedTests: passedCount,
      totalScore: Number(totalScore.toFixed(2)),
      maxScore: Number(testCases.reduce((sum, tc) => sum + tc.score, 0).toFixed(2)),
      results,
    };
  }

  private getAllCSourceFiles(rootPath: string): string[] {
    const sourceFiles: string[] = [];
    const visit = (directoryPath: string): void => {
      for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
        const entryPath = path.join(directoryPath, entry.name);
        if (entry.isDirectory() && entry.name !== 'bin' && entry.name !== 'run' && entry.name !== '_aita_runner') {
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
