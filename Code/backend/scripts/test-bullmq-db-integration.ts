import prisma from "../src/infrastructure/database/prisma.client.js";

import {
    enqueueSubmission,
    getGradingJob,
    closeGradingQueue,
} from "../src/infrastructure/queue/bullmq.queue.js";

import {
    createGradingWorker,
} from "../src/infrastructure/queue/bullmq.worker.js";

import {
    redisConnection,
} from "../src/infrastructure/redis/redis.client.js";


// ============================================================
// TEST DATA
// ============================================================

const timestamp = Date.now();

let lecturerId: string | null = null;
let studentId: string | null = null;
let courseId: string | null = null;
let assignmentId: string | null = null;
let submissionId: string | null = null;
let bullmqJobId: string | null = null;


// ============================================================
// HELPER
// ============================================================

function sleep(ms: number): Promise<void> {
    return new Promise(
        (resolve) => setTimeout(resolve, ms)
    );
}


// ============================================================
// MAIN TEST
// ============================================================

async function main(): Promise<void> {

    console.log(
        "=== BULLMQ + MYSQL LIFECYCLE TEST ==="
    );


    // ========================================================
    // 1. CREATE LECTURER
    // ========================================================

    console.log(
        "\n1. Creating lecturer..."
    );

    const lecturer =
        await prisma.user.create({
            data: {
                email:
                    `tv4-life-lecturer-${timestamp}@test.local`,

                fullName:
                    "TV4 Lifecycle Lecturer",

                role:
                    "LECTURER",
            },
        });

    lecturerId =
        lecturer.id;


    // ========================================================
    // 2. CREATE STUDENT
    // ========================================================

    console.log(
        "2. Creating student..."
    );

    const student =
        await prisma.user.create({
            data: {
                email:
                    `tv4-life-student-${timestamp}@test.local`,

                fullName:
                    "TV4 Lifecycle Student",

                role:
                    "STUDENT",
            },
        });

    studentId =
        student.id;


    // ========================================================
    // 3. CREATE COURSE
    // ========================================================

    console.log(
        "3. Creating course..."
    );

    const course =
        await prisma.course.create({
            data: {
                code:
                    `TV4-LIFE-${timestamp}`,

                name:
                    "TV4 Lifecycle Test",

                semester:
                    `TEST-${timestamp}`,

                lecturerId:
                    lecturer.id,
            },
        });

    courseId =
        course.id;


    // ========================================================
    // 4. CREATE ASSIGNMENT
    // ========================================================

    console.log(
        "4. Creating assignment..."
    );

    const now =
        new Date();

    const deadline =
        new Date(
            now.getTime()
            + 60 * 60 * 1000
        );

    const assignment =
        await prisma.assignment.create({
            data: {
                courseId:
                    course.id,

                title:
                    "TV4 Lifecycle Assignment",

                description:
                    "Temporary lifecycle test assignment.",

                environment:
                    "JAVA_JDK",

                startTime:
                    now,

                deadline,

                createdBy:
                    lecturer.id,
            },
        });

    assignmentId =
        assignment.id;


    // ========================================================
    // 5. CREATE SUBMISSION
    // ========================================================

    console.log(
        "5. Creating submission..."
    );

    const submission =
        await prisma.submission.create({
            data: {
                assignmentId:
                    assignment.id,

                userId:
                    student.id,

                submissionChannel:
                    "ZIP_UPLOAD",

                zipFilePath:
                    `./uploads/tv4-lifecycle-${timestamp}.zip`,
            },
        });

    submissionId =
        submission.id;

    console.log(
        "Submission ID:",
        submission.id
    );

    console.log(
        "Initial status:",
        submission.status
    );


    // ========================================================
    // 6. ENQUEUE
    // ========================================================

    console.log(
        "\n6. Enqueueing submission..."
    );

    const enqueueResult =
        await enqueueSubmission({
            submissionId:
                submission.id,

            assignmentId:
                assignment.id,

            stagedFolderPath:
                `./workspaces/tv4-lifecycle-${timestamp}`,

            language:
                "JAVA",

            mode:
                "STANDARD",

            priority:
                1,
        });

    if (!enqueueResult.bullmqJob.id) {
        throw new Error(
            "BullMQ Job ID is missing."
        );
    }

    bullmqJobId =
        String(
            enqueueResult.bullmqJob.id
        );

    console.log(
        "BullMQ Job ID:",
        bullmqJobId
    );


    // ========================================================
    // 7. VERIFY QUEUED
    // ========================================================

    console.log(
        "\n7. Checking QUEUED state..."
    );

    const queuedGradingJob =
        await prisma.gradingJob.findUnique({
            where: {
                submissionId:
                    submission.id,
            },
        });

    const queuedSubmission =
        await prisma.submission.findUnique({
            where: {
                id:
                    submission.id,
            },
        });

    if (!queuedGradingJob) {
        throw new Error(
            "GradingJob was not created."
        );
    }

    if (!queuedSubmission) {
        throw new Error(
            "Submission was not found."
        );
    }

    console.log(
        "GradingJob:",
        queuedGradingJob.status
    );

    console.log(
        "Submission:",
        queuedSubmission.status
    );

    if (
        queuedGradingJob.status !==
        "QUEUED"
    ) {
        throw new Error(
            `Expected GradingJob QUEUED but got ${queuedGradingJob.status}`
        );
    }

    if (
        queuedSubmission.status !==
        "QUEUED"
    ) {
        throw new Error(
            `Expected Submission QUEUED but got ${queuedSubmission.status}`
        );
    }


    // ========================================================
    // 8. CREATE WORKER
    // ========================================================

    console.log(
        "\n8. Starting Worker..."
    );

    const worker =
        createGradingWorker({

            // IMPORTANT:
            // Enable real MySQL lifecycle persistence.
            persistLifecycle:
                true,


            // =================================================
            // MOCK TV5
            // =================================================

            runSandbox:
                async (jobData) => {

                    console.log(
                        `[Mock TV5] Running ${jobData.submissionId}`
                    );

                    // Delay so lifecycle is observable.
                    await sleep(500);

                    return {
                        compileSuccess:
                            true,

                        passedTests:
                            4,

                        totalTests:
                            5,

                        sandboxScore:
                            5.6,

                        failedTests: [
                            {
                                testCaseId:
                                    "TC05",

                                verdict:
                                    "WRONG_ANSWER",
                            },
                        ],
                    };
                },


            // =================================================
            // MOCK TV6
            // =================================================

            runAiGrading:
                async (
                    jobData,
                    sandboxResult
                ) => {

                    console.log(
                        `[Mock TV6] Grading ${jobData.submissionId}`
                    );

                    console.log(
                        "[Mock TV6] Sandbox result:",
                        sandboxResult
                    );

                    // Delay so lifecycle is observable.
                    await sleep(500);

                    return {
                        rubricScore:
                            2.5,

                        feedback:
                            "Mock AI lifecycle grading completed.",
                    };
                },
        });


    // ========================================================
    // 9. WAIT FOR COMPLETION
    // ========================================================

    console.log(
        "\n9. Waiting for Worker..."
    );

    const maxWaitMs =
        15_000;

    const startedAt =
        Date.now();

    let finalBullmqState =
        "unknown";

    while (
        Date.now() - startedAt <
        maxWaitMs
    ) {

        if (!bullmqJobId) {
            throw new Error(
                "BullMQ Job ID disappeared."
            );
        }

        const bullmqJob =
            await getGradingJob(
                bullmqJobId
            );

        if (!bullmqJob) {
            throw new Error(
                "BullMQ Job was not found."
            );
        }

        finalBullmqState =
            await bullmqJob.getState();

        const currentGradingJob =
            await prisma.gradingJob.findUnique({
                where: {
                    submissionId:
                        submission.id,
                },
            });

        const currentSubmission =
            await prisma.submission.findUnique({
                where: {
                    id:
                        submission.id,
                },
            });

        console.log(
            `BullMQ: ${finalBullmqState}`
            + ` | GradingJob: ${currentGradingJob?.status}`
            + ` | Submission: ${currentSubmission?.status}`
        );

        if (
            finalBullmqState ===
            "completed"
        ) {
            break;
        }

        if (
            finalBullmqState ===
            "failed"
        ) {
            throw new Error(
                `BullMQ Job entered FAILED state.`
            );
        }

        await sleep(250);
    }


    if (
        finalBullmqState !==
        "completed"
    ) {
        throw new Error(
            "Lifecycle test timed out waiting for BullMQ completion."
        );
    }


    // ========================================================
    // 10. READ FINAL DATABASE STATE
    // ========================================================

    console.log(
        "\n10. Checking final MySQL state..."
    );

    const finalGradingJob =
        await prisma.gradingJob.findUnique({
            where: {
                submissionId:
                    submission.id,
            },
        });

    const finalSubmission =
        await prisma.submission.findUnique({
            where: {
                id:
                    submission.id,
            },
        });

    if (!finalGradingJob) {
        throw new Error(
            "Final GradingJob was not found."
        );
    }

    if (!finalSubmission) {
        throw new Error(
            "Final Submission was not found."
        );
    }


    console.log(
        "GradingJob Status:",
        finalGradingJob.status
    );

    console.log(
        "Submission Status:",
        finalSubmission.status
    );

    console.log(
        "Sandbox Score:",
        Number(
            finalSubmission.sandboxScore
        )
    );

    console.log(
        "AI Score:",
        Number(
            finalSubmission.aiScore
        )
    );

    console.log(
        "Final Score:",
        Number(
            finalSubmission.finalScore
        )
    );

    console.log(
        "Sandbox Started:",
        finalGradingJob.sandboxStartedAt
    );

    console.log(
        "Sandbox Ended:",
        finalGradingJob.sandboxEndedAt
    );

    console.log(
        "AI Started:",
        finalGradingJob.aiStartedAt
    );

    console.log(
        "AI Ended:",
        finalGradingJob.aiEndedAt
    );

    console.log(
        "Graded At:",
        finalSubmission.gradedAt
    );


    // ========================================================
    // 11. ASSERT FINAL LIFECYCLE
    // ========================================================

    console.log(
        "\n11. Running lifecycle assertions..."
    );


    if (
        finalGradingJob.status !==
        "COMPLETED"
    ) {
        throw new Error(
            `Expected GradingJob COMPLETED but got ${finalGradingJob.status}`
        );
    }


    if (
        finalSubmission.status !==
        "GRADED"
    ) {
        throw new Error(
            `Expected Submission GRADED but got ${finalSubmission.status}`
        );
    }


    if (
        !finalGradingJob.sandboxStartedAt
    ) {
        throw new Error(
            "sandboxStartedAt was not saved."
        );
    }


    if (
        !finalGradingJob.sandboxEndedAt
    ) {
        throw new Error(
            "sandboxEndedAt was not saved."
        );
    }


    if (
        !finalGradingJob.aiStartedAt
    ) {
        throw new Error(
            "aiStartedAt was not saved."
        );
    }


    if (
        !finalGradingJob.aiEndedAt
    ) {
        throw new Error(
            "aiEndedAt was not saved."
        );
    }


    if (
        !finalSubmission.gradedAt
    ) {
        throw new Error(
            "gradedAt was not saved."
        );
    }


    // ========================================================
    // SCORE ASSERTIONS
    // ========================================================

    const sandboxScore =
        Number(
            finalSubmission.sandboxScore
        );

    const aiScore =
        Number(
            finalSubmission.aiScore
        );

    const finalScore =
        Number(
            finalSubmission.finalScore
        );


    if (
        Math.abs(
            sandboxScore - 5.6
        ) > 0.001
    ) {
        throw new Error(
            `Expected sandboxScore 5.6 but got ${sandboxScore}`
        );
    }


    if (
        Math.abs(
            aiScore - 2.5
        ) > 0.001
    ) {
        throw new Error(
            `Expected aiScore 2.5 but got ${aiScore}`
        );
    }


    if (
        Math.abs(
            finalScore - 8.1
        ) > 0.001
    ) {
        throw new Error(
            `Expected finalScore 8.1 but got ${finalScore}`
        );
    }


    if (
        finalGradingJob.errorStage !==
        null
    ) {
        throw new Error(
            `Expected errorStage null but got ${finalGradingJob.errorStage}`
        );
    }


    // ========================================================
    // PASS
    // ========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "PASS: BullMQ + MySQL lifecycle works correctly."
    );

    console.log(
        "QUEUED -> RUNNING_SANDBOX -> RUNNING_AI -> COMPLETED"
    );

    console.log(
        "Submission -> GRADED"
    );

    console.log(
        "Score: 5.6 + 2.5 = 8.1"
    );

    console.log(
        "========================================"
    );


    // ========================================================
    // CLOSE WORKER BEFORE CLEANUP
    // ========================================================

    console.log(
        "\nClosing Worker..."
    );

    await worker.close();
}


