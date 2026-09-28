import { CDockerRunner } from "../src/infrastructure/sandbox/runners/c-docker.runner";

async function main(): Promise<void> {
    console.log("====================================");
    console.log(" AITA C DOCKER RUNNER TEST");
    console.log("====================================\n");

    const runner = new CDockerRunner();

    const testCases = [
        {
            input: "10 20",
            expectedOutput: "30",
            timeoutMs: 2000,
        },
        {
            input: "5 7",
            expectedOutput: "12",
            timeoutMs: 2000,
        },
        {
            input: "100 200",
            expectedOutput: "999", // Cố tình sai
            timeoutMs: 2000,
        },
    ];

    console.log("Running C submission in Docker...\n");

    const result = await runner.run(
        "sandbox-test/c",
        testCases
    );

    console.log("====================================");
    console.log(" RESULT");
    console.log("====================================");

    console.log(`Passed Tests : ${result.passedTests}`);
    console.log(`Failed Tests : ${result.failedTests}`);
    console.log(`Compile Error: ${result.compileError ?? "None"}`);

    console.log("\nTest case details:");

    for (const detail of result.details) {
        console.log("------------------------------------");
        console.log(`Test #${detail.index + 1}`);
        console.log(`Status   : ${detail.status}`);
        console.log(`Input    : ${JSON.stringify(detail.input)}`);
        console.log(`Expected : ${JSON.stringify(detail.expectedOutput)}`);
        console.log(`Actual   : ${JSON.stringify(detail.actualOutput)}`);
        console.log(`Time     : ${detail.executionTimeMs} ms`);

        if (detail.error) {
            console.log(`Error    : ${detail.error}`);
        }

        if (detail.comparison?.diff) {
            console.log("Diff:");
            console.log(detail.comparison.diff);
        }
    }

    console.log("\n====================================");

    if (
        result.passedTests === 2 &&
        result.failedTests === 1 &&
        result.compileError === null
    ) {
        console.log("C Docker Runner test PASSED.");
    } else {
        console.log("C Docker Runner test FAILED.");
    }
}

main().catch((error) => {
    console.error("Unexpected test error:");
    console.error(error);
});