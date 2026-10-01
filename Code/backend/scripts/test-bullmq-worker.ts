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


// ============================================================
// HELPER
// ============================================================

function sleep(ms: number) {
    return new Promise(
        (resolve) => setTimeout(resolve, ms)
    );
}


// ============================================================
// TEST
// ============================================================

async function main() {

    console.log(
        "=== BULLMQ WORKER TEST ===\n"
    );

    // --------------------------------------------------------
    // MOCK TV5 + TV6
    // --------------------------------------------------------

    const worker =
        createGradingWorker({

            // Mock TV5 Sandbox
            runSandbox: async (jobData) => {

                console.log(
                    `[Mock TV5] Running sandbox for ${jobData.submissionId}`
                );

                await sleep(500);

                return {
                    compileSuccess: true,

                    passedTests: 4,

                    totalTests: 5,

                    sandboxScore: 5.6,

                    failedTests: [
                        {
                            testCaseId: "TC05",
                            verdict: "WRONG_ANSWER",
                        },
                    ],
                };
            },


            // Mock TV6 AI
            runAiGrading: async (
                jobData,
                sandboxResult
            ) => {

                console.log(
                    `[Mock TV6] AI grading ${jobData.submissionId}`
                );

                console.log(
                    "[Mock TV6] Received sandbox result:",
                    sandboxResult
                );

                await sleep(500);

                return {
                    rubricScore: 2.5,

                    feedback:
                        "Mock AI grading completed.",
                };
            },
        });


    try {

        // ----------------------------------------------------
        // ADD JOB
        // ----------------------------------------------------

        console.log(
            "1. Adding job..."
        );

        const job =
            await addGradingJob(
                {
                    submissionId:
                        `worker-test-${Date.now()}`,

                    stagedFolderPath:
                        "./test-submissions/sample",

                    assignmentId:
                        "assignment-test-001",

                    language:
                        "JAVA",

                    mode:
                        "STANDARD",
                },
                1
            );


        console.log(
            `Job created: ${job.id}`
        );


        if (!job.id) {
            throw new Error(
                "Job ID was not generated."
            );
        }


        // ----------------------------------------------------
        // WAIT UNTIL COMPLETED
        // ----------------------------------------------------

        console.log(
            "\n2. Waiting for Worker..."
        );


        const maxWaitMs = 10_000;

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
                `Current state: ${state}`
            );


            if (
                state === "completed"
            ) {

                console.log(
                    "\n3. Job completed."
                );


                console.log(
                    "Progress:",
                    savedJob.progress
                );


                console.log(
                    "Result:",
                    savedJob.returnvalue
                );


                // --------------------------------------------
                // ASSERTIONS
                // --------------------------------------------

                if (
                    savedJob.returnvalue
                        ?.status !==
                    "COMPLETED"
                ) {

                    throw new Error(
                        "Unexpected job result."
                    );
                }


                if (
                    savedJob.progress &&
                    typeof savedJob.progress ===
                        "object" &&
                    "percentage" in
                        savedJob.progress &&
                    savedJob.progress
                        .percentage !==
                        100
                ) {

                    throw new Error(
                        "Final progress must be 100."
                    );
                }


                console.log(
                    "\nPASS: BullMQ Worker is working correctly."
                );

                return;
            }


            if (
                state === "failed"
            ) {

                throw new Error(
                    savedJob.failedReason ||
                    "Job failed."
                );
            }


            await sleep(300);
        }


        throw new Error(
            "Worker test timed out."
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


// ============================================================
// RUN
// ============================================================

main()
    .catch((error) => {

        console.error(
            "\nFAIL: BullMQ Worker test failed."
        );

        console.error(error);

        process.exitCode = 1;
    });