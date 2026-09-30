import { PrismaClient, Submission as PrismaSubmissionModel } from '@prisma/client';
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
      submissionChannel: raw.submissionChannel,
      zipFilePath: raw.zipFilePath,
      zipFileSize: raw.zipFileSize ? Number(raw.zipFileSize) : null,
      gitRepoUrl: raw.gitRepoUrl,
      gitCommitHash: raw.gitCommitHash,
      status: raw.status,
      sandboxScore: raw.sandboxScore !== null && raw.sandboxScore !== undefined ? Number(raw.sandboxScore) : null,
      aiScore: raw.aiScore !== null && raw.aiScore !== undefined ? Number(raw.aiScore) : null,
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
          }
        : undefined,
    });
  }

  async create(data: CreateSubmissionData): Promise<Submission> {
    const raw = await this.prisma.submission.create({
      data: {
        assignmentId: data.assignmentId,
        userId: data.userId,
        groupLabel: data.groupLabel ?? null,
        submissionChannel: data.submissionChannel,
        zipFilePath: data.zipFilePath ?? null,
        zipFileSize: data.zipFileSize ? BigInt(data.zipFileSize) : null,
        gitRepoUrl: data.gitRepoUrl ?? null,
        gitCommitHash: data.gitCommitHash ?? null,
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        assignment: { select: { id: true, title: true, courseId: true } },
      },
    });

    return this.toDomain(raw);
  }

  async findById(id: string): Promise<Submission | null> {
    const raw = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        assignment: { select: { id: true, title: true, courseId: true } },
      },
    });

    return raw ? this.toDomain(raw) : null;
  }

  async findWithJobStatus(id: string): Promise<any | null> {
    const raw = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        assignment: { select: { id: true, title: true, courseId: true } },
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
        testResults: true,
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

    return rawList.map((r) => this.toDomain(r));
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
}
