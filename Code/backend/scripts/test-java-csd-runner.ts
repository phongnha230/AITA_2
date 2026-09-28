import { JavaDockerRunner } from "../src/infrastructure/sandbox/runners/java-docker.runner";

async function main() {
    const runner = new JavaDockerRunner();

    console.log("=== CSD201 DOCKER RUNNER TEST ===\n");

    const result = await runner.runCsd(
        "./sandbox-test/java-csd",
        [
            {
                dataFileContent:
                    "10 20 30 40 50",

                expectedFiles: [
                    {
                        fileName: "f1.txt",
                        expectedOutput: "150",
                    },
                    {
                        fileName: "f2.txt",
                        expectedOutput: "5",
                    },
                    {
                        fileName: "f3.txt",
                        expectedOutput:
                            "10 20 30 40 50",
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

    for (const test of result.details) {
        console.log(
            `Test #${test.index + 1}: ${test.status}`
        );

        console.log(
            `Execution Time: ${test.executionTimeMs} ms`
        );

        if (test.error) {
            console.log(
                `Error: ${test.error}`
            );
        }

        for (const file of test.files) {
            console.log(
                `  ${file.fileName}: ${file.status}`
            );

            console.log(
                `    Expected: ${JSON.stringify(
                    file.expectedOutput
                )}`
            );

            console.log(
                `    Actual  : ${JSON.stringify(
                    file.actualOutput
                )}`
            );

            if (
                file.comparison?.diff
            ) {
                console.log(
                    `    Diff:\n${file.comparison.diff}`
                );
            }
        }

        console.log();
    }

    if (
        result.compileError === null &&
        result.passedTests === 1 &&
        result.failedTests === 0
    ) {
        console.log(
            "CSD201 Docker Runner test PASSED."
        );

        process.exit(0);
    }

    console.error(
        "CSD201 Docker Runner test FAILED."
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