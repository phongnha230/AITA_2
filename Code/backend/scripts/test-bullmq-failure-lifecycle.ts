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

const timestamp = Date.now();

let lecturerId: string | null = null;
let studentId: string | null = null;
let courseId: string | null = null;
let assignmentId: string | null = null;
let submissionId: string | null = null;
let bullmqJobId: string | null = null;

function sleep(ms: number) {
    return new Promise<void>(
        (resolve) => setTimeout(resolve, ms)
    );
}

async function main() {
    console.log(
        "=== BULLMQ FAILURE LIFECYCLE TEST ==="
    );

    // ========================================================
    // 1. CREATE TEST DATA
    // ========================================================

    console.log("\n1. Creating test data...");

    const lecturer = await prisma.user.create({
        data: {
            email: `tv4-fail-lecturer-${timestamp}@test.local`,
            fullName: "TV4 Failure Lecturer",
            role: "LECTURER",
        },
    });

    lecturerId = lecturer.id;

    const student = await prisma.user.create({
        data: {
            email: `tv4-fail-student-${timestamp}@test.local`,
            fullName: "TV4 Failure Student",
            role: "STUDENT",
        },
    });

    studentId = student.id;

    const course = await prisma.course.create({
        data: {
            code: `TV4-FAIL-${timestamp}`,
            name: "TV4 Failure Test",
            semester: `TEST-${timestamp}`,
            lecturerId: lecturer.id,
        },
    });

    courseId = course.id;

    const now = new Date();

    const assignment = await prisma.assignment.create({
        data: {
            courseId: course.id,
            title: "TV4 Failure Assignment",
            environment: "JAVA_JDK",
            startTime: now,
            deadline: new Date(
                now.getTime() + 60 * 60 * 1000
            ),
            createdBy: lecturer.id,
        },
    });

    assignmentId = assignment.id;

    const submission = await prisma.submission.create({
        data: {
            assignmentId: assignment.id,
            userId: student.id,
            submissionChannel: "ZIP_UPLOAD",
            zipFilePath: `./uploads/failure-${timestamp}.zip`,
        },
    });

    submissionId = submission.id;

    console.log(
        "Submission:",
        submission.id
    );

    // ========================================================
    // 2. ENQUEUE
    // ========================================================

    console.log("\n2. Enqueueing...");

    const enqueueResult = await enqueueSubmission({
        submissionId: submission.id,
        assignmentId: assignment.id,
        stagedFolderPath:
            `./workspaces/failure-${timestamp}`,
        language: "JAVA",
        mode: "STANDARD",
        priority: 1,
    });

    if (!enqueueResult.bullmqJob.id) {
        throw new Error(
            "BullMQ Job ID missing."
        );
    }

    bullmqJobId =
        String(enqueueResult.bullmqJob.id);

    console.log(
        "BullMQ Job:",
        bullmqJobId
    );

    // ========================================================
    // 3. START WORKER
    // ========================================================

    console.log(
        "\n3. Starting failing Worker..."
    );

    let sandboxExecutions = 0;

    const worker = createGradingWorker({
        persistLifecycle: true,

        runSandbox: async (jobData) => {
            sandboxExecutions++;

            console.log(
                `[Mock TV5] Attempt ${sandboxExecutions}`
            );

            console.log(
                `[Mock TV5] Submission ${jobData.submissionId}`
            );

            throw new Error(
                "Mock Sandbox execution failure"
            );
        },

        runAiGrading: async () => {
            throw new Error(
                "AI SHOULD NOT RUN"
            );
        },
    });

    // ========================================================
    // 4. WAIT FOR FINAL FAILURE
    // ========================================================

    console.log(
        "\n4. Waiting for retries..."
    );

    const startedAt = Date.now();

    let bullmqState = "unknown";

    while (
        Date.now() - startedAt < 20_000
    ) {
        if (!bullmqJobId) {
            throw new Error(
                "BullMQ Job ID missing."
            );
        }

        const job =
            await getGradingJob(
                bullmqJobId
            );

        if (!job) {
            throw new Error(
                "BullMQ Job not found."
            );
        }

        bullmqState =
            await job.getState();

        const dbJob =
            await prisma.gradingJob.findUnique({
                where: {
                    submissionId:
                        submission.id,
                },
            });

        const dbSubmission =
            await prisma.submission.findUnique({
                where: {
                    id:
                        submission.id,
                },
            });

        console.log(
            `BullMQ: ${bullmqState}`
            + ` | DB: ${dbJob?.status}`
            + ` | Submission: ${dbSubmission?.status}`
            + ` | Retry: ${dbJob?.retryCount}`
        );

        if (bullmqState === "failed") {
            break;
        }

        await sleep(300);
    }

    await sleep(300);

    // ========================================================
    // 5. FINAL DATABASE STATE
    // ========================================================

    console.log(
        "\n5. Checking final state..."
    );

    const finalJob =
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

    if (!finalJob || !finalSubmission) {
        throw new Error(
            "Final database records missing."
        );
    }

    console.log(
        "BullMQ:",
        bullmqState
    );

    console.log(
        "GradingJob:",
        finalJob.status
    );

    console.log(
        "Submission:",
        finalSubmission.status
    );

    console.log(
        "Retry Count:",
        finalJob.retryCount
    );

    console.log(
        "Error Stage:",
        finalJob.errorStage
    );

    console.log(
        "System Logs:",
        finalJob.systemLogs
    );

    console.log(
        "Sandbox Executions:",
        sandboxExecutions
    );

    // ========================================================
    // 6. ASSERTIONS
    // ========================================================

    if (bullmqState !== "failed") {
        throw new Error(
            `Expected BullMQ failed, got ${bullmqState}`
        );
    }

    if (finalJob.status !== "FAILED") {
        throw new Error(
            `Expected DB FAILED, got ${finalJob.status}`
        );
    }

    if (finalSubmission.status !== "FAILED") {
        throw new Error(
            `Expected Submission FAILED, got ${finalSubmission.status}`
        );
    }

    if (finalJob.retryCount !== 3) {
        throw new Error(
            `Expected retryCount 3, got ${finalJob.retryCount}`
        );
    }

    if (
        finalJob.errorStage !==
        "SANDBOX_EXECUTION"
    ) {
        throw new Error(
            `Expected SANDBOX_EXECUTION, got ${finalJob.errorStage}`
        );
    }

    if (sandboxExecutions !== 3) {
        throw new Error(
            `Expected 3 Sandbox executions, got ${sandboxExecutions}`
        );
    }

    console.log(
        "\n======================================"
    );

    console.log(
        "PASS: Failure lifecycle works correctly."
    );

    console.log(
        "RUNNING_SANDBOX -> RETRYING -> FAILED"
    );

    console.log(
        "Submission -> FAILED"
    );

    console.log(
        "retryCount = 3"
    );

    console.log(
        "errorStage = SANDBOX_EXECUTION"
    );

    console.log(
        "======================================"
    );

    await worker.close();
}