// ============================================================
// CLEANUP
// ============================================================

async function cleanup(): Promise<void> {

    console.log(
        "\n=== CLEANUP ==="
    );


    // ========================================================
    // REMOVE BULLMQ JOB
    // ========================================================

    if (bullmqJobId) {

        try {

            const job =
                await getGradingJob(
                    bullmqJobId
                );

            if (job) {

                await job.remove();

                console.log(
                    "Removed BullMQ job:",
                    bullmqJobId
                );
            }

        } catch (error) {

            console.warn(
                "Could not remove BullMQ job:",
                error
            );
        }
    }


    // ========================================================
    // REMOVE SUBMISSION
    // ========================================================

    if (submissionId) {

        await prisma.submission.deleteMany({
            where: {
                id:
                    submissionId,
            },
        });

        console.log(
            "Removed submission."
        );
    }


    // ========================================================
    // REMOVE ASSIGNMENT
    // ========================================================

    if (assignmentId) {

        await prisma.assignment.deleteMany({
            where: {
                id:
                    assignmentId,
            },
        });

        console.log(
            "Removed assignment."
        );
    }


    // ========================================================
    // REMOVE COURSE
    // ========================================================

    if (courseId) {

        await prisma.course.deleteMany({
            where: {
                id:
                    courseId,
            },
        });

        console.log(
            "Removed course."
        );
    }


    // ========================================================
    // REMOVE STUDENT
    // ========================================================

    if (studentId) {

        await prisma.user.deleteMany({
            where: {
                id:
                    studentId,
            },
        });

        console.log(
            "Removed student."
        );
    }


    // ========================================================
    // REMOVE LECTURER
    // ========================================================

    if (lecturerId) {

        await prisma.user.deleteMany({
            where: {
                id:
                    lecturerId,
            },
        });

        console.log(
            "Removed lecturer."
        );
    }

    console.log(
        "Cleanup completed."
    );
}


// ============================================================
// RUN
// ============================================================

main()

    .catch((error) => {

        console.error(
            "\n========================================"
        );

        console.error(
            "FAIL: Lifecycle test failed."
        );

        console.error(
            "========================================"
        );

        console.error(
            error
        );

        process.exitCode = 1;
    })

    .finally(async () => {

        try {

            await cleanup();

        } catch (error) {

            console.error(
                "Cleanup error:",
                error
            );

            process.exitCode = 1;
        }


        try {

            await closeGradingQueue();

        } catch (error) {

            console.error(
                "Queue close error:",
                error
            );
        }


        try {

            if (
                redisConnection.status !==
                "end"
            ) {
                await redisConnection.quit();
            }

        } catch (error) {

            console.error(
                "Redis close error:",
                error
            );
        }


        try {

            await prisma.$disconnect();

        } catch (error) {

            console.error(
                "Prisma disconnect error:",
                error
            );
        }
    });