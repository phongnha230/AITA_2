import { PrismaClient, Submission as PrismaSubmission } from '@prisma/client';
import prisma from '../database/prisma.client.js';
import {
  ISubmissionRepository,
  SubmissionWithJobStatus,
} from '../../domain/repositories/submission.repository.interface.js';
import { CreateSubmissionProps, SubmissionEntity } from '../../domain/entities/submission.entity.js';

function toEntity(row: PrismaSubmission): SubmissionEntity {
  return {
    id: row.id,
    assignmentId: row.assignmentId,
    studentId: row.studentId,
    teamId: row.teamId,
    submissionType: row.submissionType,
    fileUrl: row.fileUrl,
    stagedPath: row.stagedPath,
    gitCommitHash: row.gitCommitHash,
    sandboxScore: row.sandboxScore === null ? null : Number(row.sandboxScore),
    aiScore: row.aiScore === null ? null : Number(row.aiScore),
    totalScore: row.totalScore === null ? null : Number(row.totalScore),
    status: row.status,
    submittedAt: row.submittedAt,
  };
}

export class SubmissionRepository implements ISubmissionRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  public async create(props: CreateSubmissionProps): Promise<SubmissionEntity> {
    const row = await this.db.submission.create({
      data: {
        assignmentId: props.assignmentId,
        studentId: props.studentId,
        teamId: props.teamId ?? null,
        submissionType: props.submissionType,
        fileUrl: props.fileUrl ?? null,
        stagedPath: props.stagedPath ?? null,
        gitCommitHash: props.gitCommitHash ?? null,
      },
    });

    return toEntity(row);
  }

  public async attachStagedPath(id: string, stagedPath: string): Promise<SubmissionEntity> {
    const row = await this.db.submission.update({
      where: { id },
      data: { stagedPath },
    });

    return toEntity(row);
  }

  public async markFailed(id: string): Promise<SubmissionEntity> {
    const row = await this.db.submission.update({
      where: { id },
      data: { status: 'FAILED' },
    });

    return toEntity(row);
  }

  public async findById(id: string): Promise<SubmissionWithJobStatus | null> {
    const row = await this.db.submission.findUnique({
      where: { id },
      include: { gradingJob: true },
    });

    if (!row) {
      return null;
    }

    return {
      ...toEntity(row),
      gradingJobStatus: row.gradingJob?.status ?? null,
    };
  }
}

export const submissionRepository = new SubmissionRepository();
