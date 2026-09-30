export type AssignmentEnv = 'C_GCC' | 'JAVA_JDK';
export type SubmissionType = 'INDIVIDUAL' | 'GROUP';
export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export interface AssignmentProps {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  environment: AssignmentEnv;
  submissionType: SubmissionType;
  startTime: Date;
  deadline: Date;
  maxFileSizeBytes: bigint;
  allowGitSubmission: boolean;
  allowZipSubmission: boolean;
  status: AssignmentStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Assignment {
  constructor(private readonly props: AssignmentProps) {}

  get id(): string {
    return this.props.id;
  }

  get courseId(): string {
    return this.props.courseId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get environment(): AssignmentEnv {
    return this.props.environment;
  }

  get submissionType(): SubmissionType {
    return this.props.submissionType;
  }

  get startTime(): Date {
    return this.props.startTime;
  }

  get deadline(): Date {
    return this.props.deadline;
  }

  get status(): AssignmentStatus {
    return this.props.status;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public isPublished(): boolean {
    return this.props.status === 'PUBLISHED';
  }

  public isClosed(): boolean {
    return this.props.status === 'CLOSED' || new Date() > this.props.deadline;
  }

  toJSON() {
    return {
      id: this.props.id,
      courseId: this.props.courseId,
      title: this.props.title,
      description: this.props.description,
      environment: this.props.environment,
      submissionType: this.props.submissionType,
      startTime: this.props.startTime,
      deadline: this.props.deadline,
      allowGitSubmission: this.props.allowGitSubmission,
      allowZipSubmission: this.props.allowZipSubmission,
      status: this.props.status,
      createdBy: this.props.createdBy,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
