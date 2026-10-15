import { PrismaClient } from '@prisma/client';
import {
  ISubmissionRepository,
  CreateSubmissionData,
} from '../../domain/repositories/submission.repository.interface.js';
import { Submission, SubmissionStatus } from '../../domain/entities/submission.entity.js';

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


