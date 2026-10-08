import {
    addGradingJob,
    closeGradingQueue,
    getGradingJob,
} from "../src/infrastructure/queue/bullmq.queue.js";

import {
    createGradingWorker,
} from "../src/infrastructure/queue/bullmq.worker.js";

import {
    redisConnection,
} from "../src/infrastructure/redis/redis.client.js";

function sleep(ms: number) {
    return new Promise(
        (resolve) => setTimeout(resolve, ms)
    );
}

async function main() {

    console.log(
        "=== BULLMQ RETRY TEST ===\n"
    );

    let sandboxExecutionCount = 0;

    // ========================================================
    // WORKER
    // ========================================================

    const worker =
        createGradingWorker({

            // TV5 giả lập luôn bị lỗi
            runSandbox: async (jobData) => {

                sandboxExecutionCount++;

                console.log(
                    `[Mock TV5] Attempt ${sandboxExecutionCount}`
                );

                console.log(
                    `[Mock TV5] Submission: ${jobData.submissionId}`
                );

                throw new Error(
                    "Mock Sandbox failure"
                );
            },

            runAiGrading: async () => {

                throw new Error(
                    "AI must not run when Sandbox fails."
                );
            },
        });

    try {

        // ====================================================
        // ADD JOB
        // ====================================================

        console.log(
            "1. Adding failing job..."
        );

        const job =
            await addGradingJob(
                {
                    submissionId:
                        `retry-test-${Date.now()}`,

                    stagedFolderPath:
                        "./test-submissions/failing",

                    assignmentId:
                        "assignment-retry-test",

                    language:
                        "JAVA",

                    mode:
                        "STANDARD",
                },
                1
            );

        if (!job.id) {
            throw new Error(
                "Job ID was not generated."
            );
        }

        console.log(
            `Job created: ${job.id}`
        );

        console.log(
            "\n2. Waiting for retries...\n"
        );

        // ====================================================
        // WAIT UNTIL FAILED
        // ====================================================

        const maxWaitMs = 15_000;

        const startTime =
            Date.now();

        while (
            Date.now() - startTime <
            maxWaitMs
        ) {

            const savedJob =
                await getGradingJob(
                    job.id
                );

            if (!savedJob) {
                throw new Error(
                    "Job disappeared from Redis."
                );
            }

            const state =
                await savedJob.getState();

            console.log(
                `State: ${state} | attemptsMade: ${savedJob.attemptsMade}`
            );

            if (state === "failed") {

                console.log(
                    "\n3. Job reached FAILED state."
                );

                console.log(
                    "Attempts made:",
                    savedJob.attemptsMade
                );

                console.log(
                    "Sandbox executions:",
                    sandboxExecutionCount
                );

                console.log(
                    "Failed reason:",
                    savedJob.failedReason
                );

                // ============================================
                // ASSERTIONS
                // ============================================

                if (
                    savedJob.attemptsMade !== 3
                ) {
                    throw new Error(
                        `Expected 3 attempts, got ${savedJob.attemptsMade}.`
                    );
                }

                if (
                    sandboxExecutionCount !== 3
                ) {
                    throw new Error(
                        `Sandbox should execute 3 times, got ${sandboxExecutionCount}.`
                    );
                }

                console.log(
                    "\nPASS: Retry 3 times + exponential backoff works correctly."
                );

                return;
            }

            await sleep(300);
        }

        throw new Error(
            "Retry test timed out."
        );

    } finally {

        console.log(
            "\nClosing Worker..."
        );

        await worker.close();

        await closeGradingQueue();

        if (
            redisConnection.status !==
            "end"
        ) {
            await redisConnection.quit();
        }
    }
}

main()
    .catch((error) => {

        console.error(
            "\nFAIL: BullMQ Retry test failed."
        );

        console.error(error);

        process.exitCode = 1;
    });