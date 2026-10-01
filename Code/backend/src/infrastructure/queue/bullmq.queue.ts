import {
    JobsOptions,
    Queue,
} from "bullmq";

import {
    redisConnection,
} from "../redis/redis.client.js";

import prisma from "../database/prisma.client.js";


// ============================================================
// QUEUE NAME
// ============================================================

export const GRADING_QUEUE_NAME =
    "grading-queue";


// ============================================================
// JOB DATA
// ============================================================

export interface GradingJobData {

    /**
     * ID của Submission trong MySQL.
     */
    submissionId: string;

    /**
     * Folder đã được TV3 giải nén / staging.
     */
    stagedFolderPath: string;

    /**
     * Assignment / Exam ID.
     *
     * Worker có thể sử dụng ID này
     * để lấy test cases từ TV2.
     */
    assignmentId?: string;

    /**
     * Ngôn ngữ của bài submission.
     */
    language?: "C" | "JAVA";

    /**
     * STANDARD:
     * - PRF192
     * - PRO192
     *
     * CSD:
     * - CSD201 file I/O
     */
    mode?: "STANDARD" | "CSD";
}


// ============================================================
// JOB RESULT
// ============================================================

export interface GradingJobResult {

    submissionId: string;

    status:
        | "COMPLETED"
        | "FAILED";

    sandboxResult?: unknown;

    aiResult?: unknown;

    finalScore?: number;
}


// ============================================================
// ENQUEUE INPUT
// ============================================================

export interface EnqueueSubmissionInput
    extends GradingJobData {

    /**
     * BullMQ priority.
     *
     * Số càng nhỏ thì priority càng cao.
     */
    priority?: number;
}


// ============================================================
// DEFAULT JOB OPTIONS
// ============================================================

export const defaultGradingJobOptions:
    JobsOptions = {

    /**
     * Tổng cộng tối đa 3 attempts.
     */
    attempts: 3,

    /**
     * Exponential backoff:
     *
     * attempt 1 -> wait ~1s
     * attempt 2 -> wait ~2s
     * attempt 3 -> final failure
     */
    backoff: {
        type: "exponential",
        delay: 1000,
    },

    /**
     * Giữ lại 100 job completed
     * để phục vụ status/debug.
     */
    removeOnComplete: {
        count: 100,
    },

    /**
     * Giữ lại 100 job failed.
     */
    removeOnFail: {
        count: 100,
    },
};


// ============================================================
// QUEUE
// ============================================================

export const gradingQueue =
    new Queue<
        GradingJobData,
        GradingJobResult
    >(
        GRADING_QUEUE_NAME,
        {
            connection:
                redisConnection,

            defaultJobOptions:
                defaultGradingJobOptions,
        }
    );


// ============================================================
// ADD RAW BULLMQ JOB
// ============================================================

/**
 * Add trực tiếp một job vào BullMQ.
 *
 * Function này được giữ lại để:
 * - test Queue
 * - test Worker
 * - test Retry
 * - internal use
 *
 * Production flow từ TV3 nên sử dụng
 * enqueueSubmission() ở bên dưới.
 */
export async function addGradingJob(
    data: GradingJobData,
    priority = 5
) {

    const job =
        await gradingQueue.add(
            "grade-submission",
            data,
            {
                priority,
            }
        );

    return job;
}


// ============================================================
// ENQUEUE SUBMISSION
// MYSQL + REDIS LIFECYCLE
// ============================================================

/**
 * Production entry point của TV4.
 *
 * Flow:
 *
 * Submission tồn tại
 *      ↓
 * GradingJob = QUEUED
 *      ↓
 * Submission = QUEUED
 *      ↓
 * BullMQ.add()
 *      ↓
 * save bullmqJobId
 *
 * Nếu Redis/BullMQ lỗi:
 *
 * GradingJob = FAILED
 * Submission = FAILED
 */
