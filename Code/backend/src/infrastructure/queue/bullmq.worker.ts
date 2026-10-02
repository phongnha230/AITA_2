import {
    Job,
    Worker,
} from "bullmq";

import prisma from "../database/prisma.client.js";

import {
    redisConnection,
} from "../redis/redis.client.js";

import {
    GRADING_QUEUE_NAME,
    GradingJobData,
    GradingJobResult,
} from "./bullmq.queue.js";


// ============================================================
// DEPENDENCIES
// ============================================================

/**
 * TV5 Sandbox and TV6 AI Grader are injected here.
 *
 * This keeps TV4 independent while the other modules
 * are still being developed / merged.
 */
export interface GradingWorkerDependencies {

    runSandbox?: (
        jobData: GradingJobData
    ) => Promise<unknown>;

    runAiGrading?: (
        jobData: GradingJobData,
        sandboxResult: unknown
    ) => Promise<unknown>;

    /**
     * true:
     *   Persist lifecycle to MySQL.
     *
     * false:
     *   Run Worker without database lifecycle.
     *   Useful for isolated BullMQ tests.
     *
     * Default = false so the existing Worker / Retry
     * tests using fake submission IDs still work.
     */
    persistLifecycle?: boolean;
}


// ============================================================
// INTERNAL TYPES
// ============================================================

type ProcessingStage =
    | "SYSTEM"
    | "RUNNING_SANDBOX"
    | "RUNNING_AI";


// ============================================================
// WHOLE JOB TIMEOUT
// ============================================================

const GRADING_JOB_TIMEOUT_MS = 30_000;


// ============================================================
// TIMEOUT HELPER
// ============================================================

async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T> {

    let timer: NodeJS.Timeout | undefined;

    const timeoutPromise =
        new Promise<never>((_, reject) => {

            timer =
                setTimeout(() => {

                    reject(
                        new Error(
                            `Grading job exceeded ${timeoutMs}ms timeout.`
                        )
                    );

                }, timeoutMs);
        });

    try {

        return await Promise.race([
            promise,
            timeoutPromise,
        ]);

    } finally {

        if (timer) {
            clearTimeout(timer);
        }
    }
}


// ============================================================
// NUMBER HELPERS
// ============================================================

function readNumberField(
    value: unknown,
    fields: string[]
): number | undefined {

    if (
        typeof value !== "object"
        || value === null
    ) {
        return undefined;
    }

    const record =
        value as Record<string, unknown>;

    for (const field of fields) {

        const candidate =
            record[field];

        if (
            typeof candidate === "number"
            && Number.isFinite(candidate)
        ) {
            return candidate;
        }
    }

    return undefined;
}


function clamp(
    value: number,
    min: number,
    max: number
): number {

    return Math.min(
        Math.max(value, min),
        max
    );
}


// ============================================================
// SCORE EXTRACTION
// ============================================================

function extractSandboxScore(
    sandboxResult: unknown
): number | undefined {

    const score =
        readNumberField(
            sandboxResult,
            [
                "sandboxScore",
                "score",
            ]
        );

    if (score === undefined) {
        return undefined;
    }

    // TV5 contributes maximum 7 points.
    return clamp(
        score,
        0,
        7
    );
}


function extractAiScore(
    aiResult: unknown
): number | undefined {

    const score =
        readNumberField(
            aiResult,
            [
                "rubricScore",
                "aiScore",
                "score",
            ]
        );

    if (score === undefined) {
        return undefined;
    }

    // TV6 contributes maximum 3 points.
    return clamp(
        score,
        0,
        3
    );
}


// ============================================================
// ERROR HELPERS
// ============================================================

function getErrorMessage(
    error: unknown
): string {

    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
}


function getErrorStage(
    stage: ProcessingStage
):
    | "SANDBOX_EXECUTION"
    | "AI_EVALUATION"
    | "SYSTEM" {

    switch (stage) {

        case "RUNNING_SANDBOX":
            return "SANDBOX_EXECUTION";

        case "RUNNING_AI":
            return "AI_EVALUATION";

        default:
            return "SYSTEM";
    }
}


// ============================================================
// MYSQL LIFECYCLE
// ============================================================

async function markSandboxRunning(
    submissionId: string
): Promise<void> {

    const now =
        new Date();

    await prisma.$transaction([

        prisma.gradingJob.update({
            where: {
                submissionId,
            },

            data: {
                status:
                    "RUNNING_SANDBOX",

                sandboxStartedAt:
                    now,

                sandboxEndedAt:
                    null,

                aiStartedAt:
                    null,

                aiEndedAt:
                    null,

                errorStage:
                    null,

                systemLogs:
                    null,
            },
        }),

        prisma.submission.update({
            where: {
                id:
                    submissionId,
            },

            data: {
                status:
                    "RUNNING_SANDBOX",
            },
        }),
    ]);
}


