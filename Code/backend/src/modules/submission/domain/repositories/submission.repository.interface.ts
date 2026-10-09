import { Submission, SubmissionChannel, SubmissionStatus } from '../entities/submission.entity.js';

export interface CreateSubmissionData {
  assignmentId: string;
  userId: string;
  groupLabel?: string | null;
  paperCode?: string | null;
  submissionChannel: SubmissionChannel;
  zipFilePath?: string | null;
  zipFileSize?: bigint | number | null;
  gitRepoUrl?: string | null;
  gitCommitHash?: string | null;
}

export interface ISubmissionRepository {
  create(data: CreateSubmissionData): Promise<Submission>;
  findById(id: string): Promise<Submission | null>;
  findWithJobStatus(id: string): Promise<any | null>;
  findByAssignmentAndUser(assignmentId: string, userId: string): Promise<Submission[]>;
  findByAssignmentId(assignmentId: string): Promise<any[]>;
  updateStatus(id: string, status: SubmissionStatus): Promise<Submission>;
  updateZipFilePath(id: string, zipFilePath: string): Promise<Submission>;
  updateGitMetadata(
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
      }>;
    }
  ): Promise<Submission>;
  findAll(query?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    assignmentId?: string;
  }): Promise<{ submissions: any[]; total: number }>;
}


