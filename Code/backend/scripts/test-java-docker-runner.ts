import {
    JavaDockerRunner,
} from "../src/infrastructure/sandbox/runners/java-docker.runner";

async function main(): Promise<void> {

    console.log("====================================");
    console.log(" AITA JAVA DOCKER RUNNER TEST");
    console.log("====================================\n");

    const runner = new JavaDockerRunner();

    const testCases = [
        {
            input: "1",
            expectedOutput: "Function 1",
            timeoutMs: 2000,
        },
        {
            input: "2",
            expectedOutput: "Function 2",
            timeoutMs: 2000,
        },
        {
            input: "1",

            // Cố tình sai để kiểm tra comparator
            expectedOutput: "Wrong Output",

            timeoutMs: 2000,
        },
    ];

    console.log(
        "Running Java submission in Docker...\n"
    );

    const result = await runner.run(
        "sandbox-test/java-pro",
        testCases
    );

    console.log("====================================");
    console.log(" RESULT");
    console.log("====================================");

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

    console.log("\nTest case details:");

    for (const detail of result.details) {

        console.log(
            "------------------------------------"
        );

        console.log(
            `Test #${detail.index + 1}`
        );

        console.log(
            `Status   : ${detail.status}`
        );

        console.log(
            `Input    : ${JSON.stringify(
                detail.input
            )}`
        );

        console.log(
            `Expected : ${JSON.stringify(
                detail.expectedOutput
            )}`
        );

        console.log(
            `Actual   : ${JSON.stringify(
                detail.actualOutput
            )}`
        );

        console.log(
            `Time     : ${detail.executionTimeMs} ms`
        );

        if (detail.error) {
            console.log(
                `Error    : ${detail.error}`
            );
        }

        if (detail.comparison?.diff) {

            console.log("Diff:");

            console.log(
                detail.comparison.diff
            );
        }
    }

    console.log(
        "\n===================================="
    );

    if (
        result.passedTests === 2 &&
        result.failedTests === 1 &&
        result.compileError === null
    ) {
        console.log(
            "Java Docker Runner test PASSED."
        );
    } else {
        console.log(
            "Java Docker Runner test FAILED."
        );
    }
}

main().catch((error) => {

    console.error(
        "Unexpected test error:"
    );

    console.error(error);
});