// ============================================================

async function markAiRunning(
    submissionId: string
): Promise<void> {

    const now =
        new Date();

    await prisma.$transaction([

        prisma.gradingJob.update({
            where: {
                submissionId,
            },

            data: {
                status:
                    "RUNNING_AI",

                sandboxEndedAt:
                    now,

                aiStartedAt:
                    now,
            },
        }),

        prisma.submission.update({
            where: {
                id:
                    submissionId,
            },

            data: {
                status:
                    "RUNNING_AI",
            },
        }),
    ]);
}


// ============================================================

async function markCompleted(
    submissionId: string,
    sandboxResult: unknown,
    aiResult: unknown
): Promise<void> {

    const now =
        new Date();

    const sandboxScore =
        extractSandboxScore(
            sandboxResult
        );

    const aiScore =
        extractAiScore(
            aiResult
        );

    /**
     * Preserve existing DB values if the current TV5/TV6
     * mock or implementation does not expose a score yet.
     */
    const currentSubmission =
        await prisma.submission.findUnique({
            where: {
                id:
                    submissionId,
            },

            select: {
                sandboxScore:
                    true,

                aiScore:
                    true,
            },
        });

    if (!currentSubmission) {

        throw new Error(
            `Submission ${submissionId} was not found while completing grading.`
        );
    }

    const finalSandboxScore =
        sandboxScore
        ?? Number(
            currentSubmission.sandboxScore
            ?? 0
        );

    const finalAiScore =
        aiScore
        ?? Number(
            currentSubmission.aiScore
            ?? 0
        );

    const finalScore =
        clamp(
            finalSandboxScore
            + finalAiScore,
            0,
            10
        );

    await prisma.$transaction([

        prisma.gradingJob.update({
            where: {
                submissionId,
            },

            data: {
                status:
                    "COMPLETED",

                aiEndedAt:
                    now,

                errorStage:
                    null,

                systemLogs:
                    null,
            },
        }),

        prisma.submission.update({
            where: {
                id:
                    submissionId,
            },

            data: {
                status:
                    "GRADED",

                sandboxScore:
                    finalSandboxScore,

                aiScore:
                    finalAiScore,

                finalScore:
                    finalScore,

                gradedAt:
                    now,
            },
        }),
    ]);
}


// ============================================================

async function markFailedAttempt(
    job: Job<
        GradingJobData,
        GradingJobResult
    >,
    stage: ProcessingStage,
    error: unknown
): Promise<void> {

    const submissionId =
        job.data.submissionId;

    /**
     * Inside the processor catch block, BullMQ has not yet
     * increased attemptsMade for the current failed attempt.
     */
    const currentAttempt =
        job.attemptsMade + 1;

    const maxAttempts =
        job.opts.attempts ?? 1;

    const errorMessage =
        getErrorMessage(
            error
        );

    const errorStage =
        getErrorStage(
            stage
        );

    const logMessage =
        [
            `Attempt ${currentAttempt}/${maxAttempts}`,
            `Stage: ${stage}`,
            `Error: ${errorMessage}`,
        ].join(" | ");


    // --------------------------------------------------------
    // RETRYING
    // --------------------------------------------------------

    if (
        currentAttempt <
        maxAttempts
    ) {

        await prisma.gradingJob.update({
            where: {
                submissionId,
            },

            data: {
                status:
                    "RETRYING",

                retryCount:
                    currentAttempt,

                errorStage,

                systemLogs:
                    logMessage,
            },
        });

        console.log(
            `[Worker] ${job.id}: RETRYING (${currentAttempt}/${maxAttempts})`
        );

        return;
    }


    // --------------------------------------------------------
    // FINAL FAILURE
    // --------------------------------------------------------

    await prisma.$transaction([

        prisma.gradingJob.update({
            where: {
                submissionId,
            },

            data: {
                status:
                    "FAILED",

                retryCount:
                    currentAttempt,

                errorStage,

                systemLogs:
                    logMessage,
            },
        }),

        prisma.submission.update({
            where: {
                id:
                    submissionId,
            },

            data: {
                status:
                    "FAILED",
            },
        }),
    ]);

    console.error(
        `[Worker] ${job.id}: FAILED permanently after ${currentAttempt} attempts.`
    );
}