// ============================================================
// CLEANUP
// ============================================================

async function cleanup() {
    console.log("\n=== CLEANUP ===");

    if (bullmqJobId) {
        try {
            const job =
                await getGradingJob(
                    bullmqJobId
                );

            if (job) {
                await job.remove();
            }
        } catch {
            // Ignore cleanup-only BullMQ errors.
        }
    }

    if (submissionId) {
        await prisma.submission.deleteMany({
            where: { id: submissionId },
        });
    }

    if (assignmentId) {
        await prisma.assignment.deleteMany({
            where: { id: assignmentId },
        });
    }

    if (courseId) {
        await prisma.course.deleteMany({
            where: { id: courseId },
        });
    }

    if (studentId) {
        await prisma.user.deleteMany({
            where: { id: studentId },
        });
    }

    if (lecturerId) {
        await prisma.user.deleteMany({
            where: { id: lecturerId },
        });
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
            "\nFAIL: Failure lifecycle test failed."
        );

        console.error(error);

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
        }

        try {
            await closeGradingQueue();
        } catch {
            // Ignore close error.
        }

        try {
            if (
                redisConnection.status !== "end"
            ) {
                await redisConnection.quit();
            }
        } catch {
            // Ignore close error.
        }

        await prisma.$disconnect();
    });