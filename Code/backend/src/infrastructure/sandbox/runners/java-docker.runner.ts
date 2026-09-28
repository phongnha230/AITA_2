import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { resolve } from "path";

import {
    compareOutput,
    OutputComparisonResult,
} from "../comparator/output-comparator";

// ============================================================
// PRO192 TYPES
// ============================================================

export interface JavaSandboxTestCase {
    input: string;
    expectedOutput: string;
    timeoutMs?: number;
}

export interface JavaTestCaseResult {
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

export interface JavaSandboxRunResult {
    passedTests: number;
    failedTests: number;
    compileError: string | null;
    details: JavaTestCaseResult[];
}

// ============================================================
// CSD201 TYPES
// ============================================================

export interface ExpectedOutputFile {
    fileName: string;
    expectedOutput: string;
}

export interface JavaCsdTestCase {
    /**
     * Nội dung sẽ được ghi vào data.txt
     * trước khi chạy testcase.
     */
    dataFileContent: string;

    /**
     * Các file chương trình sinh viên phải tạo.
     * Ví dụ: f1.txt, f2.txt, f3.txt
     */
    expectedFiles: ExpectedOutputFile[];

    timeoutMs?: number;
}

export interface JavaCsdFileResult {
    fileName: string;

    status:
        | "PASSED"
        | "FAILED"
        | "FILE_NOT_FOUND";

    expectedOutput: string;
    actualOutput: string;

    comparison?: OutputComparisonResult;
}

export interface JavaCsdTestCaseResult {
    index: number;

    status:
        | "PASSED"
        | "FAILED"
        | "RUNTIME_ERROR"
        | "TIME_LIMIT_EXCEEDED";

    executionTimeMs: number;

    files: JavaCsdFileResult[];

    error?: string;
}

export interface JavaCsdRunResult {
    passedTests: number;
    failedTests: number;
    compileError: string | null;
    details: JavaCsdTestCaseResult[];
}

// ============================================================
// INTERNAL TYPE
// ============================================================

interface CommandResult {
    exitCode: number | null;
    stdout: string;
    stderr: string;
    timedOut: boolean;
    executionTimeMs: number;
}

// ============================================================
// JAVA DOCKER RUNNER
// ============================================================

export class JavaDockerRunner {
    private readonly imageName = "aita-sandbox-java";

    // ========================================================
    // PRO192
    //
    // stdin -> Main -> stdout -> compare
    // ========================================================

