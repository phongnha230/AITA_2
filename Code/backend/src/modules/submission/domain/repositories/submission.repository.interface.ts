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
  deployedUrl?: string | null;
  workspacePath?: string | null;
  teamId?: string | null;
  participants?: Array<{ userId: string; teamRole: string }>;
}

export interface ISubmissionRepository {
  create(data: CreateSubmissionData): Promise<Submission>;
  findById(id: string): Promise<Submission | null>;
  findWithJobStatus(id: string): Promise<any | null>;
  findByAssignmentAndUser(assignmentId: string, userId: string): Promise<Submission[]>;
  findLatestByAssignmentAndUser(assignmentId: string, userId: string): Promise<Submission | null>;
  findLatestByAssignmentAndTeam(assignmentId: string, teamId: string): Promise<Submission | null>;
  findLatestByUser(userId: string): Promise<Submission | null>;
  findByAssignmentId(assignmentId: string): Promise<any[]>;
  updateStatus(id: string, status: SubmissionStatus): Promise<Submission>;
  updateZipFilePath(id: string, zipFilePath: string): Promise<Submission>;
  updateWorkspacePath(id: string, workspacePath: string): Promise<Submission>;
  updateAiGradingScores(
    id: string,
    data: {
      aiScore: number;
      algorithmScore?: number | null;
      cleanCodeScore?: number | null;
    }
  ): Promise<Submission>;
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
        matchedUserId?: string | null;
        activeDays: number;
        firstCommitAt?: Date | null;
        lastCommitAt?: Date | null;
      }>;
    }
  ): Promise<Submission>;
  adjustParticipantScore(
    submissionId: string,
    userId: string,
    data: {
      adjustedScore: number | null;
      reason: string;
      adjustedById: string;
    }
  ): Promise<unknown>;
  findAll(query?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    assignmentId?: string;
  }): Promise<{ submissions: any[]; total: number }>;
}
