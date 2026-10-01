import { JavaDockerRunner } from "../src/infrastructure/sandbox/runners/java-docker.runner";

async function main() {
    const runner = new JavaDockerRunner();

    console.log(
        "=== CSD201 STACK OVERFLOW TEST ===\n"
    );

    const result = await runner.runCsd(
        "./sandbox-test/java-csd-stackoverflow",
        [
            {
                dataFileContent: "10 20 30",

                expectedFiles: [
                    {
                        fileName: "f1.txt",
                        expectedOutput: "60",
                    },
                ],

                timeoutMs: 2000,
            },
        ]
    );

    console.log(
        `Passed Tests : ${result.passedTests}`
    );

    console.log(
        `Failed Tests : ${result.failedTests}`
    );

    console.log(
        `Compile Error: ${
            result.compileError ?? "None"
        }\n`
    );

    const test = result.details[0];

    if (!test) {
        console.error(
            "FAIL: No testcase result."
        );

        process.exit(1);
    }

    console.log(
        `Test #1: ${test.status}`
    );

    console.log(
        `Execution Time: ${test.executionTimeMs} ms`
    );

    if (test.error) {
        console.log(
            `Error:\n${test.error}`
        );
    }

    if (
        test.status === "RUNTIME_ERROR" &&
        test.error?.includes(
            "StackOverflowError"
        )
    ) {
        console.log(
            "\nPASS: StackOverflowError detected as RUNTIME_ERROR."
        );

        process.exit(0);
    }

    console.error(
        "\nFAIL: StackOverflowError was not detected correctly."
    );

    process.exit(1);
}

main().catch((error) => {
    console.error(
        "Unexpected test error:",
        error
    );

    process.exit(1);
});