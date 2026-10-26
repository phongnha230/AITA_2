export type AssignmentEnv = 'C_GCC' | 'JAVA_JDK' | 'REACT_JS';
export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';
export type AssignmentFlowType = 'PE_EXAM' | 'ASSIGNMENT';
export type RationaleTag = 'FUNCTIONAL' | 'BOUNDARY' | 'EDGE' | 'PERFORMANCE' | 'SECURITY';
export type ComparisonMode = 'STDIO' | 'FILE_TO_FILE';

export type WebTestAction =
  | 'GOTO'
  | 'FILL'
  | 'CLICK'
  | 'SELECT'
  | 'CHECK'
  | 'UNCHECK'
  | 'PRESS_KEY'
  | 'WAIT_FOR'
  | 'WAIT_FOR_TIMEOUT'
  | 'ASSERT_VISIBLE'
  | 'ASSERT_TEXT'
  | 'ASSERT_VALUE'
  | 'ASSERT_URL';

export interface WebTestStep {
  action: WebTestAction;
  target?: string;
  value?: string;
  expected?: string;
  timeoutMs?: number;
}

export interface WebTestScript {
  version: 1;
  steps: WebTestStep[];
}

export interface TestCase {
  id?: string;
  assignmentId?: string;
  orderIndex: number;
  label: string;
  questionNumber?: number | string;
  questionTitle?: string;
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
  expectedTimeComplexity?: string;
  expectedSpaceComplexity?: string;
  acceptedStrategies?: string[];
  algorithmNotes?: string;
  isActive?: boolean;
}

export interface RubricRuleInput {
  criterionName: string;
  description: string;
  maxPoints: number;
  weight: number;
  orderIndex: number;
  criterionType?: 'GENERAL' | 'ALGORITHM' | 'CLEAN_CODE';
}

export interface RubricRule extends RubricRuleInput {
  id: string;
  assignmentId: string;
  createdAt: string;
  updatedAt: string;
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
  hasPdf?: boolean;
  hasStarterCode?: boolean;
  status: AssignmentStatus;
  durationMinutes?: number | null;
  gradingVersion?: number;
  gradingApprovalMode?: 'LECTURER_REVIEW' | 'AUTO_PUBLISH';
  functionalMaxScore?: number;
  algorithmMaxScore?: number;
  cleanCodeMaxScore?: number;
  accessCode?: string | null;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  course?: Course;
  testCases?: TestCase[];
  solutions?: AssignmentSolution[];
  rubricRules?: RubricRule[];
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
  durationMinutes?: number;
  gradingVersion?: number;
  gradingApprovalMode?: 'LECTURER_REVIEW' | 'AUTO_PUBLISH';
  functionalMaxScore?: number;
  algorithmMaxScore?: number;
  cleanCodeMaxScore?: number;
  accessCode?: string | null;
  status?: AssignmentStatus;
  allowGitSubmission?: boolean;
  allowZipSubmission?: boolean;
  pdfFilePath?: string;
  starterCodePath?: string;
}

export interface SaveAssignmentPackagePayload {
  assignment: CreateAssignmentPayload;
  testCases: TestCase[];
  rubricRules: RubricRuleInput[];
  solution?: AssignmentSolution;
  removeSolution?: boolean;
  removePdf?: boolean;
  removeStarter?: boolean;
}

export interface DryRunExecutionSummary {
  success: boolean;
  compileError?: string | null;
  compilerWarnings?: string | null;
  totalTests: number;
  passedTests: number;
  totalScore: number;
  maxScore: number;
  results: Array<{
    testCaseId: string;
    passed: boolean;
    status: string;
    actualOutput: string;
    expectedOutput: string;
    executionTimeMs: number;
    errorMessage?: string | null;
  }>;
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
  deployedUrl?: string | null;
  teamId?: string | null;
  attemptNo?: number;
  status: 'PENDING' | 'QUEUED' | 'RUNNING_SANDBOX' | 'RUNNING_AI' | 'GRADED' | 'FAILED';
  sandboxScore?: number | null;
  aiScore?: number | null;
  algorithmScore?: number | null;
  cleanCodeScore?: number | null;
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
  assignment?: {
    id: string;
    title: string;
    courseId: string;
    environment?: AssignmentEnv;
    gradingVersion?: number;
    functionalMaxScore?: number;
    algorithmMaxScore?: number;
    cleanCodeMaxScore?: number;
  };
  participants?: Array<{
    userId: string;
    teamRole: string;
    adjustedScore?: number | null;
    adjustmentReason?: string | null;
    effectiveScore?: number | null;
    user?: { id: string; fullName: string; email: string };
  }>;
  gitContributors?: Array<{
    id: string;
    authorName: string;
    authorEmail: string;
    commitCount: number;
    linesAdded: number;
    linesDeleted: number;
    contributionPct: number;
    matchedUserId?: string | null;
    activeDays: number;
  }>;
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
