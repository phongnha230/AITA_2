import { mkdir, rm, writeFile } from "fs/promises";
import { resolve } from "path";

import { CDockerRunner } from "../src/infrastructure/sandbox/runners/c-docker.runner";

const root = resolve("sandbox-test/c-errors");

async function prepareFolder(
    name: string,
    source: string
): Promise<string> {
    const folder = resolve(root, name);

    await rm(folder, {
        recursive: true,
        force: true,
    });

    await mkdir(folder, {
        recursive: true,
    });

    await writeFile(
        resolve(folder, "main.c"),
        source,
        "utf8"
    );

    return folder;
}

async function main(): Promise<void> {
    const runner = new CDockerRunner();

    console.log("====================================");
    console.log(" AITA C SANDBOX ERROR TEST");
    console.log("====================================\n");

    // ============================================
    // TEST 1: COMPILE ERROR
    // ============================================

    console.log("[1] Testing COMPILE ERROR...");

    const compileErrorFolder = await prepareFolder(
        "compile-error",
        `
#include <stdio.h>

int main() {
    printf("Hello")
    return 0;
}
`
    );

    const compileResult = await runner.run(
        compileErrorFolder,
        [
            {
                input: "",
                expectedOutput: "Hello",
                timeoutMs: 2000,
            },
        ]
    );

    if (compileResult.compileError !== null) {
        console.log("PASS: Compile error detected.");
    } else {
        console.log("FAIL: Compile error was not detected.");
    }

    // ============================================
    // TEST 2: RUNTIME ERROR
    // ============================================

    console.log("\n[2] Testing RUNTIME ERROR...");

    const runtimeErrorFolder = await prepareFolder(
        "runtime-error",
        `
#include <stdlib.h>

int main() {
    return 5;
}
`
    );

    const runtimeResult = await runner.run(
        runtimeErrorFolder,
        [
            {
                input: "",
                expectedOutput: "",
                timeoutMs: 2000,
            },
        ]
    );

    if (
        runtimeResult.details[0]?.status ===
        "RUNTIME_ERROR"
    ) {
        console.log("PASS: Runtime error detected.");
    } else {
        console.log(
            "FAIL: Runtime error was not detected."
        );
    }

    // ============================================
    // TEST 3: TIME LIMIT EXCEEDED
    // ============================================

    console.log("\n[3] Testing TIME LIMIT EXCEEDED...");

    const timeoutFolder = await prepareFolder(
        "timeout",
        `
int main() {
    while (1) {
    }

    return 0;
}
`
    );

    const timeoutResult = await runner.run(
        timeoutFolder,
        [
            {
                input: "",
                expectedOutput: "",
                timeoutMs: 2000,
            },
        ]
    );

    if (
        timeoutResult.details[0]?.status ===
        "TIME_LIMIT_EXCEEDED"
    ) {
        console.log(
            "PASS: Time limit exceeded detected."
        );
    } else {
        console.log(
            "FAIL: Time limit exceeded was not detected."
        );

        console.log(
            "Actual status:",
            timeoutResult.details[0]?.status
        );
    }

    console.log("\n====================================");
    console.log(" ERROR TEST FINISHED");
    console.log("====================================");
}

main().catch((error) => {
    console.error("Unexpected test error:");
    console.error(error);
});