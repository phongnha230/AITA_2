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
const MAX_GENERATED_FILE_BYTES = 10 * 1024 * 1024; // 10MB max generated file size

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

const TEST_HARNESS_JAVA_SOURCE = `import java.io.*;
import java.lang.reflect.*;
import java.util.*;
import java.util.regex.*;

public class TestHarness {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String method = sc.nextLine().trim();
        String rawList = sc.hasNextLine() ? sc.nextLine().trim() : "";

        Class<?> myClass = null;
        Class<?> entityClass = null;

        List<String> checkList = new ArrayList<>();
        File curDir = new File(".");
        String[] files = curDir.list();
        if (files != null) for (String f : files) checkList.add(f);

        File srcDir = new File("src");
        if (srcDir.exists() && srcDir.isDirectory()) {
            String[] sFiles = srcDir.list();
            if (sFiles != null) for (String f : sFiles) checkList.add(f);
        }

        File binDir = new File("bin");
        if (binDir.exists() && binDir.isDirectory()) {
            String[] bFiles = binDir.list();
            if (bFiles != null) for (String f : bFiles) checkList.add(f);
        }

        for (String cf : checkList) {
            String cname = cf.replaceAll("\\\\.(class|java)$", "");
            if (cname.startsWith("My") && !cname.equals("MyString") && !cname.equals("MyList")) {
                try {
                    Class<?> c = Class.forName(cname);
                    myClass = c;
                    String base = cname.substring(2);
                    try {
                        entityClass = Class.forName(base);
                    } catch (Exception ignored) {}
                } catch (Exception ignored) {}
            }
        }

        if (entityClass == null) {
            try {
                Class<?> mainCls = Class.forName("Main");
                for (Method m : mainCls.getDeclaredMethods()) {
                    if (m.getName().equals("dispList") && m.getParameterCount() == 1) {
                        Type genType = m.getGenericParameterTypes()[0];
                        if (genType instanceof ParameterizedType) {
                            Type[] typeArgs = ((ParameterizedType) genType).getActualTypeArguments();
                            if (typeArgs.length > 0 && typeArgs[0] instanceof Class) {
                                entityClass = (Class<?>) typeArgs[0];
                            }
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        if (myClass == null && entityClass != null) {
            try {
                myClass = Class.forName("My" + entityClass.getSimpleName());
            } catch (Exception ignored) {}
        }

        if (myClass == null || entityClass == null) {
            System.err.println("Cannot find target classes: myClass=" + myClass + ", entityClass=" + entityClass);
            System.exit(1);
        }

        List<Object> list = new ArrayList<>();
        Constructor<?> cons = null;
        for (Constructor<?> c : entityClass.getConstructors()) {
            Class<?>[] p = c.getParameterTypes();
            if (p.length == 2 && p[0] == String.class && (p[1] == int.class || p[1] == Integer.class)) {
                cons = c;
                break;
            }
        }

        if (cons == null) {
            System.err.println("Cannot find constructor (String, int) on " + entityClass);
            System.exit(1);
        }

        Pattern pattern = Pattern.compile("\\\\(([^,]+),\\\\s*(-?\\\\d+)\\\\)");
        Matcher matcher = pattern.matcher(rawList);
        while (matcher.find()) {
            String typeStr = matcher.group(1).trim();
            int priceVal = Integer.parseInt(matcher.group(2).trim());
            Object item = cons.newInstance(typeStr, priceVal);
            list.add(item);
        }

        Object myInstance = myClass.getDeclaredConstructor().newInstance();

        String targetMethodName = method;
        if (targetMethodName.equals("1")) targetMethodName = "f1";
        if (targetMethodName.equals("2")) targetMethodName = "f2";
        if (targetMethodName.equals("3")) targetMethodName = "f3";

        Method m = myClass.getMethod(targetMethodName, List.class);

        System.out.println("OUTPUT:");
        if (targetMethodName.equals("f1")) {
            Object res = m.invoke(myInstance, list);
            System.out.println(res);
        } else {
            m.invoke(myInstance, list);
            boolean printed = false;
            try {
                Class<?> mainCls = Class.forName("Main");
                Method dispM = mainCls.getDeclaredMethod("dispList", List.class);
                dispM.setAccessible(true);
                dispM.invoke(null, list);
                printed = true;
            } catch (Exception ignored) {}

            if (!printed) {
                StringBuilder sb = new StringBuilder();
                for (Object item : list) {
                    try {
                        Method g1 = null;
                        for (String mName : new String[]{"getType", "getName", "getMaker"}) {
                            try { g1 = entityClass.getMethod(mName); break; } catch (Exception ex) {}
                        }
                        Method g2 = null;
                        for (String mName : new String[]{"getPrice", "getVolume", "getRate", "getCost"}) {
                            try { g2 = entityClass.getMethod(mName); break; } catch (Exception ex) {}
                        }
                        if (g1 != null && g2 != null) {
                            sb.append(String.format("(%s,%d) ", g1.invoke(item), g2.invoke(item)));
                        } else {
                            sb.append(item.toString()).append(" ");
                        }
                    } catch (Exception ignored) {
                        sb.append(item.toString()).append(" ");
                    }
                }
                System.out.println(sb.toString().trim());
            }
        }
    }
}
`;