// ============================================================
// PROCESS JOB
// ============================================================

async function processGradingJob(
    job: Job<
        GradingJobData,
        GradingJobResult
    >,
    dependencies: GradingWorkerDependencies
): Promise<GradingJobResult> {

    console.log(
        `[Worker] Processing job ${job.id}`
    );

    console.log(
        `[Worker] Submission: ${job.data.submissionId}`
    );


    let currentStage:
        ProcessingStage =
        "SYSTEM";


    try {

        // ====================================================
        // STAGE 1 - SANDBOX
        // ====================================================

        currentStage =
            "RUNNING_SANDBOX";


        if (
            dependencies.persistLifecycle
        ) {

            await markSandboxRunning(
                job.data.submissionId
            );
        }


        await job.updateProgress({
            stage:
                "RUNNING_SANDBOX",

            percentage:
                25,
        });


        console.log(
            `[Worker] ${job.id}: RUNNING_SANDBOX`
        );


        let sandboxResult: unknown = {
            mocked:
                true,

            message:
                "TV5 Sandbox is not connected yet.",
        };


        if (
            dependencies.runSandbox
        ) {

            sandboxResult =
                await dependencies.runSandbox(
                    job.data
                );
        }


        // ====================================================
        // STAGE 2 - AI
        // ====================================================

        currentStage =
            "RUNNING_AI";


        if (
            dependencies.persistLifecycle
        ) {

            await markAiRunning(
                job.data.submissionId
            );
        }


        await job.updateProgress({
            stage:
                "RUNNING_AI",

            percentage:
                70,
        });


        console.log(
            `[Worker] ${job.id}: RUNNING_AI`
        );


        let aiResult: unknown = {
            mocked:
                true,

            message:
                "TV6 AI Grader is not connected yet.",
        };


        if (
            dependencies.runAiGrading
        ) {

            aiResult =
                await dependencies.runAiGrading(
                    job.data,
                    sandboxResult
                );
        }


        // ====================================================
        // COMPLETED
        // ====================================================

        if (
            dependencies.persistLifecycle
        ) {

            await markCompleted(
                job.data.submissionId,
                sandboxResult,
                aiResult
            );
        }


        await job.updateProgress({
            stage:
                "COMPLETED",

            percentage:
                100,
        });


        console.log(
            `[Worker] ${job.id}: COMPLETED`
        );


        return {
            submissionId:
                job.data.submissionId,

            status:
                "COMPLETED",

            sandboxResult,

            aiResult,
        };

    } catch (error) {

        // ====================================================
        // DATABASE FAILURE / RETRY LIFECYCLE
        // ====================================================

        if (
            dependencies.persistLifecycle
        ) {

            try {

                await markFailedAttempt(
                    job,
                    currentStage,
                    error
                );

            } catch (
                lifecycleError
            ) {

                /**
                 * Do not hide the original Sandbox/AI error.
                 * Log lifecycle persistence error separately.
                 */
                console.error(
                    `[Worker] Could not persist failure lifecycle for job ${job.id}:`,
                    lifecycleError
                );
            }
        }


        // Important:
        // rethrow so BullMQ performs retry/backoff.
        throw error;
    }
}


// ============================================================
// CREATE WORKER
// ============================================================

export function createGradingWorker(
    dependencies: GradingWorkerDependencies = {}
) {

    const worker =
        new Worker<
            GradingJobData,
            GradingJobResult
        >(
            GRADING_QUEUE_NAME,

            async (job) => {

                return withTimeout(
                    processGradingJob(
                        job,
                        dependencies
                    ),

                    GRADING_JOB_TIMEOUT_MS
                );
            },

            {
                connection:
                    redisConnection,

                /**
                 * Sequential processing for now.
                 * Can be increased later after TV5 resource
                 * management is finalized.
                 */
                concurrency:
                    1,
            }
        );


    // ========================================================
    // EVENTS
    // ========================================================

    worker.on(
        "completed",
        (job) => {

            console.log(
                `[Worker] Job ${job.id} completed successfully.`
            );
        }
    );


    worker.on(
        "failed",
        (job, error) => {

            console.error(
                `[Worker] Job ${job?.id} failed. Attempt ${job?.attemptsMade}/${job?.opts.attempts}`
            );

            console.error(
                `[Worker] Reason: ${error.message}`
            );
        }
    );


    worker.on(
        "error",
        (error) => {

            console.error(
                "[Worker] Worker error:",
                error
            );
        }
    );


    return worker;
}