export async function enqueueSubmission(
    input: EnqueueSubmissionInput
) {

    const priority =
        input.priority ?? 5;


    // ========================================================
    // 1. CHECK SUBMISSION
    // ========================================================

    const submission =
        await prisma.submission.findUnique({
            where: {
                id: input.submissionId,
            },
        });


    if (!submission) {

        throw new Error(
            `Submission ${input.submissionId} was not found.`
        );
    }


    // ========================================================
    // 2. CREATE / RESET GRADING JOB
    // ========================================================

    const gradingJob =
        await prisma.gradingJob.upsert({

            where: {
                submissionId:
                    input.submissionId,
            },


            // ------------------------------------------------
            // CREATE
            // ------------------------------------------------

            create: {

                submissionId:
                    input.submissionId,

                priority,

                status:
                    "QUEUED",

                retryCount:
                    0,
            },


            // ------------------------------------------------
            // RESET EXISTING JOB
            // ------------------------------------------------

            update: {

                priority,

                status:
                    "QUEUED",

                retryCount:
                    0,

                bullmqJobId:
                    null,

                sandboxWorkerId:
                    null,

                sandboxStartedAt:
                    null,

                sandboxEndedAt:
                    null,

                aiStartedAt:
                    null,

                aiEndedAt:
                    null,

                assignedApiKeyId:
                    null,

                errorStage:
                    null,

                systemLogs:
                    null,
            },
        });


    // ========================================================
    // 3. UPDATE SUBMISSION -> QUEUED
    // ========================================================

    await prisma.submission.update({

        where: {
            id: input.submissionId,
        },

        data: {
            status:
                "QUEUED",
        },
    });


    try {

        // ====================================================
        // 4. ADD JOB TO BULLMQ
        // ====================================================

        const bullmqJob =
            await addGradingJob(
                {
                    submissionId:
                        input.submissionId,

                    stagedFolderPath:
                        input.stagedFolderPath,

                    assignmentId:
                        input.assignmentId,

                    language:
                        input.language,

                    mode:
                        input.mode,
                },

                priority
            );


        if (!bullmqJob.id) {

            throw new Error(
                "BullMQ did not generate a Job ID."
            );
        }


        // ====================================================
        // 5. SAVE BULLMQ JOB ID
        // ====================================================

        const updatedGradingJob =
            await prisma.gradingJob.update({

                where: {
                    id:
                        gradingJob.id,
                },

                data: {
                    bullmqJobId:
                        String(
                            bullmqJob.id
                        ),
                },
            });


        // ====================================================
        // SUCCESS
        // ====================================================

        return {

            bullmqJob,

            gradingJob:
                updatedGradingJob,

            submissionId:
                input.submissionId,

            status:
                "QUEUED" as const,
        };

    } catch (error) {

        // ====================================================
        // 6. BULLMQ ENQUEUE FAILED
        // ====================================================

        const message =
            error instanceof Error
                ? error.message
                : String(error);


        // ----------------------------------------------------
        // Compensating DB update
        // ----------------------------------------------------

        await prisma.gradingJob.update({

            where: {
                id:
                    gradingJob.id,
            },

            data: {

                status:
                    "FAILED",

                errorStage:
                    "SYSTEM",

                systemLogs:
                    `Failed to enqueue BullMQ job: ${message}`,
            },
        });


        await prisma.submission.update({

            where: {
                id:
                    input.submissionId,
            },

            data: {
                status:
                    "FAILED",
            },
        });


        throw error;
    }
}


// ============================================================
// GET JOB
// ============================================================

export async function getGradingJob(
    jobId: string
) {

    return gradingQueue.getJob(
        jobId
    );
}


// ============================================================
// GET JOB BY SUBMISSION
// ============================================================

export async function
getGradingJobBySubmission(
    submissionId: string
) {

    const gradingJob =
        await prisma.gradingJob.findUnique({

            where: {
                submissionId,
            },
        });


    if (!gradingJob) {

        return null;
    }


    let bullmqJob = null;


    if (gradingJob.bullmqJobId) {

        bullmqJob =
            await gradingQueue.getJob(
                gradingJob.bullmqJobId
            );
    }


    return {

        gradingJob,

        bullmqJob,
    };
}


// ============================================================
// GET DATABASE JOB STATUS
// ============================================================

export async function
getGradingJobStatus(
    submissionId: string
) {

    const gradingJob =
        await prisma.gradingJob.findUnique({

            where: {
                submissionId,
            },

            select: {

                id: true,

                submissionId: true,

                bullmqJobId: true,

                priority: true,

                status: true,

                retryCount: true,

                queuedAt: true,

                sandboxStartedAt:
                    true,

                sandboxEndedAt:
                    true,

                aiStartedAt:
                    true,

                aiEndedAt:
                    true,

                errorStage:
                    true,

                systemLogs:
                    true,
            },
        });


    if (!gradingJob) {

        return null;
    }


    // ========================================================
    // OPTIONAL BULLMQ STATE
    // ========================================================

    let queueState:
        string | null = null;

    let progress:
        unknown = null;


    if (gradingJob.bullmqJobId) {

        const bullmqJob =
            await gradingQueue.getJob(
                gradingJob.bullmqJobId
            );


        if (bullmqJob) {

            queueState =
                await bullmqJob.getState();

            progress =
                bullmqJob.progress;
        }
    }


    return {

        ...gradingJob,

        queueState,

        progress,
    };
}


// ============================================================
// CLOSE QUEUE
// ============================================================

export async function
closeGradingQueue():
    Promise<void> {

    await gradingQueue.close();
}   