    async run(
        stagedFolderPath: string,
        testCases: JavaSandboxTestCase[]
    ): Promise<JavaSandboxRunResult> {
        const workspacePath = resolve(stagedFolderPath);

        const containerName =
            `aita-java-${randomUUID().replace(/-/g, "")}`;

        try {
            // ------------------------------------------------
            // 1. START CONTAINER
            // ------------------------------------------------

            const startResult =
                await this.startContainer(
                    containerName,
                    workspacePath
                );

            if (startResult.exitCode !== 0) {
                return {
                    passedTests: 0,
                    failedTests: testCases.length,

                    compileError:
                        startResult.stderr ||
                        startResult.stdout ||
                        "Unable to start Java sandbox container",

                    details: [],
                };
            }

            // ------------------------------------------------
            // 2. COMPILE ONCE
            // ------------------------------------------------

            const compileResult =
                await this.compileProSubmission(
                    containerName
                );

            if (
                compileResult.timedOut ||
                compileResult.exitCode !== 0
            ) {
                return {
                    passedTests: 0,
                    failedTests: testCases.length,

                    compileError:
                        compileResult.timedOut
                            ? "Java compilation exceeded time limit"
                            : compileResult.stderr ||
                              compileResult.stdout ||
                              "Unknown Java compilation error",

                    details: [],
                };
            }

            // ------------------------------------------------
            // 3. RUN TESTCASES
            // ------------------------------------------------

            const details: JavaTestCaseResult[] = [];

            for (
                let index = 0;
                index < testCases.length;
                index++
            ) {
                const testCase = testCases[index];

                const timeoutMs =
                    testCase.timeoutMs ?? 2000;

                const execution =
                    await this.runHostCommand(
                        "docker",
                        [
                            "exec",
                            "-i",
                            containerName,

                            "java",
                            "-cp",
                            "/tmp/bin",
                            "Main",
                        ],
                        testCase.input,
                        timeoutMs,
                        () =>
                            this.killJavaProcess(
                                containerName
                            )
                    );

                // --------------------------------------------
                // TIME LIMIT
                // --------------------------------------------

                if (execution.timedOut) {
                    details.push({
                        index,

                        status:
                            "TIME_LIMIT_EXCEEDED",

                        input:
                            testCase.input,

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

                // --------------------------------------------
                // RUNTIME ERROR
                // --------------------------------------------

                if (execution.exitCode !== 0) {
                    details.push({
                        index,

                        status:
                            "RUNTIME_ERROR",

                        input:
                            testCase.input,

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

                // --------------------------------------------
                // OUTPUT COMPARISON
                // --------------------------------------------

                const comparison =
                    compareOutput(
                        testCase.expectedOutput,
                        execution.stdout
                    );

                details.push({
                    index,

                    status:
                        comparison.matched
                            ? "PASSED"
                            : "FAILED",

                    input:
                        testCase.input,

                    expectedOutput:
                        testCase.expectedOutput,

                    actualOutput:
                        execution.stdout,

                    executionTimeMs:
                        execution.executionTimeMs,

                    comparison,
                });
            }

            // ------------------------------------------------
            // 4. SUMMARY
            // ------------------------------------------------

            const passedTests =
                details.filter(
                    (result) =>
                        result.status === "PASSED"
                ).length;

            return {
                passedTests,

                failedTests:
                    testCases.length -
                    passedTests,

                compileError: null,

                details,
            };
        } finally {
            await this.removeContainer(
                containerName
            );
        }
    }

    // ========================================================
    // CSD201
    //
    // data.txt -> Main -> f1/f2/f3 -> compare files
    // ========================================================

    async runCsd(
        stagedFolderPath: string,
        testCases: JavaCsdTestCase[]
    ): Promise<JavaCsdRunResult> {
        const workspacePath =
            resolve(stagedFolderPath);

        const containerName =
            `aita-java-csd-${randomUUID()
                .replace(/-/g, "")}`;

        try {
            // ------------------------------------------------
            // 1. START CONTAINER
            // ------------------------------------------------

            const startResult =
                await this.startContainer(
                    containerName,
                    workspacePath
                );

            if (startResult.exitCode !== 0) {
                return {
                    passedTests: 0,
                    failedTests:
                        testCases.length,

                    compileError:
                        startResult.stderr ||
                        startResult.stdout ||
                        "Unable to start Java sandbox container",

                    details: [],
                };
            }

            // ------------------------------------------------
            // 2. COPY SUBMISSION TO WRITABLE AREA
            // ------------------------------------------------

            const prepareResult =
                await this.runHostCommand(
                    "docker",
                    [
                        "exec",
                        containerName,
                        "sh",
                        "-c",

                        "rm -rf /tmp/submission && " +
                        "cp -r /workspace /tmp/submission",
                    ],
                    "",
                    10_000
                );

            if (
                prepareResult.timedOut ||
                prepareResult.exitCode !== 0
            ) {
                return {
                    passedTests: 0,
                    failedTests:
                        testCases.length,

                    compileError:
                        prepareResult.stderr ||
                        prepareResult.stdout ||
                        "Unable to prepare CSD workspace",

                    details: [],
                };
            }

            // ------------------------------------------------
            // 3. COMPILE ONCE
            // ------------------------------------------------

            const compileCommand =
                "cd /tmp/submission && " +
                "rm -rf ./bin && " +
                "mkdir -p ./bin && " +
                'find ./src -name "*.java" ' +
                "-exec javac -encoding UTF-8 " +
                "-d ./bin {} +";

            const compileResult =
                await this.runHostCommand(
                    "docker",
                    [
                        "exec",
                        containerName,
                        "sh",
                        "-c",
                        compileCommand,
                    ],
                    "",
                    10_000
                );

            if (
                compileResult.timedOut ||
                compileResult.exitCode !== 0
            ) {
                return {
                    passedTests: 0,
                    failedTests:
                        testCases.length,

                    compileError:
                        compileResult.timedOut
                            ? "Java compilation exceeded time limit"
                            : compileResult.stderr ||
                              compileResult.stdout ||
                              "Unknown Java compilation error",

                    details: [],
                };
            }

            // ------------------------------------------------
            // 4. RUN CSD TESTCASES
            // ------------------------------------------------

            const details:
                JavaCsdTestCaseResult[] = [];

            for (
                let index = 0;
                index < testCases.length;
                index++
            ) {
                const testCase =
                    testCases[index];

                const timeoutMs =
                    testCase.timeoutMs ?? 2000;

                // --------------------------------------------
                // Remove old output files
                // --------------------------------------------

                const outputFiles =
                    testCase.expectedFiles.map(
                        (file) =>
                            file.fileName
                    );

                const cleanupResult =
                    await this.removeOutputFiles(
                        containerName,
                        outputFiles
                    );

                if (
                    cleanupResult.exitCode !== 0
                ) {
                    details.push({
                        index,

                        status:
                            "RUNTIME_ERROR",

                        executionTimeMs:
                            cleanupResult.executionTimeMs,

                        files: [],

                        error:
                            cleanupResult.stderr ||
                            "Unable to clean previous output files",
                    });

                    continue;
                }

                // --------------------------------------------
                // Inject data.txt
                // --------------------------------------------

                const dataResult =
                    await this.writeDataFile(
                        containerName,
                        testCase.dataFileContent
                    );

                if (
                    dataResult.exitCode !== 0
                ) {
                    details.push({
                        index,

                        status:
                            "RUNTIME_ERROR",

                        executionTimeMs:
                            dataResult.executionTimeMs,

                        files: [],

                        error:
                            dataResult.stderr ||
                            "Unable to create data.txt",
                    });

                    continue;
                }

                // --------------------------------------------
                // Run student program
                // --------------------------------------------

                const execution =
                    await this.runHostCommand(
                        "docker",
                        [
                            "exec",
                            containerName,

                            "sh",
                            "-c",

                            "cd /tmp/submission && " +
                            "java -cp ./bin Main",
                        ],
                        "",
                        timeoutMs,
                        () =>
                            this.killJavaProcess(
                                containerName
                            )
                    );

                // --------------------------------------------
                // TIME LIMIT
                // --------------------------------------------

                if (execution.timedOut) {
                    details.push({
                        index,

                        status:
                            "TIME_LIMIT_EXCEEDED",

                        executionTimeMs:
                            execution.executionTimeMs,

                        files: [],

                        error:
                            "Execution exceeded time limit",
                    });

                    continue;
                }

                // --------------------------------------------
                // RUNTIME ERROR
                //
                // Includes errors such as:
                // NullPointerException
                // ClassCastException
                // StackOverflowError
                // --------------------------------------------

                if (
                    execution.exitCode !== 0
                ) {
                    details.push({
                        index,

                        status:
                            "RUNTIME_ERROR",

                        executionTimeMs:
                            execution.executionTimeMs,

                        files: [],

                        error:
                            execution.stderr ||
                            execution.stdout ||
                            `Process exited with code ${execution.exitCode}`,
                    });

                    continue;
                }

                // --------------------------------------------
                // CHECK OUTPUT FILES
                // --------------------------------------------

                const fileResults:
                    JavaCsdFileResult[] = [];

                for (
                    const expectedFile
                    of testCase.expectedFiles
                ) {
                    const actualFile =
                        await this.readOutputFile(
                            containerName,
                            expectedFile.fileName
                        );

                    // ----------------------------------------
                    // FILE NOT FOUND
                    // ----------------------------------------

                    if (
                        actualFile.exitCode !== 0
                    ) {
                        fileResults.push({
                            fileName:
                                expectedFile.fileName,

                            status:
                                "FILE_NOT_FOUND",

                            expectedOutput:
                                expectedFile.expectedOutput,

                            actualOutput: "",
                        });

                        continue;
                    }

                    // ----------------------------------------
                    // FILE COMPARISON
                    // ----------------------------------------

                    const comparison =
                        compareOutput(
                            expectedFile.expectedOutput,
                            actualFile.stdout
                        );

                    fileResults.push({
                        fileName:
                            expectedFile.fileName,

                        status:
                            comparison.matched
                                ? "PASSED"
                                : "FAILED",

                        expectedOutput:
                            expectedFile.expectedOutput,

                        actualOutput:
                            actualFile.stdout,

                        comparison,
                    });
                }

                const allFilesPassed =
                    fileResults.every(
                        (file) =>
                            file.status ===
                            "PASSED"
                    );

                details.push({
                    index,

                    status:
                        allFilesPassed
                            ? "PASSED"
                            : "FAILED",

                    executionTimeMs:
                        execution.executionTimeMs,

                    files:
                        fileResults,
                });
            }

            // ------------------------------------------------
            // 5. SUMMARY
            // ------------------------------------------------

            const passedTests =
                details.filter(
                    (result) =>
                        result.status ===
                        "PASSED"
                ).length;

            return {
                passedTests,

                failedTests:
                    testCases.length -
                    passedTests,

                compileError: null,

                details,
            };
        } finally {
            await this.removeContainer(
                containerName
            );
        }
    }

    // ========================================================
    // START CONTAINER
    // ========================================================

    private startContainer(
        containerName: string,
        workspacePath: string
    ): Promise<CommandResult> {
        return this.runHostCommand(
            "docker",
            [
                "run",
                "-d",

                "--name",
                containerName,

                "--network",
                "none",

                "--memory",
                "256m",

                "--cpus",
                "0.5",

                "--pids-limit",
                "64",

                "--cap-drop",
                "ALL",

                "--security-opt",
                "no-new-privileges",

                "--mount",
                `type=bind,source=${workspacePath},target=/workspace,readonly`,

                this.imageName,

                "sh",
                "-c",
                "sleep infinity",
            ],
            "",
            10_000
        );
    }

    // ========================================================
    // PRO COMPILE
    // ========================================================

    private compileProSubmission(
        containerName: string
    ): Promise<CommandResult> {
        const compileCommand =
            "rm -rf /tmp/bin && " +
            "mkdir -p /tmp/bin && " +
            'find ./src -name "*.java" ' +
            "-exec javac -encoding UTF-8 " +
            "-d /tmp/bin {} +";

        return this.runHostCommand(
            "docker",
            [
                "exec",
                containerName,
                "sh",
                "-c",
                compileCommand,
            ],
            "",
            10_000
        );
    }

    // ========================================================
    // CSD WRITE data.txt
    //
    // Content is sent through stdin instead of inserting
    // testcase text directly into a shell command.
    // ========================================================

    private writeDataFile(
        containerName: string,
        content: string
    ): Promise<CommandResult> {
        return this.runHostCommand(
            "docker",
            [
                "exec",
                "-i",
                containerName,

                "sh",
                "-c",

                "cat > /tmp/submission/data.txt",
            ],
            content,
            5_000
        );
    }

    // ========================================================
    // CSD REMOVE OLD OUTPUT FILES
    // ========================================================

    private async removeOutputFiles(
        containerName: string,
        fileNames: string[]
    ): Promise<CommandResult> {
        if (fileNames.length === 0) {
            return {
                exitCode: 0,
                stdout: "",
                stderr: "",
                timedOut: false,
                executionTimeMs: 0,
            };
        }

        for (const fileName of fileNames) {
            if (
                !this.isSafeOutputFileName(
                    fileName
                )
            ) {
                return {
                    exitCode: 1,
                    stdout: "",
                    stderr:
                        `Invalid output file name: ${fileName}`,
                    timedOut: false,
                    executionTimeMs: 0,
                };
            }
        }

        const paths =
            fileNames
                .map(
                    (fileName) =>
                        `./${fileName}`
                )
                .join(" ");

        return this.runHostCommand(
            "docker",
            [
                "exec",
                containerName,

                "sh",
                "-c",

                `cd /tmp/submission && rm -f ${paths}`,
            ],
            "",
            5_000
        );
    }

    // ========================================================
    // CSD READ OUTPUT FILE
    // ========================================================

    private readOutputFile(
        containerName: string,
        fileName: string
    ): Promise<CommandResult> {
        if (
            !this.isSafeOutputFileName(
                fileName
            )
        ) {
            return Promise.resolve({
                exitCode: 1,
                stdout: "",
                stderr:
                    `Invalid output file name: ${fileName}`,
                timedOut: false,
                executionTimeMs: 0,
            });
        }

        return this.runHostCommand(
            "docker",
            [
                "exec",
                containerName,

                "sh",
                "-c",

                `cd /tmp/submission && ` +
                `test -f "./${fileName}" && ` +
                `cat "./${fileName}"`,
            ],
            "",
            5_000
        );
    }

    // ========================================================
    // FILE NAME VALIDATION
    //
    // Prevent values such as:
    // ../../something
    // f1.txt; rm -rf ...
    // ========================================================

    private isSafeOutputFileName(
        fileName: string
    ): boolean {
        return /^[A-Za-z0-9._-]+$/.test(
            fileName
        );
    }

    // ========================================================
    // KILL JAVA PROCESS AFTER TIMEOUT
    // ========================================================

    private killJavaProcess(
        containerName: string
    ): void {
        spawn(
            "docker",
            [
                "exec",
                containerName,

                "sh",
                "-c",

                "pkill -9 java || true",
            ],
            {
                windowsHide: true,
                stdio: "ignore",
            }
        ).unref();
    }

    // ========================================================
    // HOST COMMAND EXECUTOR
    // ========================================================

    private runHostCommand(
        executable: string,
        args: string[],
        stdin: string,
        timeoutMs: number,
        onTimeout?: () => void
    ): Promise<CommandResult> {
        return new Promise(
            (resolvePromise) => {
                const startedAt =
                    Date.now();

                const child = spawn(
                    executable,
                    args,
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

                child.stdout.on(
                    "data",
                    (data: Buffer) => {
                        stdout +=
                            data.toString();
                    }
                );

                child.stderr.on(
                    "data",
                    (data: Buffer) => {
                        stderr +=
                            data.toString();
                    }
                );

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
                            stderr:
                                error.message,
                            timedOut: false,

                            executionTimeMs:
                                Date.now() -
                                startedAt,
                        });
                    }
                );

                const timer =
                    setTimeout(
                        () => {
                            timedOut = true;

                            if (onTimeout) {
                                onTimeout();
                            } else {
                                child.kill();
                            }
                        },
                        timeoutMs
                    );

                child.on(
                    "close",
                    (exitCode) => {
                        clearTimeout(
                            timer
                        );

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

                if (stdin.length > 0) {
                    child.stdin.write(
                        stdin
                    );

                    if (
                        !stdin.endsWith("\n")
                    ) {
                        child.stdin.write(
                            "\n"
                        );
                    }
                }

                child.stdin.end();
            }
        );
    }

    // ========================================================
    // REMOVE CONTAINER
    // ========================================================

    private async removeContainer(
        containerName: string
    ): Promise<void> {
        await new Promise<void>(
            (resolvePromise) => {
                const child = spawn(
                    "docker",
                    [
                        "rm",
                        "-f",
                        containerName,
                    ],
                    {
                        windowsHide: true,
                        stdio: "ignore",
                    }
                );

                child.on(
                    "error",
                    () =>
                        resolvePromise()
                );

                child.on(
                    "close",
                    () =>
                        resolvePromise()
                );
            }
        );
    }
}