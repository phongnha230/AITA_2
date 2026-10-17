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
import { AppError } from "../../shared/domain/exceptions/app.error.js";
import { logger } from "../logging/logger.js";
import { workspaceService } from "../../modules/submission/infrastructure/storage/workspace.service.js";
import { aggregateGradingScores } from "./grading-score.service.js";


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

const GRADING_JOB_TIMEOUT_MS = 120_000;


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
                "normalizedSandboxScore",
                "totalScore",
                "score",
            ]
        );

    if (score === undefined) {
        return undefined;
    }

    return Math.max(0, score);
}


function extractAiScore(
    aiResult: unknown
): number | undefined {

    const score =
        readNumberField(
            aiResult,
            [
                "overallAiScore",
                "rubricScore",
                "aiScore",
                "score",
            ]
        );

    if (score === undefined) {
        return undefined;
    }

    return Math.max(0, score);
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
    stage: ProcessingStage,
    error: unknown
):
    | "SANDBOX_EXECUTION"
    | "AI_EVALUATION"
    | "AI_RAG"
    | "INPUT_TOO_LARGE"
    | "SYSTEM" {

    if (error instanceof AppError) {
        if (error.errorCode === "INPUT_TOO_LARGE") return "INPUT_TOO_LARGE";
        if (
            error.errorCode === "AI_RAG_UNAVAILABLE"
            || error.errorCode === "AI_PROVIDER_UNAVAILABLE"
            || error.errorCode === "AI_FEEDBACK_LEAKAGE"
        ) return "AI_RAG";
    }

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
    submissionId: string,
    gradingRunId?: string
): Promise<void> {

    const now =
        new Date();

    await prisma.$transaction(async (transaction) => {

        await transaction.gradingJob.update({
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
        });

        await transaction.submission.update({
            where: {
                id:
                    submissionId,
            },

            data: {
                status:
                    "RUNNING_SANDBOX",
            },
        });
        if (gradingRunId) {
            await transaction.gradingRun.update({ where: { id: gradingRunId }, data: { status: 'RUNNING', startedAt: now } });
            await transaction.gradingRunStage.updateMany({ where: { gradingRunId, stageKey: { in: ['TESTCASES', 'WEB_TESTCASES'] } }, data: { status: 'RUNNING', startedAt: now } });
        }
    });
}


// ============================================================

async function markAiRunning(
    submissionId: string,
    gradingRunId?: string
): Promise<void> {

    const now =
        new Date();

    await prisma.$transaction(async (transaction) => {

        await transaction.gradingJob.update({
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
        });

        await transaction.submission.update({
            where: {
                id:
                    submissionId,
            },

            data: {
                status:
                    "RUNNING_AI",
            },
        });
        if (gradingRunId) {
            await transaction.gradingRunStage.updateMany({ where: { gradingRunId, stageKey: { in: ['ANSWER_COMPARISON', 'ALGORITHM', 'CLEAN_CODE', 'SOURCE_REVIEW'] } }, data: { status: 'RUNNING', startedAt: now } });
        }
    });
}


// ============================================================

