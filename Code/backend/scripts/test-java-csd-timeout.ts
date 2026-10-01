import { JavaDockerRunner } from "../src/infrastructure/sandbox/runners/java-docker.runner";

async function main() {
    const runner = new JavaDockerRunner();

    console.log("=== CSD201 TIMEOUT TEST ===\n");

    const result = await runner.runCsd(
        "./sandbox-test/java-csd-timeout",
        [
            {
                dataFileContent: "10 20 30",

                expectedFiles: [
                    {
                        fileName: "f1.txt",
                        expectedOutput: "60",
                    },
                ],

                // Cho test nhanh hơn.
                timeoutMs: 1000,
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
        }`
    );

    const test = result.details[0];

    if (!test) {
        console.error(
            "FAIL: No testcase result."
        );

        process.exit(1);
    }

    console.log(
        `Status       : ${test.status}`
    );

    console.log(
        `Execution    : ${test.executionTimeMs} ms`
    );

    if (
        test.status ===
        "TIME_LIMIT_EXCEEDED"
    ) {
        console.log(
            "\nPASS: Time limit exceeded detected."
        );

        process.exit(0);
    }

    console.error(
        "\nFAIL: Timeout was not detected correctly."
    );

    console.dir(result, {
        depth: null,
    });

    process.exit(1);
}

main().catch((error) => {
    console.error(
        "Unexpected test error:",
        error
    );

    process.exit(1);
});