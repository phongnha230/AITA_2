import { JavaDockerRunner } from "../src/infrastructure/sandbox/runners/java-docker.runner";

async function main() {
    const runner = new JavaDockerRunner();

    console.log("=== CSD201 ERROR TESTS ===\n");

    // ========================================================
    // TEST 1 - WRONG OUTPUT
    //
    // Main.java hiện tại tạo:
    // f1.txt = 150
    //
    // Nhưng ta cố tình expected = 999
    // => phải FAILED
    // ========================================================

    console.log("TEST 1: Wrong output -> FAILED");

    const wrongOutputResult = await runner.runCsd(
        "./sandbox-test/java-csd",
        [
            {
                dataFileContent: "10 20 30 40 50",

                expectedFiles: [
                    {
                        fileName: "f1.txt",
                        expectedOutput: "999",
                    },
                ],

                timeoutMs: 2000,
            },
        ]
    );

    const wrongOutputTest =
        wrongOutputResult.details[0];

    const wrongOutputFile =
        wrongOutputTest?.files[0];

    if (
        wrongOutputTest?.status === "FAILED" &&
        wrongOutputFile?.status === "FAILED"
    ) {
        console.log(
            "PASS: Wrong output detected."
        );

        console.log(
            `  Expected: ${JSON.stringify(
                wrongOutputFile.expectedOutput
            )}`
        );

        console.log(
            `  Actual  : ${JSON.stringify(
                wrongOutputFile.actualOutput
            )}`
        );
    } else {
        console.error(
            "FAIL: Wrong output was not detected."
        );

        console.dir(
            wrongOutputResult,
            {
                depth: null,
            }
        );

        process.exit(1);
    }

    console.log();

    // ========================================================
    // TEST 2 - FILE NOT FOUND
    //
    // Main.java không tạo f4.txt
    // => phải FILE_NOT_FOUND
    // ========================================================

    console.log(
        "TEST 2: Missing output file -> FILE_NOT_FOUND"
    );

    const missingFileResult = await runner.runCsd(
        "./sandbox-test/java-csd",
        [
            {
                dataFileContent: "10 20 30 40 50",

                expectedFiles: [
                    {
                        fileName: "f4.txt",
                        expectedOutput: "anything",
                    },
                ],

                timeoutMs: 2000,
            },
        ]
    );

    const missingFileTest =
        missingFileResult.details[0];

    const missingFile =
        missingFileTest?.files[0];

    if (
        missingFileTest?.status === "FAILED" &&
        missingFile?.status ===
            "FILE_NOT_FOUND"
    ) {
        console.log(
            "PASS: Missing output file detected."
        );

        console.log(
            `  ${missingFile.fileName}: FILE_NOT_FOUND`
        );
    } else {
        console.error(
            "FAIL: Missing output file was not detected."
        );

        console.dir(
            missingFileResult,
            {
                depth: null,
            }
        );

        process.exit(1);
    }

    console.log();

    // ========================================================
    // FINAL RESULT
    // ========================================================

    console.log(
        "CSD201 error tests PASSED."
    );
}

main().catch((error) => {
    console.error(
        "Unexpected test error:",
        error
    );

    process.exit(1);
});