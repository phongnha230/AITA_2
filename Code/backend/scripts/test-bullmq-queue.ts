import {
    addGradingJob,
    closeGradingQueue,
    getGradingJob,
} from "../src/infrastructure/queue/bullmq.queue.js";

import {
    redisConnection,
} from "../src/infrastructure/redis/redis.client.js";

async function main() {
    console.log("=== BULLMQ QUEUE TEST ===\n");

    // Redis đang để lazyConnect nên chủ động kết nối.
    if (redisConnection.status === "wait") {
        await redisConnection.connect();
    }

    console.log("Redis status:", redisConnection.status);

    const submissionId =
        `test-submission-${Date.now()}`;

    console.log("\n1. Adding grading job...");

    const job = await addGradingJob(
        {
            submissionId,

            stagedFolderPath:
                "./test-submissions/sample",

            assignmentId:
                "test-assignment-001",

            language: "JAVA",

            mode: "STANDARD",
        },
        1
    );

    console.log("Job created.");
    console.log("Job ID:", job.id);

    if (!job.id) {
        throw new Error(
            "BullMQ did not generate a Job ID."
        );
    }

    console.log("\n2. Reading job from Redis...");

    const savedJob =
        await getGradingJob(job.id);

    if (!savedJob) {
        throw new Error(
            "Job was not found in Redis."
        );
    }

    console.log(
        "Submission ID:",
        savedJob.data.submissionId
    );

    console.log(
        "Staged Folder:",
        savedJob.data.stagedFolderPath
    );

    console.log(
        "Language:",
        savedJob.data.language
    );

    console.log(
        "Mode:",
        savedJob.data.mode
    );

    console.log(
        "Priority:",
        savedJob.opts.priority
    );

    console.log(
        "Attempts:",
        savedJob.opts.attempts
    );

    console.log(
        "Backoff:",
        savedJob.opts.backoff
    );

    // ========================================================
    // ASSERTIONS
    // ========================================================

    if (
        savedJob.data.submissionId !==
        submissionId
    ) {
        throw new Error(
            "Submission ID does not match."
        );
    }

    if (
        savedJob.data.stagedFolderPath !==
        "./test-submissions/sample"
    ) {
        throw new Error(
            "Staged folder path does not match."
        );
    }

    if (
        savedJob.opts.attempts !== 3
    ) {
        throw new Error(
            "Job attempts must be 3."
        );
    }

    if (
        savedJob.opts.priority !== 1
    ) {
        throw new Error(
            "Job priority does not match."
        );
    }

    console.log(
        "\nPASS: BullMQ Queue is working correctly."
    );
}

main()
    .catch((error) => {
        console.error(
            "\nFAIL: BullMQ Queue test failed."
        );

        console.error(error);

        process.exitCode = 1;
    })
    .finally(async () => {
        await closeGradingQueue();

        if (
            redisConnection.status !==
            "end"
        ) {
            await redisConnection.quit();
        }
    });