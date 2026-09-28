export type SubmissionType = 'ZIP_FILE' | 'GIT_REPO';
export type SubmissionStatus = 'PENDING' | 'PROCESSING' | 'GRADED' | 'FAILED';

export interface SubmissionEntity {
  id: string;
  assignmentId: string;
  studentId: string;
  teamId: string | null;
  submissionType: SubmissionType;
  fileUrl: string | null;
  stagedPath: string | null;
  gitCommitHash: string | null;
  sandboxScore: number | null;
  aiScore: number | null;
  totalScore: number | null;
  status: SubmissionStatus;
  submittedAt: Date;
}

export interface CreateSubmissionProps {
  assignmentId: string;
  studentId: string;
  teamId?: string | null;
  submissionType: SubmissionType;
  fileUrl?: string | null;
  stagedPath?: string | null;
  gitCommitHash?: string | null;
}
