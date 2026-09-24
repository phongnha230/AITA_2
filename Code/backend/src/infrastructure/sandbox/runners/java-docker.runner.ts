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

export class JavaDockerRunner implements ISandboxRunner {
  public async execute(
    stagedFolderPath: string,
    testCases: TestCaseInput[],
  ): Promise<SandboxExecutionSummary> {
    const isDocker = env.USE_DOCKER_SANDBOX;
    const binDir = path.join(stagedFolderPath, "bin");
    if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });

    // 1. Quét tìm tất cả các file .java
    const javaFiles = this.getAllFiles(stagedFolderPath, ".java");
    if (javaFiles.length === 0) {
      return {
        success: false,
        compileError: "COMPILE_ERROR: Không tìm thấy file .java nào trong bài nộp.",
        totalTests: testCases.length,
        passedTests: 0,
        totalScore: 0,
        maxScore: testCases.reduce((sum, tc) => sum + tc.score, 0),
        results: [],
      };
    }

    // 2. Biên dịch javac
    const compileCmd = isDocker
      ? `docker run --rm --network none -v "${path.resolve(stagedFolderPath)}":/app -w /app openjdk:17-alpine sh -c "javac -encoding UTF-8 -d ./bin $(find . -name '*.java')"`
      : `javac -encoding UTF-8 -d "${binDir}" ${javaFiles.map((f: string) => `"${f}"`).join(" ")}`;

    try {
      await execAsync(compileCmd, { cwd: stagedFolderPath, timeout: 20000 });
    } catch (err: any) {
      return {
        success: false,
        compileError: err.stderr || err.stdout || err.message,
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
      const res = await this.runSingleTestCase(stagedFolderPath, tc, isDocker);
      results.push(res);
      if (res.passed) {
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
    const questionDir = path.join(stagedFolderPath, tc.questionNo);
    const workDir = fs.existsSync(questionDir) ? questionDir : stagedFolderPath;

    // Nạp file data.txt cho đề thi CSD201
    if (tc.outputFileName) {
      fs.writeFileSync(path.join(workDir, "data.txt"), tc.inputData);
    }

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
          `/app${fs.existsSync(questionDir) ? "/" + tc.questionNo : ""}`,
          "openjdk:17-alpine",
          "java",
          "-Xmx256m",
          "-cp",
          "/app/bin:./bin:.",
          "Main",
        ]);
      } else {
        childProcess = spawn(
          "java",
          ["-Xmx256m", "-cp", `${path.join(stagedFolderPath, "bin")};.`, "Main"],
          { cwd: workDir },
        );
      }

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

      // Nếu là console PRO192 thì bơm menu lựa chọn qua stdin
      if (tc.inputData && !tc.outputFileName) {
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
            errorMessage: `Time Limit Exceeded: Quá giới hạn ${tc.timeLimitMs}ms`,
          });
        }

        // Kiểm tra File-to-File Diff cho môn CSD201
        if (tc.outputFileName) {
          const generatedFilePath = path.join(workDir, tc.outputFileName);
          if (!fs.existsSync(generatedFilePath)) {
            return resolve({
              testCaseId: tc.id,
              questionNo: tc.questionNo,
              passed: false,
              status: "FILE_NOT_FOUND",
              actualOutput: "",
              expectedOutput: tc.expectedOutput,
              executionTimeMs: duration,
              memoryUsedKb: 0,
              errorMessage: `FILE_NOT_FOUND: Không tìm thấy file '${tc.outputFileName}' mà chương trình phải tạo ra.`,
            });
          }

          const fileContent = fs.readFileSync(generatedFilePath, "utf-8");
          const isMatch = OutputComparator.compare(fileContent, tc.expectedOutput);
          return resolve({
            testCaseId: tc.id,
            questionNo: tc.questionNo,
            passed: isMatch,
            status: isMatch ? "PASSED" : "WRONG_ANSWER",
            actualOutput: fileContent,
            expectedOutput: tc.expectedOutput,
            executionTimeMs: duration,
            memoryUsedKb: 0,
          });
        }

        // Kiểm tra Console thông thường
        const isMatch = OutputComparator.compare(stdout, tc.expectedOutput);
        resolve({
          testCaseId: tc.id,
          questionNo: tc.questionNo,
          passed: isMatch,
          status: isMatch ? "PASSED" : (code !== 0 ? "RUNTIME_ERROR" : "WRONG_ANSWER"),
          actualOutput: stdout,
          expectedOutput: tc.expectedOutput,
          executionTimeMs: duration,
          memoryUsedKb: 0,
          errorMessage: code !== 0 ? stderr : undefined,
        });
      });
    });
  }

  private getAllFiles(dir: string, ext: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory() && file !== "bin") {
        results = results.concat(this.getAllFiles(fullPath, ext));
      } else if (file.endsWith(ext)) {
        results.push(fullPath);
      }
    }
    return results;
  }
}
