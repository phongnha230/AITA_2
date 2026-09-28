import {
    CDockerRunner,
    SandboxRunResult,
    SandboxTestCase,
} from "./runners/c-docker.runner";

import {
    JavaDockerRunner,
    JavaSandboxRunResult,
    JavaSandboxTestCase,
    JavaCsdRunResult,
    JavaCsdTestCase,
} from "./runners/java-docker.runner";

// ============================================================
// SANDBOX TYPES
// ============================================================

export type SandboxLanguage =
    | "C"
    | "JAVA";

export type SandboxMode =
    | "STANDARD"
    | "CSD";

// ============================================================
// REQUEST TYPES
// ============================================================

export interface CSandboxRequest {
    language: "C";
    mode?: "STANDARD";

    stagedFolderPath: string;
    testCases: SandboxTestCase[];
}

export interface JavaStandardSandboxRequest {
    language: "JAVA";
    mode: "STANDARD";

    stagedFolderPath: string;
    testCases: JavaSandboxTestCase[];
}

export interface JavaCsdSandboxRequest {
    language: "JAVA";
    mode: "CSD";

    stagedFolderPath: string;
    testCases: JavaCsdTestCase[];
}

export type SandboxRequest =
    | CSandboxRequest
    | JavaStandardSandboxRequest
    | JavaCsdSandboxRequest;

// ============================================================
// RESULT TYPE
// ============================================================

export type SandboxResult =
    | SandboxRunResult
    | JavaSandboxRunResult
    | JavaCsdRunResult;

// ============================================================
// FACTORY
// ============================================================

export class SandboxRunnerFactory {

    /**
     * Entry point chung cho Sandbox Engine.
     *
     * TV4 chỉ cần truyền request vào execute().
     * Factory tự chọn runner tương ứng.
     */
    static async execute(
        request: SandboxRequest
    ): Promise<SandboxResult> {

        // ====================================================
        // C / PRF192
        // ====================================================

        if (request.language === "C") {
            const runner =
                new CDockerRunner();

            return runner.run(
                request.stagedFolderPath,
                request.testCases
            );
        }

        // ====================================================
        // JAVA / CSD201
        // ====================================================

        if (
            request.language === "JAVA" &&
            request.mode === "CSD"
        ) {
            const runner =
                new JavaDockerRunner();

            return runner.runCsd(
                request.stagedFolderPath,
                request.testCases
            );
        }

        // ====================================================
        // JAVA / PRO192
        // ====================================================

        if (
            request.language === "JAVA" &&
            request.mode === "STANDARD"
        ) {
            const runner =
                new JavaDockerRunner();

            return runner.run(
                request.stagedFolderPath,
                request.testCases
            );
        }

        // ====================================================
        // UNSUPPORTED CONFIGURATION
        // ====================================================

        throw new Error(
            "Unsupported sandbox configuration"
        );
    }
}