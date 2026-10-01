import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { resolve } from "path";

import {
    compareOutput,
    OutputComparisonResult,
} from "../comparator/output-comparator";

export interface SandboxTestCase {
    input: string;
    expectedOutput: string;
    timeoutMs?: number;
}

export interface TestCaseResult {
    index: number;
    status:
        | "PASSED"
        | "FAILED"
        | "RUNTIME_ERROR"
        | "TIME_LIMIT_EXCEEDED";

    input: string;
    expectedOutput: string;
    actualOutput: string;
    executionTimeMs: number;

    error?: string;
    comparison?: OutputComparisonResult;
}

export interface SandboxRunResult {
    passedTests: number;
    failedTests: number;
    compileError: string | null;
    details: TestCaseResult[];
}

interface DockerExecutionResult {
    exitCode: number | null;
    stdout: string;
    stderr: string;
    timedOut: boolean;
    executionTimeMs: number;
}

export class CDockerRunner {
    private readonly imageName = "aita-sandbox-gcc";

    /**
     * Chạy toàn bộ testcase của một submission C.
     */
    async run(
        stagedFolderPath: string,
        testCases: SandboxTestCase[]
    ): Promise<SandboxRunResult> {

        const absolutePath = resolve(stagedFolderPath);

        // ============================================
        // STEP 1: COMPILE CHECK
        // ============================================

        const compileResult = await this.runDockerCommand(
            absolutePath,
            "gcc -O2 main.c -o /tmp/main.out",
            "",
            10_000
        );

        // Nếu compile lỗi thì không chạy testcase.
        if (compileResult.exitCode !== 0) {
            return {
                passedTests: 0,
                failedTests: testCases.length,

                compileError:
                    compileResult.stderr ||
                    compileResult.stdout ||
                    "Unknown compilation error",

                details: [],
            };
        }

        // ============================================
        // STEP 2: RUN TEST CASES
        // ============================================

        const details: TestCaseResult[] = [];

        for (
            let index = 0;
            index < testCases.length;
            index++
        ) {
            const testCase = testCases[index];

            // Default timeout theo yêu cầu PRF192: 2 giây.
            const timeoutMs =
                testCase.timeoutMs ?? 2000;

            /*
             * Mỗi testcase chạy trong container riêng.
             *
             * Source được mount READ ONLY.
             *
             * Executable được compile vào /tmp
             * bên trong container nên không tạo main.out
             * trong submission folder.
             */
            const execution =
                await this.runDockerCommand(
                    absolutePath,
                    "gcc -O2 main.c -o /tmp/main.out && /tmp/main.out",
                    testCase.input,
                    timeoutMs
                );

            // ========================================
            // TIME LIMIT EXCEEDED
            // ========================================

            if (execution.timedOut) {
                details.push({
                    index,
                    status: "TIME_LIMIT_EXCEEDED",

                    input: testCase.input,

                    expectedOutput:
                        testCase.expectedOutput,

                    actualOutput:
                        execution.stdout,

                    executionTimeMs:
                        execution.executionTimeMs,

                    error:
                        "Execution exceeded time limit",
                });

                continue;
            }

            // ========================================
            // RUNTIME ERROR
            // ========================================

            if (execution.exitCode !== 0) {
                details.push({
                    index,
                    status: "RUNTIME_ERROR",

                    input: testCase.input,

                    expectedOutput:
                        testCase.expectedOutput,

                    actualOutput:
                        execution.stdout,

                    executionTimeMs:
                        execution.executionTimeMs,

                    error:
                        execution.stderr ||
                        `Process exited with code ${execution.exitCode}`,
                });

                continue;
            }

            // ========================================
            // COMPARE OUTPUT
            // ========================================

            const comparison = compareOutput(
                testCase.expectedOutput,
                execution.stdout
            );

            details.push({
                index,

                status:
                    comparison.matched
                        ? "PASSED"
                        : "FAILED",

                input: testCase.input,

                expectedOutput:
                    testCase.expectedOutput,

                actualOutput:
                    execution.stdout,

                executionTimeMs:
                    execution.executionTimeMs,

                comparison,
            });
        }

        // ============================================
        // STEP 3: SUMMARY
        // ============================================

        const passedTests =
            details.filter(
                (result) =>
                    result.status === "PASSED"
            ).length;

        const failedTests =
            testCases.length - passedTests;

        return {
            passedTests,
            failedTests,
            compileError: null,
            details,
        };
    }

