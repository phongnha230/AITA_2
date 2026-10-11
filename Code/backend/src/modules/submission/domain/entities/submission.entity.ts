export type SubmissionChannel = 'ZIP_UPLOAD' | 'GIT_COMMIT';
export type SubmissionStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'RUNNING_SANDBOX'
  | 'RUNNING_AI'
  | 'GRADED'
  | 'FAILED';


export interface SubmissionProps {
  id: string;
  assignmentId: string;
  userId: string;
  groupLabel?: string | null;
  paperCode?: string | null;
  submissionChannel: SubmissionChannel;
  zipFilePath?: string | null;
  zipFileSize?: bigint | number | null;
  gitRepoUrl?: string | null;
  gitCommitHash?: string | null;
  status: SubmissionStatus;
  sandboxScore?: number | null;
  aiScore?: number | null;
  finalScore?: number | null;
  compileSuccess?: boolean | null;
  compileOutput?: string | null;
  submittedAt: Date;
  gradedAt?: Date | null;
  locChurn?: number | null;
  commitCount?: number | null;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  assignment?: {
    id: string;
    title: string;
    courseId: string;
  };
}

export class Submission {
  constructor(private readonly props: SubmissionProps) {}

  get id(): string {
    return this.props.id;
  }

  get assignmentId(): string {
    return this.props.assignmentId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get groupLabel(): string | null | undefined {
    return this.props.groupLabel;
  }

  get paperCode(): string | null | undefined {
    return this.props.paperCode;
  }

  get submissionChannel(): SubmissionChannel {
    return this.props.submissionChannel;
  }

  get zipFilePath(): string | null | undefined {
    return this.props.zipFilePath;
  }

  get zipFileSize(): bigint | number | null | undefined {
    return this.props.zipFileSize;
  }

  get gitRepoUrl(): string | null | undefined {
    return this.props.gitRepoUrl;
  }

  get gitCommitHash(): string | null | undefined {
    return this.props.gitCommitHash;
  }

  get status(): SubmissionStatus {
    return this.props.status;
  }

  get sandboxScore(): number | null | undefined {
    return this.props.sandboxScore;
  }

  get aiScore(): number | null | undefined {
    return this.props.aiScore;
  }

  get finalScore(): number | null | undefined {
    return this.props.finalScore;
  }

  get compileSuccess(): boolean | null | undefined {
    return this.props.compileSuccess;
  }

  get compileOutput(): string | null | undefined {
    return this.props.compileOutput;
  }

  get submittedAt(): Date {
    return this.props.submittedAt;
  }

  get gradedAt(): Date | null | undefined {
    return this.props.gradedAt;
  }

  get locChurn(): number | null | undefined {
    return this.props.locChurn;
  }

  get commitCount(): number | null | undefined {
    return this.props.commitCount;
  }

  get user() {
    return this.props.user;
  }

  get assignment() {
    return this.props.assignment;
  }

  toJSON() {
    return {
      id: this.props.id,
      assignmentId: this.props.assignmentId,
      userId: this.props.userId,
      groupLabel: this.props.groupLabel,
      paperCode: this.props.paperCode,
      submissionChannel: this.props.submissionChannel,
      zipFilePath: this.props.zipFilePath,
      zipFileSize: this.props.zipFileSize ? Number(this.props.zipFileSize) : null,
      gitRepoUrl: this.props.gitRepoUrl,
      gitCommitHash: this.props.gitCommitHash,
      status: this.props.status,
      sandboxScore:
        this.props.sandboxScore !== null && this.props.sandboxScore !== undefined
          ? Number(this.props.sandboxScore)
          : null,
      aiScore:
        this.props.aiScore !== null && this.props.aiScore !== undefined
          ? Number(this.props.aiScore)
          : null,
      finalScore:
        this.props.finalScore !== null && this.props.finalScore !== undefined
          ? Number(this.props.finalScore)
          : null,
      compileSuccess: this.props.compileSuccess,
      compileOutput: this.props.compileOutput,
      submittedAt: this.props.submittedAt,
      gradedAt: this.props.gradedAt,
      locChurn: this.props.locChurn,
      commitCount: this.props.commitCount,
      user: this.props.user,
      assignment: this.props.assignment,
    };
  }
}
