import {
    SandboxRunnerFactory,
} from "../src/infrastructure/sandbox/sandbox-runner.factory";

async function main() {
    console.log(
        "=== SANDBOX RUNNER FACTORY TEST ===\n"
    );

    // ========================================================
    // TEST 1 - C / PRF192
    // ========================================================

    console.log("1. Testing C / PRF192...");

    const cResult =
        await SandboxRunnerFactory.execute({
            language: "C",

            stagedFolderPath:
                "./sandbox-test/c",

            testCases: [
                {
                    input: "10 20",
                    expectedOutput: "30",
                    timeoutMs: 2000,
                },
            ],
        });

    if (
        cResult.compileError === null &&
        cResult.passedTests === 1 &&
        cResult.failedTests === 0
    ) {
        console.log(
            "   PASS: C Runner selected correctly.\n"
        );
    } else {
        console.error(
            "   FAIL: C Runner test failed."
        );

        console.dir(cResult, {
            depth: null,
        });

        process.exit(1);
    }

    // ========================================================
    // TEST 2 - JAVA / PRO192
    // ========================================================

    console.log(
        "2. Testing Java / PRO192..."
    );

    const proResult =
        await SandboxRunnerFactory.execute({
            language: "JAVA",
            mode: "STANDARD",

            stagedFolderPath:
                "./sandbox-test/java-pro",

            testCases: [
                {
                    input: "1",
                    expectedOutput:
                        "Function 1",
                    timeoutMs: 2000,
                },
            ],
        });

    if (
        proResult.compileError === null &&
        proResult.passedTests === 1 &&
        proResult.failedTests === 0
    ) {
        console.log(
            "   PASS: Java PRO Runner selected correctly.\n"
        );
    } else {
        console.error(
            "   FAIL: Java PRO Runner test failed."
        );

        console.dir(proResult, {
            depth: null,
        });

        process.exit(1);
    }

    // ========================================================
    // TEST 3 - JAVA / CSD201
    // ========================================================

    console.log(
        "3. Testing Java / CSD201..."
    );

    const csdResult =
        await SandboxRunnerFactory.execute({
            language: "JAVA",
            mode: "CSD",

            stagedFolderPath:
                "./sandbox-test/java-csd",

            testCases: [
                {
                    dataFileContent:
                        "10 20 30 40 50",

                    expectedFiles: [
                        {
                            fileName:
                                "f1.txt",

                            expectedOutput:
                                "150",
                        },
                        {
                            fileName:
                                "f2.txt",

                            expectedOutput:
                                "5",
                        },
                        {
                            fileName:
                                "f3.txt",

                            expectedOutput:
                                "10 20 30 40 50",
                        },
                    ],

                    timeoutMs: 2000,
                },
            ],
        });

    if (
        csdResult.compileError === null &&
        csdResult.passedTests === 1 &&
        csdResult.failedTests === 0
    ) {
        console.log(
            "   PASS: Java CSD Runner selected correctly.\n"
        );
    } else {
        console.error(
            "   FAIL: Java CSD Runner test failed."
        );

        console.dir(csdResult, {
            depth: null,
        });

        process.exit(1);
    }

    // ========================================================
    // FINAL
    // ========================================================

    console.log(
        "================================="
    );

    console.log(
        "ALL FACTORY TESTS PASSED."
    );

    console.log(
        "C / PRF192       : PASS"
    );

    console.log(
        "Java / PRO192    : PASS"
    );

    console.log(
        "Java / CSD201    : PASS"
    );

    console.log(
        "================================="
    );
}

main().catch((error) => {
    console.error(
        "Factory test error:",
        error
    );

    process.exit(1);
});