async function markCompleted(
    submissionId: string,
    sandboxResult: unknown,
    aiResult: unknown,
    gradingRunId?: string
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
                algorithmScore: true,
                cleanCodeScore: true,
                gradingSnapshot: true,
                gitRepoUrl: true,
                gitCommitHash: true,
                deployedUrl: true,
                submissionChannel: true,
                assignment: {
                    select: {
                        environment: true,
                        gradingVersion: true,
                        functionalMaxScore: true,
                        algorithmMaxScore: true,
                        cleanCodeMaxScore: true,
                    },
                },
            },
        });

    if (!currentSubmission) {

        throw new Error(
            `Submission ${submissionId} was not found while completing grading.`
        );
    }

    const snapshot = currentSubmission.gradingSnapshot as { assignment?: Record<string, unknown> } | null;
    const frozenAssignment = snapshot?.assignment;
    const aggregatedScores = aggregateGradingScores({
        sandboxScore: sandboxScore ?? Number(currentSubmission.sandboxScore ?? 0),
        aiScore: aiScore ?? Number(currentSubmission.aiScore ?? 0),
        algorithmScore: readNumberField(aiResult, ["algorithmScore"]) ?? Number(currentSubmission.algorithmScore ?? 0),
        cleanCodeScore: readNumberField(aiResult, ["cleanCodeScore"]) ?? Number(currentSubmission.cleanCodeScore ?? 0),
    }, {
        gradingVersion: Number(frozenAssignment?.gradingVersion ?? currentSubmission.assignment.gradingVersion),
        functionalMaxScore: Number(frozenAssignment?.functionalMaxScore ?? currentSubmission.assignment.functionalMaxScore),
        algorithmMaxScore: Number(frozenAssignment?.algorithmMaxScore ?? currentSubmission.assignment.algorithmMaxScore),
        cleanCodeMaxScore: Number(frozenAssignment?.cleanCodeMaxScore ?? currentSubmission.assignment.cleanCodeMaxScore),
    });

    const run = gradingRunId ? await prisma.gradingRun.findUnique({ where: { id: gradingRunId } }) : null;
    const approvalMode = run?.approvalMode ?? 'AUTO_PUBLISH';
    const submissionStatus = approvalMode === 'AUTO_PUBLISH' ? 'GRADED' : 'REVIEW_PENDING';
    const publishedScore = approvalMode === 'AUTO_PUBLISH' ? aggregatedScores.finalScore : null;
    const jsonRecord = (value: unknown): Record<string, unknown> =>
        typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
    const aiRecord = jsonRecord(aiResult);
    const aiGradingResult = jsonRecord(aiRecord.gradingResult);
    const sandboxRecord = {
        success: jsonRecord(sandboxResult).success ?? null,
        passedTests: jsonRecord(sandboxResult).passedTests ?? null,
        totalTests: jsonRecord(sandboxResult).totalTests ?? null,
    };
    const stageValues: Array<{ key: string; score: number | null; max: number | null; details: Record<string, unknown> }> = [
        { key: 'ANSWER_COMPARISON', score: null, max: null, details: { feedback: aiRecord.answerComparison ?? '' } },
        { key: 'ALGORITHM', score: readNumberField(aiResult, ['algorithmScore']) ?? null, max: Number(frozenAssignment?.algorithmMaxScore ?? currentSubmission.assignment.algorithmMaxScore), details: {
            answerComparison: aiRecord.answerComparison ?? null,
            detectedTimeComplexity: aiGradingResult.detectedTimeComplexity ?? null,
            detectedSpaceComplexity: aiGradingResult.detectedSpaceComplexity ?? null,
            rubricBreakdown: Array.isArray(aiRecord.rubricBreakdown) ? aiRecord.rubricBreakdown.filter((item) => ['ALGORITHM', 'GENERAL'].includes(String(jsonRecord(item).category))) : [],
        } },
        { key: 'CLEAN_CODE', score: readNumberField(aiResult, ['cleanCodeScore']) ?? null, max: Number(frozenAssignment?.cleanCodeMaxScore ?? currentSubmission.assignment.cleanCodeMaxScore), details: {
            feedback: aiGradingResult.codeQualityFeedback ?? '',
            rubricBreakdown: Array.isArray(aiRecord.rubricBreakdown)
                ? aiRecord.rubricBreakdown.filter((item) => currentSubmission.assignment.environment === 'REACT_JS' || jsonRecord(item).category === 'CLEAN_CODE')
                : [],
        } },
        { key: 'SOURCE_REVIEW', score: null, max: null, details: {
            submissionChannel: jsonRecord(currentSubmission).submissionChannel ?? null,
            repositoryUrl: currentSubmission.gitRepoUrl,
            commitHash: currentSubmission.gitCommitHash,
            repositoryAccessible: Boolean(currentSubmission.gitRepoUrl),
            deployedUrl: currentSubmission.deployedUrl,
            deploymentChecked: Boolean(currentSubmission.deployedUrl),
            feedback: 'Repository được checkout và URL deploy được chạy qua bộ testcase web.',
        } },
    ];
    const summaryJson = {
        suggestedFinalScore: aggregatedScores.finalScore,
        publishedFinalScore: publishedScore,
        sandboxScore: aggregatedScores.sandboxScore,
        aiScore: aggregatedScores.aiScore,
        algorithmScore: aggregatedScores.algorithmScore,
        cleanCodeScore: aggregatedScores.cleanCodeScore,
        repositoryUrl: currentSubmission.gitRepoUrl,
        commitHash: currentSubmission.gitCommitHash,
        deployedUrl: currentSubmission.deployedUrl,
        answerComparison: aiRecord.answerComparison ?? null,
        sandbox: sandboxRecord,
    };

    await prisma.$transaction(async (transaction) => {

        await transaction.gradingJob.update({
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
        });

        await transaction.submission.update({
            where: {
                id:
                    submissionId,
            },

            data: {
                status: submissionStatus,

                sandboxScore:
                    aggregatedScores.sandboxScore,

                aiScore:
                    aggregatedScores.aiScore,

                algorithmScore: aggregatedScores.algorithmScore,

                cleanCodeScore: aggregatedScores.cleanCodeScore,

                finalScore: publishedScore,

                gradedAt:
                    now,
            },
        });
        if (gradingRunId) {
            const runData = await transaction.gradingRun.findUnique({ where: { id: gradingRunId }, select: { stages: { select: { id: true, stageKey: true } } } });
            for (const stage of runData?.stages ?? []) {
                if (stage.stageKey === 'TESTCASES' || stage.stageKey === 'WEB_TESTCASES') continue;
                const value = stageValues.find((item) => item.key === stage.stageKey);
                if (!value) continue;
                await transaction.gradingRunStage.update({ where: { id: stage.id }, data: {
                    status: 'COMPLETED', score: value.score, maxScore: value.max,
                    detailsJson: value.details as never, completedAt: now,
                } });
            }
            await transaction.gradingRun.update({ where: { id: gradingRunId }, data: {
                status: approvalMode === 'AUTO_PUBLISH' ? 'PUBLISHED' : 'REVIEW_PENDING',
                completedAt: now,
                summaryJson: summaryJson as never,
            } });
        }
    });
    try {
        await workspaceService.cleanupWorkspace(submissionId);
    } catch (error) {
        logger.error("grading_workspace_cleanup_failed", { submissionId, stage: "CLEANUP", error });
    }
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
            stage,
            error
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

        logger.warn("grading_job_retrying", {
            jobId: job.id,
            submissionId,
            stage,
            attempt: currentAttempt,
            maxAttempts,
            error,
        });

        return;
    }


    // --------------------------------------------------------
    // FINAL FAILURE
    // --------------------------------------------------------

        await prisma.$transaction(async (transaction) => {

        await transaction.gradingJob.update({
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
        });

        await transaction.submission.update({
            where: {
                id:
                    submissionId,
            },

            data: {
                status:
                    "FAILED",
            },
        });
        if (job.data.gradingRunId) {
            await transaction.gradingRun.update({ where: { id: job.data.gradingRunId }, data: { status: 'FAILED', completedAt: new Date() } });
            await transaction.gradingRunStage.updateMany({ where: { gradingRunId: job.data.gradingRunId, status: 'RUNNING' }, data: { status: 'FAILED', errorMessage, completedAt: new Date() } });
        }
    });
    try {
        await workspaceService.cleanupWorkspace(submissionId);
    } catch (cleanupError) {
        logger.error("grading_workspace_cleanup_failed", {
            submissionId,
            stage: "CLEANUP",
            error: cleanupError,
        });
    }

    logger.error("grading_job_failed", {
        jobId: job.id,
        submissionId,
        stage,
        attempt: currentAttempt,
        maxAttempts,
        error,
    });
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

    logger.info("grading_job_started", {
        jobId: job.id,
        submissionId: job.data.submissionId,
        stage: "SYSTEM",
    });


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
                job.data.submissionId,
                job.data.gradingRunId
            );
        }


        await job.updateProgress({
            stage:
                "RUNNING_SANDBOX",

            percentage:
                25,
        });


        logger.info("grading_job_stage", {
            jobId: job.id,
            submissionId: job.data.submissionId,
            stage: "RUNNING_SANDBOX",
        });


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
                job.data.submissionId,
                job.data.gradingRunId
            );
        }


        await job.updateProgress({
            stage:
                "RUNNING_AI",

            percentage:
                70,
        });


        logger.info("grading_job_stage", {
            jobId: job.id,
            submissionId: job.data.submissionId,
            stage: "RUNNING_AI",
        });


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
                aiResult,
                job.data.gradingRunId
            );
        }


        await job.updateProgress({
            stage:
                "COMPLETED",

            percentage:
                100,
        });


        logger.info("grading_job_completed", {
            jobId: job.id,
            submissionId: job.data.submissionId,
            stage: "COMPLETED",
        });


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
                logger.error("grading_lifecycle_persist_failed", {
                    jobId: job.id,
                    submissionId: job.data.submissionId,
                    stage: currentStage,
                    error: lifecycleError,
                });
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

            logger.info("grading_worker_job_completed", {
                jobId: job.id,
                submissionId: job.data.submissionId,
                stage: "COMPLETED",
            });
        }
    );


    worker.on(
        "failed",
        (job, error) => {

            logger.error("grading_worker_job_failed", {
                jobId: job?.id,
                submissionId: job?.data.submissionId,
                stage: "WORKER",
                attempt: job?.attemptsMade,
                maxAttempts: job?.opts.attempts,
                error,
            });
        }
    );


    worker.on(
        "error",
        (error) => {

            logger.error("grading_worker_error", { stage: "WORKER", error });
        }
    );


    return worker;
}