    /**
     * Tạo và chạy Docker container.
     */
    private runDockerCommand(
        workspacePath: string,
        command: string,
        stdin: string,
        timeoutMs: number
    ): Promise<DockerExecutionResult> {

        return new Promise((resolvePromise) => {

            const containerName =
                `aita-c-${randomUUID().replace(
                    /-/g,
                    ""
                )}`;

            // ========================================
            // DOCKER SECURITY CONFIGURATION
            // ========================================

            const dockerArgs = [
                "run",

                "--rm",

                // QUAN TRỌNG:
                // Giữ STDIN mở để truyền testcase
                // từ Node -> Docker -> chương trình C.
                "-i",

                "--name",
                containerName,

                // Không cho submission truy cập mạng.
                "--network",
                "none",

                // Giới hạn RAM.
                "--memory",
                "256m",

                // Giới hạn CPU.
                "--cpus",
                "0.5",

                // Hạn chế process.
                "--pids-limit",
                "64",

                // Bỏ Linux capabilities.
                "--cap-drop",
                "ALL",

                // Không cho tăng privilege.
                "--security-opt",
                "no-new-privileges",

                // Source code chỉ được đọc.
                "--mount",
                `type=bind,source=${workspacePath},target=/workspace,readonly`,

                // Docker image.
                this.imageName,

                "sh",
                "-c",
                command,
            ];

            const startedAt = Date.now();

            // ========================================
            // START DOCKER PROCESS
            // ========================================

            const child = spawn(
                "docker",
                dockerArgs,
                {
                    stdio: [
                        "pipe",
                        "pipe",
                        "pipe",
                    ],

                    windowsHide: true,
                }
            );

            let stdout = "";
            let stderr = "";

            let timedOut = false;
            let finished = false;

            // ========================================
            // CAPTURE STDOUT
            // ========================================

            child.stdout.on(
                "data",
                (data: Buffer) => {
                    stdout += data.toString();
                }
            );

            // ========================================
            // CAPTURE STDERR
            // ========================================

            child.stderr.on(
                "data",
                (data: Buffer) => {
                    stderr += data.toString();
                }
            );

            // ========================================
            // DOCKER START ERROR
            // ========================================

            child.on(
                "error",
                (error) => {

                    if (finished) {
                        return;
                    }

                    finished = true;

                    resolvePromise({
                        exitCode: null,
                        stdout,
                        stderr: error.message,
                        timedOut: false,

                        executionTimeMs:
                            Date.now() -
                            startedAt,
                    });
                }
            );

            // ========================================
            // TIMEOUT
            // ========================================

            const timer = setTimeout(
                () => {

                    timedOut = true;

                    /*
                     * Kill CONTAINER chứ không chỉ
                     * kill docker CLI.
                     *
                     * Như vậy code sinh viên không thể
                     * tiếp tục chạy nền.
                     */
                    const killer = spawn(
                        "docker",
                        [
                            "kill",
                            containerName,
                        ],
                        {
                            windowsHide: true,
                            stdio: "ignore",
                        }
                    );

                    killer.unref();

                },
                timeoutMs
            );

            // ========================================
            // CONTAINER FINISHED
            // ========================================

            child.on(
                "close",
                (exitCode) => {

                    clearTimeout(timer);

                    if (finished) {
                        return;
                    }

                    finished = true;

                    resolvePromise({
                        exitCode,
                        stdout,
                        stderr,
                        timedOut,

                        executionTimeMs:
                            Date.now() -
                            startedAt,
                    });
                }
            );

            // ========================================
            // SEND TESTCASE INPUT TO CONTAINER
            // ========================================

            if (stdin.length > 0) {
                child.stdin.write(stdin);

                if (!stdin.endsWith("\n")) {
                    child.stdin.write("\n");
                }
            }

            child.stdin.end();
        });
    }
}