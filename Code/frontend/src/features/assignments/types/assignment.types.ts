export type AssignmentEnv = 'C_GCC' | 'JAVA_JDK';
export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
export type RationaleTag = 'FUNCTIONAL' | 'BOUNDARY' | 'EDGE' | 'PERFORMANCE' | 'SECURITY';
export type ComparisonMode = 'STDIO' | 'FILE_TO_FILE';

export interface TestCase {
  id?: string;
  assignmentId?: string;
  orderIndex: number;
  label: string;
  rationaleTag: RationaleTag;
  isHidden: boolean;
  timeLimitMs: number;
  memoryLimitKb: number;
  points: number;
  comparisonMode: ComparisonMode;
  stdinInput?: string | null;
  expectedStdout?: string | null;
  inputFileName?: string | null;
  inputFileContent?: string | null;
  expectedFileName?: string | null;
  expectedFileContent?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentSolution {
  id?: string;
  assignmentId?: string;
  title: string;
  sourceCode: string;
  explanation?: string;
  isActive?: boolean;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  lecturerId?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  environment: AssignmentEnv;
  submissionType: 'INDIVIDUAL' | 'GROUP';
  startTime: string;
  deadline: string;
  maxFileSizeBytes?: number;
  allowGitSubmission: boolean;
  allowZipSubmission: boolean;
  pdfFilePath?: string;
  starterCodePath?: string;
  status: AssignmentStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  course?: Course;
  testCases?: TestCase[];
  solutions?: AssignmentSolution[];
  _count?: {
    submissions: number;
    testCases: number;
    rubricRules?: number;
  };
}

export interface CreateAssignmentPayload {
  courseId: string;
  title: string;
  description?: string;
  environment: AssignmentEnv;
  submissionType?: 'INDIVIDUAL' | 'GROUP';
  startTime?: string;
  deadline: string;
  status?: AssignmentStatus;
  allowGitSubmission?: boolean;
  allowZipSubmission?: boolean;
  pdfFilePath?: string;
  starterCodePath?: string;
}

export interface LecturerSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  groupLabel?: string | null;
  paperCode?: string | null;
  submissionChannel: 'ZIP_UPLOAD' | 'GIT_COMMIT';
  zipFilePath?: string | null;
  zipFileSize?: number | null;
  gitRepoUrl?: string | null;
  gitCommitHash?: string | null;
  status: 'PENDING' | 'QUEUED' | 'RUNNING_SANDBOX' | 'RUNNING_AI' | 'GRADED' | 'FAILED';
  sandboxScore?: number | null;
  aiScore?: number | null;
  finalScore?: number | null;
  compileSuccess?: boolean | null;
  compileOutput?: string | null;
  submittedAt: string;
  gradedAt?: string | null;
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  };
  gradingJob?: {
    id: string;
    status: string;
    queuedAt: string;
    sandboxStartedAt?: string | null;
    sandboxEndedAt?: string | null;
    aiStartedAt?: string | null;
    aiEndedAt?: string | null;
  } | null;
  testResults?: Array<{
    id: string;
    testCaseId: string;
    verdict: string;
    earnedPoints: number;
    executionTimeMs: number;
  }>;
}