interface QuestionCompilationResult {
  qNo: string;
  qDir: string;
  success: boolean;
  compileError?: string;
}

export class JavaDockerRunner implements ISandboxRunner {
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

    // 1. Nhận diện các thư mục câu hỏi (Q1, Q2, Q3, Q4...)
    const questionDirs = this.getQuestionDirs(stagedFolderPath);
    const questionNos = Array.from(new Set(testCases.map((tc) => tc.questionNo || 'Q1')));

    const compilations = new Map<string, QuestionCompilationResult>();
    let lastCompilerWarnings: string | null = null;

    // 2. Biên dịch độc lập cho từng câu hỏi
    for (const qNo of questionNos) {
      const qDir = questionDirs.get(qNo) || stagedFolderPath;
      const binDir = path.join(qDir, 'bin');
      if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });

      // Copy các file .class có sẵn trong src/ (như ILadder.class, Main.class) sang bin/
      const srcDir = path.join(qDir, 'src');
      if (fs.existsSync(srcDir)) {
        for (const file of fs.readdirSync(srcDir)) {
          if (file.endsWith('.class')) {
            try {
              fs.copyFileSync(path.join(srcDir, file), path.join(binDir, file));
            } catch {}
          }
        }
      }

      // Kiểm tra xem câu này có testcase unit-list / isHarness (như PRO192 Q3) không
      const hasHarnessCase = testCases.some(
        (tc) =>
          (tc.questionNo || 'Q1') === qNo &&
          (tc.isHarness || tc.kind === 'unit-list' || (tc.stdinInput && /^f[123]\b/m.test(tc.stdinInput)))
      );
      if (hasHarnessCase) {
        const harnessPath = fs.existsSync(srcDir)
          ? path.join(srcDir, 'TestHarness.java')
          : path.join(qDir, 'TestHarness.java');
        fs.writeFileSync(harnessPath, TEST_HARNESS_JAVA_SOURCE, 'utf-8');
      }

      // Quét tất cả file .java trong qDir
      const javaFiles = this.getAllFiles(qDir, '.java');
      if (javaFiles.length === 0) {
        compilations.set(qNo, {
          qNo,
          qDir,
          success: false,
          compileError: `COMPILE_ERROR: Không tìm thấy file .java nào cho câu hỏi ${qNo}.`,
        });
        continue;
      }

      const relQDir = path.relative(stagedFolderPath, qDir).replace(/\\/g, '/');
      const dockerWorkDir = relQDir ? `/app/${relQDir}` : '/app';

      const compileArgs = isDocker
        ? [
            'run', '--rm', '--network', 'none', '--cpus', '1.0', '--pids-limit', '50', '--cap-drop', 'ALL',
            '--security-opt', 'no-new-privileges', '-v', `${path.resolve(stagedFolderPath)}:/app`, '-w', dockerWorkDir,
            'openjdk:17-alpine', 'javac', '-nowarn', '-encoding', 'UTF-8',
            '-cp', './bin:./src:.:/app/bin',
            '-d', './bin',
            ...javaFiles.map((file) => `/app/${path.relative(stagedFolderPath, file).replace(/\\/g, '/')}`),
          ]
        : [
            '-nowarn', '-encoding', 'UTF-8',
            '-cp', `${path.join(qDir, 'bin')}${path.delimiter}${path.join(qDir, 'src')}${path.delimiter}${qDir}${path.delimiter}.`,
            '-d', binDir,
            ...javaFiles,
          ];

      try {
        const { stderr } = await execFileAsync(isDocker ? 'docker' : 'javac', compileArgs, {
          cwd: qDir,
          timeout: 20000,
          windowsHide: true,
        });
        if (stderr && stderr.trim().length > 0) {
          lastCompilerWarnings = stderr.trim();
        }
        compilations.set(qNo, { qNo, qDir, success: true });
      } catch (error: unknown) {
        compilations.set(qNo, {
          qNo,
          qDir,
          success: false,
          compileError: getProcessError(error),
        });
      }
    }

    // Nếu tất cả câu hỏi đều compile thất bại
    const allFailed = questionNos.every((q) => compilations.get(q)?.success === false);
    if (allFailed && questionNos.length > 0) {
      const firstError = compilations.get(questionNos[0])?.compileError || 'COMPILE_ERROR';
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

    // 3. Thực thi từng testcase
    const results: TestCaseResult[] = [];
    let passedCount = 0;
    let totalScore = 0;

    for (const tc of testCases) {
      const qNo = tc.questionNo || 'Q1';
      const comp = compilations.get(qNo);

      if (!comp || !comp.success) {
        results.push({
          testCaseId: tc.id,
          questionNo: tc.questionNo,
          passed: false,
          status: 'COMPILE_ERROR',
          actualOutput: '',
          expectedOutput: tc.expectedOutput,
          executionTimeMs: 0,
          memoryUsedKb: 0,
          errorMessage: comp?.compileError || `Không thể biên dịch câu hỏi ${qNo}`,
        });
        continue;
      }

      const qDir = questionDirs.get(qNo) || stagedFolderPath;
      const res = await this.runSingleTestCase(stagedFolderPath, qDir, tc, isDocker);
      results.push(res);
      if (res.passed) {
        passedCount++;
        totalScore += tc.score;
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

  private getQuestionDirs(rootPath: string): Map<string, string> {
    const map = new Map<string, string>();
    for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const match = entry.name.match(/^Q(\d+)$/i);
        if (match) {
          map.set(`Q${match[1]}`, path.join(rootPath, entry.name));
        }
      }
    }
    return map;
  }

  private async runSingleTestCase(
    stagedFolderPath: string,
    workDir: string,
    tc: TestCaseInput,
    isDocker: boolean
  ): Promise<TestCaseResult> {
    const startTime = Date.now();
    const relQDir = path.relative(stagedFolderPath, workDir).replace(/\\/g, '/');

    // 1. Phân loại loại bài thi & chuẩn bị input
    const isFileToFile = Boolean(tc.outputFileName || tc.inputFileContent);
    const useTestHarness = Boolean(
      tc.isHarness ||
      tc.kind === 'unit-list' ||
      (tc.stdinInput && /^f[123]\b/m.test(tc.stdinInput))
    );

    // Môn CSD201: Chuẩn bị file data.txt & dọn dẹp file kết quả f<n>.txt cũ
    if (isFileToFile) {
      const dataContent = tc.inputFileContent || (tc.outputFileName ? tc.inputData : '');
      if (dataContent) {
        fs.writeFileSync(path.join(workDir, 'data.txt'), dataContent, 'utf-8');
      }
      for (const fn of ['f1.txt', 'f2.txt', 'f3.txt', 'f4.txt']) {
        try {
          fs.unlinkSync(path.join(workDir, fn));
        } catch {}
      }
    }

    // Xác định stdin cần bơm vào chương trình
    let stdinToSend = '';
    if (isFileToFile) {
      // Menu choice cho CSD201 (ví dụ "1\n" hoặc rút trích số từ "f1.txt")
      const choice = tc.stdinInput?.trim() || (tc.outputFileName ? tc.outputFileName.replace(/\D/g, '') : '1');
      stdinToSend = `${choice}\n`;
    } else {
      // Console stdin cho PRO192 (main-run hoặc TestHarness)
      stdinToSend = (tc.stdinInput ?? tc.inputData ?? '') + '\n';
    }

    const mainClass = useTestHarness ? 'TestHarness' : 'Main';

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let isTimedOut = false;
      let isOutputLimitExceeded = false;

      let childProcess: ChildProcess;
      if (isDocker) {
        const dockerWorkDir = relQDir ? `/app/${relQDir}` : '/app';
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
          dockerWorkDir,
          'openjdk:17-alpine',
          'java',
          '-Xmx256m',
          '-cp',
          './bin:./src:.:/app/bin',
          mainClass,
        ]);
      } else {
        childProcess = spawn(
          'java',
          [
            '-Xmx256m',
            '-cp',
            `${path.join(workDir, 'bin')}${path.delimiter}${path.join(workDir, 'src')}${path.delimiter}${workDir}${path.delimiter}.`,
            mainClass,
          ],
          { cwd: workDir }
        );
      }

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

      if (stdinToSend) {
        childProcess.stdin?.write(stdinToSend);
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
            errorMessage: `Time Limit Exceeded: Quá giới hạn ${tc.timeLimitMs}ms`,
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

        // Kiểm tra File-to-File Diff cho môn CSD201
        if (tc.outputFileName) {
          const generatedFilePath = path.join(workDir, tc.outputFileName);
          if (fs.existsSync(generatedFilePath)) {
            const stat = fs.statSync(generatedFilePath);
            if (stat.size > MAX_GENERATED_FILE_BYTES) {
              return resolve({
                testCaseId: tc.id,
                questionNo: tc.questionNo,
                passed: false,
                status: 'OUTPUT_LIMIT_EXCEEDED',
                actualOutput: '[FILE EXCEEDS 10MB]',
                expectedOutput: tc.expectedOutput,
                executionTimeMs: duration,
                memoryUsedKb: 0,
                errorMessage: `OUTPUT_LIMIT_EXCEEDED: File '${tc.outputFileName}' vượt quá dung lượng cho phép (10MB).`,
              });
            }

            const fileContent = fs.readFileSync(generatedFilePath, 'utf-8');
            const isMatch = OutputComparator.compare(fileContent, tc.expectedOutput);
            return resolve({
              testCaseId: tc.id,
              questionNo: tc.questionNo,
              passed: isMatch,
              status: isMatch ? 'PASSED' : 'WRONG_ANSWER',
              actualOutput: fileContent,
              expectedOutput: tc.expectedOutput,
              executionTimeMs: duration,
              memoryUsedKb: 0,
            });
          }

          // Fallback: Kiểm tra xem Lib.viewFile có in kết quả ra stdout hay không
          const isMatchStdout = OutputComparator.compare(stdout, tc.expectedOutput);
          if (isMatchStdout) {
            return resolve({
              testCaseId: tc.id,
              questionNo: tc.questionNo,
              passed: true,
              status: 'PASSED',
              actualOutput: stdout,
              expectedOutput: tc.expectedOutput,
              executionTimeMs: duration,
              memoryUsedKb: 0,
            });
          }

          return resolve({
            testCaseId: tc.id,
            questionNo: tc.questionNo,
            passed: false,
            status: 'FILE_NOT_FOUND',
            actualOutput: stdout,
            expectedOutput: tc.expectedOutput,
            executionTimeMs: duration,
            memoryUsedKb: 0,
            errorMessage: `FILE_NOT_FOUND: Không tìm thấy file '${tc.outputFileName}' mà chương trình phải tạo ra.`,
          });
        }

        // Kiểm tra Console chuẩn (PRO192 / General Java)
        const isMatch = OutputComparator.compare(stdout, tc.expectedOutput);
        resolve({
          testCaseId: tc.id,
          questionNo: tc.questionNo,
          passed: isMatch,
          status: isMatch ? 'PASSED' : code !== 0 ? 'RUNTIME_ERROR' : 'WRONG_ANSWER',
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

  private getAllFiles(dir: string, ext: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory() && file !== 'bin') {
        results = results.concat(this.getAllFiles(fullPath, ext));
      } else if (file.endsWith(ext)) {
        results.push(fullPath);
      }
    }
    return results;
  }
}
