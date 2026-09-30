import { Submission, SubmissionChannel, SubmissionStatus } from '../entities/submission.entity.js';

export interface CreateSubmissionData {
  assignmentId: string;
  userId: string;
  groupLabel?: string | null;
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
  updateStatus(id: string, status: SubmissionStatus): Promise<Submission>;
  updateZipFilePath(id: string, zipFilePath: string): Promise<Submission>;
}
