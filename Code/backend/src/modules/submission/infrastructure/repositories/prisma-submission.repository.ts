import { Prisma, PrismaClient } from '@prisma/client';
import {
  ISubmissionRepository,
  CreateSubmissionData,
} from '../../domain/repositories/submission.repository.interface.js';
import { Submission, SubmissionStatus } from '../../domain/entities/submission.entity.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

export class PrismaSubmissionRepository implements ISubmissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: any): Submission {
    return new Submission({
      id: raw.id,
      assignmentId: raw.assignmentId,
      userId: raw.userId,
      groupLabel: raw.groupLabel,
      paperCode: raw.paperCode,
      submissionChannel: raw.submissionChannel,
      zipFilePath: raw.zipFilePath,
      zipFileSize: raw.zipFileSize ? Number(raw.zipFileSize) : null,
      gitRepoUrl: raw.gitRepoUrl,
      gitCommitHash: raw.gitCommitHash,
      deployedUrl: raw.deployedUrl,
      workspacePath: raw.workspacePath,
      teamId: raw.teamId,
      attemptNo: raw.attemptNo,
      status: raw.status,
      sandboxScore: raw.sandboxScore !== null && raw.sandboxScore !== undefined ? Number(raw.sandboxScore) : null,
      aiScore: raw.aiScore !== null && raw.aiScore !== undefined ? Number(raw.aiScore) : null,
      algorithmScore: raw.algorithmScore !== null && raw.algorithmScore !== undefined ? Number(raw.algorithmScore) : null,
      cleanCodeScore: raw.cleanCodeScore !== null && raw.cleanCodeScore !== undefined ? Number(raw.cleanCodeScore) : null,
      finalScore: raw.finalScore !== null && raw.finalScore !== undefined ? Number(raw.finalScore) : null,
      compileSuccess: raw.compileSuccess,
      compileOutput: raw.compileOutput,
      submittedAt: raw.submittedAt,
      gradedAt: raw.gradedAt,
      locChurn: raw.locChurn,
      commitCount: raw.commitCount,
      user: raw.user
        ? {
            id: raw.user.id,
            fullName: raw.user.fullName,
            email: raw.user.email,
          }
        : undefined,
      assignment: raw.assignment
        ? {
            id: raw.assignment.id,
            title: raw.assignment.title,
            courseId: raw.assignment.courseId,
            environment: raw.assignment.environment,
            gradingVersion: raw.assignment.gradingVersion,
            functionalMaxScore: raw.assignment.functionalMaxScore !== undefined ? Number(raw.assignment.functionalMaxScore) : undefined,
            algorithmMaxScore: raw.assignment.algorithmMaxScore !== undefined ? Number(raw.assignment.algorithmMaxScore) : undefined,
            cleanCodeMaxScore: raw.assignment.cleanCodeMaxScore !== undefined ? Number(raw.assignment.cleanCodeMaxScore) : undefined,
          }
        : undefined,
      team: raw.team
        ? { id: raw.team.id, name: raw.team.name, projectTitle: raw.team.projectTitle }
        : null,
      participants: raw.participants?.map((participant: any) => ({
        userId: participant.userId,
        teamRole: participant.teamRole,
        adjustedScore: participant.adjustedScore == null ? null : Number(participant.adjustedScore),
        adjustmentReason: participant.adjustmentReason,
        adjustedAt: participant.adjustedAt,
        user: participant.user,
      })),
      gitContributors: raw.gitContributors?.map((contributor: any) => ({
        id: contributor.id,
        authorName: contributor.authorName,
        authorEmail: contributor.authorEmail,
        commitCount: contributor.commitCount,
        linesAdded: contributor.linesAdded,
        linesDeleted: contributor.linesDeleted,
        contributionPct: Number(contributor.contributionPct),
        matchedUserId: contributor.matchedUserId,
        activeDays: contributor.activeDays,
        firstCommitAt: contributor.firstCommitAt,
        lastCommitAt: contributor.lastCommitAt,
      })),
    });
  }

  async create(data: CreateSubmissionData): Promise<Submission> {
    return this.prisma.$transaction(async (transaction) => {
      const assignmentSnapshot = await transaction.assignment.findUnique({
        where: { id: data.assignmentId },
        include: {
          course: { select: { code: true } },
          testCases: { orderBy: { orderIndex: 'asc' } },
          rubricRules: { orderBy: { orderIndex: 'asc' } },
          solutions: { where: { isActive: true }, take: 1, orderBy: { createdAt: 'desc' } },
        },
      });
      if (!assignmentSnapshot) throw new Error(`Assignment snapshot unavailable: ${data.assignmentId}`);
      const gradingSnapshot = {
        assignment: {
          id: assignmentSnapshot.id,
          title: assignmentSnapshot.title,
          description: assignmentSnapshot.description,
          environment: assignmentSnapshot.environment,
          courseCode: assignmentSnapshot.course.code,
          gradingVersion: assignmentSnapshot.gradingVersion,
          gradingApprovalMode: assignmentSnapshot.gradingApprovalMode,
          maxFileSizeBytes: assignmentSnapshot.maxFileSizeBytes.toString(),
          functionalMaxScore: Number(assignmentSnapshot.functionalMaxScore),
          algorithmMaxScore: Number(assignmentSnapshot.algorithmMaxScore),
          cleanCodeMaxScore: Number(assignmentSnapshot.cleanCodeMaxScore),
        },
        testCases: assignmentSnapshot.testCases.map((testCase) => ({
          id: testCase.id,
          label: testCase.label,
          paperCode: testCase.paperCode,
          isHidden: testCase.isHidden,
          rationaleTag: testCase.rationaleTag,
          stdinInput: testCase.stdinInput,
          expectedStdout: testCase.expectedStdout,
          inputFileName: testCase.inputFileName,
          inputFileContent: testCase.inputFileContent,
          expectedFileName: testCase.expectedFileName,
          expectedFileContent: testCase.expectedFileContent,
          comparisonMode: testCase.comparisonMode,
          timeLimitMs: testCase.timeLimitMs,
          memoryLimitKb: testCase.memoryLimitKb,
          points: Number(testCase.points),
          orderIndex: testCase.orderIndex,
        })),
        rubricRules: assignmentSnapshot.rubricRules.map((rule) => ({
          id: rule.id,
          criterionName: rule.criterionName,
          description: rule.description,
          criterionType: rule.criterionType,
          maxPoints: Number(rule.maxPoints),
          weight: Number(rule.weight),
          orderIndex: rule.orderIndex,
        })),
        referenceSolution: assignmentSnapshot.solutions[0]
          ? {
              id: assignmentSnapshot.solutions[0].id,
              title: assignmentSnapshot.solutions[0].title,
              contentHash: assignmentSnapshot.solutions[0].contentHash,
              sourceCode: assignmentSnapshot.solutions[0].sourceCode,
              explanation: assignmentSnapshot.solutions[0].explanation,
              expectedTimeComplexity: assignmentSnapshot.solutions[0].expectedTimeComplexity,
              expectedSpaceComplexity: assignmentSnapshot.solutions[0].expectedSpaceComplexity,
              acceptedStrategies: assignmentSnapshot.solutions[0].acceptedStrategies,
              algorithmNotes: assignmentSnapshot.solutions[0].algorithmNotes,
            }
          : null,
      };
      const latest = await transaction.submission.findFirst({
        where: data.teamId
          ? { assignmentId: data.assignmentId, teamId: data.teamId }
          : { assignmentId: data.assignmentId, userId: data.userId, teamId: null },
        select: { attemptNo: true },
        orderBy: { attemptNo: 'desc' },
      });
      const raw = await transaction.submission.create({
        data: {
          assignmentId: data.assignmentId,
          userId: data.userId,
          teamId: data.teamId ?? null,
          attemptNo: (latest?.attemptNo ?? 0) + 1,
          groupLabel: data.groupLabel ?? null,
          paperCode: data.paperCode ? data.paperCode.trim().toUpperCase() : null,
          submissionChannel: data.submissionChannel,
          zipFilePath: data.zipFilePath ?? null,
          zipFileSize: data.zipFileSize ? BigInt(data.zipFileSize) : null,
          gitRepoUrl: data.gitRepoUrl ?? null,
          gitCommitHash: data.gitCommitHash ?? null,
          deployedUrl: data.deployedUrl ?? null,
          workspacePath: data.workspacePath ?? null,
          status: 'PENDING',
          gradingSnapshot: gradingSnapshot as unknown as Prisma.InputJsonValue,
          participants: data.participants?.length
            ? { create: data.participants.map((participant) => ({ ...participant })) }
            : undefined,
        },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          assignment: { select: { id: true, title: true, courseId: true, environment: true } },
          team: { select: { id: true, name: true, projectTitle: true } },
          participants: { include: { user: { select: { id: true, fullName: true, email: true } } } },
          gitContributors: true,
        },
      });
      return this.toDomain(raw);
    });
  }

  async findById(id: string): Promise<Submission | null> {
    const raw = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        assignment: { select: { id: true, title: true, courseId: true, environment: true, gradingVersion: true, functionalMaxScore: true, algorithmMaxScore: true, cleanCodeMaxScore: true } },
        team: { select: { id: true, name: true, projectTitle: true } },
        participants: { include: { user: { select: { id: true, fullName: true, email: true } } } },
        gitContributors: true,
      },
    });

    return raw ? this.toDomain(raw) : null;
  }

  async findWithJobStatus(id: string): Promise<any | null> {
    const raw = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        assignment: { select: { id: true, title: true, courseId: true, environment: true, gradingVersion: true, functionalMaxScore: true, algorithmMaxScore: true, cleanCodeMaxScore: true } },
        team: { select: { id: true, name: true, projectTitle: true } },
        participants: { include: { user: { select: { id: true, fullName: true, email: true } } } },
        gitContributors: true,
        gradingJob: {
          select: {
            id: true,
            status: true,
            priority: true,
            queuedAt: true,
            sandboxStartedAt: true,
            sandboxEndedAt: true,
            aiStartedAt: true,
            aiEndedAt: true,
          },
        },
        testResults: {
          include: { testCase: true },
        },
        aiGradingResult: true,
      },
    });

    if (!raw) return null;

    const domain = this.toDomain(raw);
    return {
      ...domain.toJSON(),
      gradingJob: raw.gradingJob,
      testResults: raw.testResults,
      aiGradingResult: raw.aiGradingResult,
    };
  }

  private async assertHistoryAccess(
    submissionId: string,
    requestingUserId: string,
    requestingUserRole: string
  ): Promise<{ id: string; userId: string; participants: Array<{ userId: string }>; courseId: string; lecturerId: string }> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        userId: true,
        participants: { select: { userId: true } },
        assignment: { select: { courseId: true, course: { select: { lecturerId: true } } } },
      },
    });
    if (!submission) throw new NotFoundError(`Bài nộp với ID: ${submissionId}`);
    const isStaff = requestingUserRole === 'ADMIN'
      || (requestingUserRole === 'LECTURER' && submission.assignment.course.lecturerId === requestingUserId);
    const isOwner = submission.userId === requestingUserId
      || submission.participants.some((participant) => participant.userId === requestingUserId);
    if (!isStaff && !(requestingUserRole === 'STUDENT' && isOwner)) {
      throw new ForbiddenError('Bạn không có quyền xem lịch sử chấm bài này.');
    }
    return { ...submission, courseId: submission.assignment.courseId, lecturerId: submission.assignment.course.lecturerId };
  }

  private toStudentSafeGradingError(message: string | null): string | null {
    if (!message) return null;
    const normalized = message.toLowerCase();
    if (/private|repository|git|authentication|permission denied/.test(normalized)) {
      return 'Không truy cập được repository GitHub để lấy mã nguồn. Kiểm tra quyền truy cập hoặc gửi lại bài.';
    }
    if (/deploy|playwright|browser|navigation|http status|url/.test(normalized)) {
      return 'Không truy cập được website triển khai để chạy kiểm thử. Kiểm tra URL deploy và gửi lại bài.';
    }
    if (/docker|sandbox|container/.test(normalized)) {
      return 'Sandbox cách ly chưa sẵn sàng. Bài chưa được chấm và không bị tính 0 điểm.';
    }
    return 'Có lỗi khi thực hiện bước chấm. Bài chưa được tính điểm; vui lòng liên hệ giảng viên.';
  }

  async getGradingHistory(submissionId: string, requestingUserId: string, requestingUserRole: string): Promise<unknown[]> {
    await this.assertHistoryAccess(submissionId, requestingUserId, requestingUserRole);
    const runs = await this.prisma.gradingRun.findMany({
      where: { submissionId },
      orderBy: { runNo: 'desc' },
      include: { stages: { orderBy: { createdAt: 'asc' }, include: { evidence: { orderBy: { createdAt: 'asc' } } } } },
    });
    if (requestingUserRole !== 'STUDENT') return runs;
    return runs.map((run) => {
      if (run.status !== 'PUBLISHED') {
        return {
          id: run.id, runNo: run.runNo, status: run.status, createdAt: run.createdAt,
          startedAt: run.startedAt, completedAt: run.completedAt,
          stages: run.stages.map((stage) => ({
            id: stage.id, stageKey: stage.stageKey, status: stage.status, startedAt: stage.startedAt, completedAt: stage.completedAt,
            errorMessage: run.status === 'FAILED' ? this.toStudentSafeGradingError(stage.errorMessage) : null,
          })),
        };
      }
      const snapshot = run.snapshotJson as Record<string, unknown>;
      const { referenceSolution: _referenceSolution, ...safeSnapshot } = snapshot;
      return {
        id: run.id, runNo: run.runNo, status: run.status, summaryJson: run.summaryJson, createdAt: run.createdAt,
        startedAt: run.startedAt, completedAt: run.completedAt, reviewedAt: run.reviewedAt, reviewNote: run.reviewNote,
        snapshotJson: { assignment: safeSnapshot.assignment },
        stages: run.stages.map((stage) => {
          const snapshotCases = Array.isArray(snapshot.testCases) ? snapshot.testCases as Array<Record<string, unknown>> : [];
          const hiddenIds = new Set(snapshotCases.filter((testCase) => testCase.isHidden === true).map((testCase) => String(testCase.id)));
          const rawDetails = stage.detailsJson && typeof stage.detailsJson === 'object' ? stage.detailsJson as Record<string, unknown> : {};
          const results = Array.isArray(rawDetails.results) ? rawDetails.results.map((entry) => {
            const result = entry as Record<string, unknown>;
            if (!hiddenIds.has(String(result.testCaseId))) return result;
            const { expectedOutput: _expectedOutput, inputData: _inputData, actualOutput: _actualOutput, errorMessage: _errorMessage, ...safeResult } = result;
            return { ...safeResult, isHidden: true };
          }) : undefined;
          return {
            id: stage.id, stageKey: stage.stageKey, status: stage.status, score: stage.score, maxScore: stage.maxScore,
            detailsJson: (() => {
              const { testCases: _testCases, ...safeDetails } = rawDetails;
              return { ...safeDetails, ...(results ? { results } : {}) };
            })(), errorMessage: stage.errorMessage,
            startedAt: stage.startedAt, completedAt: stage.completedAt,
            evidence: stage.evidence.filter((item) => !item.testCaseId || !hiddenIds.has(item.testCaseId)).map(({ storagePath: _storagePath, ...item }) => item),
          };
        }),
      };
    });
  }

  async getGradingEvidence(
    submissionId: string,
    runId: string,
    evidenceId: string,
    requestingUserId: string,
    requestingUserRole: string
  ): Promise<{ path: string; mimeType: string } | null> {
    await this.assertHistoryAccess(submissionId, requestingUserId, requestingUserRole);
    const evidence = await this.prisma.gradingEvidence.findFirst({
      where: { id: evidenceId, stage: { gradingRunId: runId, gradingRun: { submissionId } } },
      select: { storagePath: true, mimeType: true, testCaseId: true, stage: { select: { gradingRun: { select: { status: true, snapshotJson: true } } } } },
    });
    if (!evidence) return null;
    if (requestingUserRole === 'STUDENT') {
      if (evidence.stage.gradingRun.status !== 'PUBLISHED') throw new ForbiddenError('Điểm chưa được công bố.');
      const snapshot = evidence.stage.gradingRun.snapshotJson as { testCases?: Array<{ id: string; isHidden: boolean }> };
      if (snapshot.testCases?.some((testCase) => testCase.id === evidence.testCaseId && testCase.isHidden)) {
        throw new ForbiddenError('Bằng chứng testcase ẩn không được công bố.');
      }
    }
    return { path: evidence.storagePath, mimeType: evidence.mimeType };
  }

  async reviewGradingRun(
    runId: string,
    requestingUserId: string,
    requestingUserRole: string,
    finalScore: number | undefined,
    reviewNote: string
  ): Promise<unknown> {
    const run = await this.prisma.gradingRun.findUnique({
      where: { id: runId },
      include: { submission: { include: { assignment: { include: { course: { select: { lecturerId: true } } } } } } },
    });
    if (!run) throw new NotFoundError('Lượt chấm');
    if (requestingUserRole !== 'ADMIN'
      && !(requestingUserRole === 'LECTURER' && run.submission.assignment.course.lecturerId === requestingUserId)) {
      throw new ForbiddenError('Chỉ giảng viên phụ trách hoặc admin mới được duyệt điểm.');
    }
    if (run.status !== 'REVIEW_PENDING') throw new ValidationError('Lượt chấm này không còn chờ duyệt.');
    if (!reviewNote.trim()) throw new ValidationError('Ghi lý do duyệt điểm trước khi công bố.');
    if (finalScore !== undefined && (!Number.isFinite(finalScore) || finalScore < 0 || finalScore > 10)) {
      throw new ValidationError('Điểm công bố phải nằm trong khoảng 0 đến 10.');
    }
    const summary = run.summaryJson && typeof run.summaryJson === 'object' ? run.summaryJson as Record<string, unknown> : {};
    const score = finalScore ?? Number(summary.suggestedFinalScore ?? 0);
    return this.prisma.$transaction(async (transaction) => {
      const [updatedRun, updatedSubmission] = await Promise.all([
        transaction.gradingRun.update({ where: { id: runId }, data: {
          status: 'PUBLISHED', reviewedById: requestingUserId, reviewedAt: new Date(), reviewNote,
          summaryJson: { ...summary, publishedFinalScore: score, scoreAdjusted: finalScore !== undefined } as Prisma.InputJsonValue,
        } }),
        transaction.submission.update({ where: { id: run.submissionId }, data: { status: 'GRADED', finalScore: score, gradedAt: new Date() } }),
      ]);
      return { run: updatedRun, submission: updatedSubmission };
    });
  }

  async findByAssignmentAndUser(assignmentId: string, userId: string): Promise<Submission[]> {
    const rawList = await this.prisma.submission.findMany({
      where: { assignmentId, userId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return rawList.map((r: any) => this.toDomain(r));
  }

  async findLatestByAssignmentAndUser(assignmentId: string, userId: string): Promise<Submission | null> {
    const raw = await this.prisma.submission.findFirst({
      where: { assignmentId, userId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        assignment: { select: { id: true, title: true, courseId: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return raw ? this.toDomain(raw) : null;
  }

  async findLatestByAssignmentAndTeam(assignmentId: string, teamId: string): Promise<Submission | null> {
    const raw = await this.prisma.submission.findFirst({
      where: { assignmentId, teamId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        assignment: { select: { id: true, title: true, courseId: true, environment: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findLatestByUser(userId: string): Promise<Submission | null> {
    const raw = await this.prisma.submission.findFirst({
      where: { userId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        assignment: { select: { id: true, title: true, courseId: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return raw ? this.toDomain(raw) : null;
  }

  async findByAssignmentId(assignmentId: string): Promise<any[]> {
    const rawList = await this.prisma.submission.findMany({
      where: { assignmentId },
      include: {
        user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        assignment: { select: { id: true, title: true, courseId: true, environment: true, gradingVersion: true, functionalMaxScore: true, algorithmMaxScore: true, cleanCodeMaxScore: true } },
        team: { select: { id: true, name: true, projectTitle: true } },
        participants: { include: { user: { select: { id: true, fullName: true, email: true } } } },
        gitContributors: true,
        gradingJob: {
          select: {
            id: true,
            status: true,
            queuedAt: true,
            sandboxStartedAt: true,
            sandboxEndedAt: true,
            aiStartedAt: true,
            aiEndedAt: true,
          },
        },
        testResults: {
          select: {
            id: true,
            testCaseId: true,
            verdict: true,
            earnedPoints: true,
            executionTimeMs: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return rawList.map((r: any) => ({
      ...this.toDomain(r).toJSON(),
      user: r.user,
      gradingJob: r.gradingJob,
      testResults: r.testResults,
    }));
  }

  async updateStatus(id: string, status: SubmissionStatus): Promise<Submission> {
    const raw = await this.prisma.submission.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        assignment: { select: { id: true, title: true, courseId: true } },
      },
    });

    return this.toDomain(raw);
  }

  async updateZipFilePath(id: string, zipFilePath: string): Promise<Submission> {
    const raw = await this.prisma.submission.update({
      where: { id },
      data: { zipFilePath },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        assignment: { select: { id: true, title: true, courseId: true } },
      },
    });

    return this.toDomain(raw);
  }

  async updateWorkspacePath(id: string, workspacePath: string): Promise<Submission> {
    const raw = await this.prisma.submission.update({
      where: { id },
      data: { workspacePath },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        assignment: { select: { id: true, title: true, courseId: true, environment: true } },
      },
    });
    return this.toDomain(raw);
  }

  async updateSourceSnapshot(id: string, sourceSnapshotPath: string, sourceSnapshotHash: string): Promise<void> {
    await this.prisma.submission.update({
      where: { id },
      data: { sourceSnapshotPath, sourceSnapshotHash },
    });
  }

  async findSourceSnapshot(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      select: {
        sourceSnapshotPath: true,
        sourceSnapshotHash: true,
        assignmentId: true,
        assignment: { select: { courseId: true, maxFileSizeBytes: true } },
      },
    });
    if (!submission?.sourceSnapshotPath) return null;
    return {
      path: submission.sourceSnapshotPath,
      sha256: submission.sourceSnapshotHash,
      assignmentId: submission.assignmentId,
      courseId: submission.assignment.courseId,
      maxFileSizeBytes: submission.assignment.maxFileSizeBytes,
    };
  }

  async updateAiGradingScores(
    id: string,
    data: {
      aiScore: number;
      algorithmScore?: number | null;
      cleanCodeScore?: number | null;
    }
  ): Promise<Submission> {
    const raw = await this.prisma.submission.update({
      where: { id },
      data: {
        aiScore: data.aiScore,
        algorithmScore: data.algorithmScore,
        cleanCodeScore: data.cleanCodeScore,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        assignment: { select: { id: true, title: true, courseId: true, gradingVersion: true, functionalMaxScore: true, algorithmMaxScore: true, cleanCodeMaxScore: true } },
      },
    });

    return this.toDomain(raw);
  }

  async updateGitMetadata(
    id: string,
    data: {
      commitCount?: number;
      locChurn?: number;
      gitCommitHash?: string;
      contributors?: Array<{
        authorName: string;
        authorEmail: string;
        commitCount: number;
        linesAdded: number;
        linesDeleted: number;
        contributionPct: number;
        matchedUserId?: string | null;
        activeDays: number;
        firstCommitAt?: Date | null;
        lastCommitAt?: Date | null;
      }>;
    }
  ): Promise<Submission> {
    const raw = await this.prisma.$transaction(async (transaction) => {
      if (data.contributors) {
        await transaction.gitContributor.deleteMany({ where: { submissionId: id } });
        if (data.contributors.length > 0) {
          await transaction.gitContributor.createMany({
            data: data.contributors.map((contributor) => ({
              submissionId: id,
              authorName: contributor.authorName,
              authorEmail: contributor.authorEmail,
              commitCount: contributor.commitCount,
              linesAdded: contributor.linesAdded,
              linesDeleted: contributor.linesDeleted,
              contributionPct: contributor.contributionPct,
              matchedUserId: contributor.matchedUserId ?? null,
              activeDays: contributor.activeDays,
              firstCommitAt: contributor.firstCommitAt ?? null,
              lastCommitAt: contributor.lastCommitAt ?? null,
            })),
          });
        }
      }
      return transaction.submission.update({
        where: { id },
        data: {
          ...(data.commitCount !== undefined ? { commitCount: data.commitCount } : {}),
          ...(data.locChurn !== undefined ? { locChurn: data.locChurn } : {}),
          ...(data.gitCommitHash ? { gitCommitHash: data.gitCommitHash } : {}),
        },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          assignment: { select: { id: true, title: true, courseId: true } },
          gitContributors: true,
        },
      });
    });

    return this.toDomain(raw);
  }

  async adjustParticipantScore(
    submissionId: string,
    userId: string,
    data: { adjustedScore: number | null; reason: string; adjustedById: string }
  ): Promise<unknown> {
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.submissionParticipant.findUniqueOrThrow({
        where: { uk_submission_participant: { submissionId, userId } },
        select: { id: true, adjustedScore: true },
      });
      await transaction.participantScoreAdjustment.create({
        data: {
          submissionParticipantId: current.id,
          previousScore: current.adjustedScore,
          adjustedScore: data.adjustedScore,
          reason: data.reason,
          adjustedById: data.adjustedById,
        },
      });
      return transaction.submissionParticipant.update({
        where: { id: current.id },
        data: {
          adjustedScore: data.adjustedScore,
          adjustmentReason: data.reason,
          adjustedById: data.adjustedById,
          adjustedAt: new Date(),
        },
        include: { user: { select: { id: true, fullName: true, email: true } } },
      });
    });
  }

  async findAll(query?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    assignmentId?: string;
  }): Promise<{ submissions: any[]; total: number }> {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query?.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query?.assignmentId) {
      where.assignmentId = query.assignmentId;
    }
    if (query?.search) {
      const q = query.search.trim();
      where.OR = [
        { user: { fullName: { contains: q } } },
        { user: { email: { contains: q } } },
        { paperCode: { contains: q } },
        { assignment: { title: { contains: q } } },
      ];
    }

    const [total, rawList] = await Promise.all([
      this.prisma.submission.count({ where }),
      this.prisma.submission.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          assignment: {
            select: {
              id: true,
              title: true,
              courseId: true,
              course: { select: { id: true, code: true, name: true } },
            },
          },
          testResults: {
            select: {
              id: true,
              testCaseId: true,
              verdict: true,
              earnedPoints: true,
              executionTimeMs: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const submissions = rawList.map((r: any) => ({
      ...this.toDomain(r).toJSON(),
      user: r.user,
      assignment: r.assignment,
      testResults: r.testResults,
    }));

    return { submissions, total };
  }
}


