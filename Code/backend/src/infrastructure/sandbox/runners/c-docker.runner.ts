import { exec, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import env from "../../config/env";
import { OutputComparator } from "../comparator/output-comparator";
import {
  ISandboxRunner,
  SandboxExecutionSummary,
  TestCaseInput,
  TestCaseResult,
} from "../interfaces/sandbox-runner.interface";

const execAsync = promisify(exec);

export class CDockerRunner implements ISandboxRunner {
  public async execute(
    stagedFolderPath: string,
    testCases: TestCaseInput[],
  ): Promise<SandboxExecutionSummary> {
    const isDocker = env.USE_DOCKER_SANDBOX;

    // 1. Tìm file mã nguồn .c
    const files = fs.readdirSync(stagedFolderPath);
    const mainFile =
      files.find((f) => f.toLowerCase() === "main.c") ||
      files.find((f) => f.endsWith(".c"));

    if (!mainFile) {
      return {
        success: false,
        compileError:
          "COMPILE_ERROR: Không tìm thấy file mã nguồn C (.c) trong thư mục bài làm.",
        totalTests: testCases.length,
        passedTests: 0,
        totalScore: 0,
        maxScore: testCases.reduce((sum, tc) => sum + tc.score, 0),
        results: [],
      };
    }

    // 2. Biên dịch mã nguồn gcc
    const compileCmd = isDocker
      ? `docker run --rm --network none -v "${path.resolve(stagedFolderPath)}":/app -w /app gcc:alpine gcc -O2 ${mainFile} -o main.out`
      : `gcc -O2 "${path.join(stagedFolderPath, mainFile)}" -o "${path.join(stagedFolderPath, "main.out")}"`;

    try {
      await execAsync(compileCmd, { timeout: 10000 });
    } catch (compileErr: any) {
      const errorMsg =
        compileErr.stderr || compileErr.stdout || compileErr.message;
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
        isDocker,
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
      totalTests: testCases.length,
      passedTests: passedCount,
      totalScore: Number(totalScore.toFixed(2)),
      maxScore: Number(
        testCases.reduce((sum, tc) => sum + tc.score, 0).toFixed(2),
      ),
      results,
    };
  }

  private async runSingleTestCase(
    stagedFolderPath: string,
    tc: TestCaseInput,
    isDocker: boolean,
  ): Promise<TestCaseResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      let isTimedOut = false;

      let childProcess: any;
      if (isDocker) {
        childProcess = spawn("docker", [
          "run",
          "--rm",
          "-i",
          "--network",
          "none",
          "--memory",
          `${tc.memoryLimitMb}m`,
          "-v",
          `${path.resolve(stagedFolderPath)}:/app`,
          "-w",
          "/app",
          "gcc:alpine",
          "./main.out",
        ]);
      } else {
        const exePath = path.join(
          stagedFolderPath,
          process.platform === "win32" ? "main.out.exe" : "main.out",
        );
        childProcess = spawn(exePath);
      }

      // Bộ đếm Timeout Watchdog (2000ms) - Ngắt vòng lặp vô tận while(1)
      const timer = setTimeout(() => {
        isTimedOut = true;
        childProcess.kill("SIGKILL");
      }, tc.timeLimitMs);

      childProcess.stdout?.on("data", (d: Buffer) => {
        stdout += d.toString();
      });
      childProcess.stderr?.on("data", (d: Buffer) => {
        stderr += d.toString();
      });

      // Bơm input vào stdin
      if (tc.inputData) {
        childProcess.stdin?.write(tc.inputData + "\n");
        childProcess.stdin?.end();
      }

      childProcess.on("close", (code: number) => {
        clearTimeout(timer);
        const duration = Date.now() - startTime;

        if (isTimedOut) {
          return resolve({
            testCaseId: tc.id,
            questionNo: tc.questionNo,
            passed: false,
            status: "TIME_LIMIT_EXCEEDED",
            actualOutput: stdout,
            expectedOutput: tc.expectedOutput,
            executionTimeMs: duration,
            memoryUsedKb: 0,
            errorMessage: `Time Limit Exceeded: Bài làm chạy quá ${tc.timeLimitMs}ms`,
          });
        }

        const isMatch = OutputComparator.compare(stdout, tc.expectedOutput);
        resolve({
          testCaseId: tc.id,
          questionNo: tc.questionNo,
          passed: isMatch,
          status: isMatch
            ? "PASSED"
            : code !== 0
              ? "RUNTIME_ERROR"
              : "WRONG_ANSWER",
          actualOutput: stdout,
          expectedOutput: tc.expectedOutput,
          executionTimeMs: duration,
          memoryUsedKb: 0,
          errorMessage: code !== 0 ? stderr : undefined,
        });
      });

      childProcess.on("error", (err: Error) => {
        clearTimeout(timer);
        resolve({
          testCaseId: tc.id,
          questionNo: tc.questionNo,
          passed: false,
          status: "RUNTIME_ERROR",
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
