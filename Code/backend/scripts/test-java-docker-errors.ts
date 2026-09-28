import { mkdir, rm, writeFile } from "fs/promises";
import { resolve } from "path";

import {
    JavaDockerRunner,
} from "../src/infrastructure/sandbox/runners/java-docker.runner";

const root = resolve("sandbox-test/java-errors");

async function prepareFolder(
    name: string,
    source: string
): Promise<string> {

    const folder = resolve(root, name);
    const srcFolder = resolve(folder, "src");

    await rm(folder, {
        recursive: true,
        force: true,
    });

    await mkdir(srcFolder, {
        recursive: true,
    });

    await writeFile(
        resolve(srcFolder, "Main.java"),
        source,
        "utf8"
    );

    return folder;
}

async function main(): Promise<void> {

    const runner = new JavaDockerRunner();

    console.log("====================================");
    console.log(" AITA JAVA SANDBOX ERROR TEST");
    console.log("====================================\n");


    // ==========================================
    // 1. COMPILE ERROR
    // ==========================================

    console.log("[1] Testing COMPILE ERROR...");

    const compileErrorFolder =
        await prepareFolder(
            "compile-error",
            `
public class Main {

    public static void main(String[] args) {

        System.out.println("Hello")

    }
}
`
        );

    const compileResult =
        await runner.run(
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

        console.log(
            "PASS: Compile error detected."
        );

    } else {

        console.log(
            "FAIL: Compile error was not detected."
        );
    }


    // ==========================================
    // 2. RUNTIME ERROR
    // ==========================================

    console.log(
        "\n[2] Testing RUNTIME ERROR..."
    );

    const runtimeErrorFolder =
        await prepareFolder(
            "runtime-error",
            `
public class Main {

    public static void main(String[] args) {

        throw new RuntimeException(
            "Test runtime error"
        );

    }
}
`
        );

    const runtimeResult =
        await runner.run(
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

        console.log(
            "PASS: Runtime error detected."
        );

    } else {

        console.log(
            "FAIL: Runtime error was not detected."
        );

        console.log(
            "Actual status:",
            runtimeResult.details[0]?.status
        );
    }


    // ==========================================
    // 3. TIME LIMIT
    // ==========================================

    console.log(
        "\n[3] Testing TIME LIMIT EXCEEDED..."
    );

    const timeoutFolder =
        await prepareFolder(
            "timeout",
            `
public class Main {

    public static void main(String[] args) {

        while (true) {
        }

    }
}
`
        );

    const timeoutResult =
        await runner.run(
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

    console.error(
        "Unexpected test error:"
    );

    console.error(error);
});