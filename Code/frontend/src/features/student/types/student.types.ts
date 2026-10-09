export type StudentRole = 'ADMIN' | 'LECTURER' | 'STUDENT';
export type StudentAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_ACTIVATION';

export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: StudentRole;
  status: StudentAccountStatus;
}

export interface StudentProfileUpdate {
  fullName?: string;
  avatarUrl?: string | null;
}

export interface StudentCourse {
  id: string;
  code: string;
  name: string;
  semester: string;
  lecturerId: string;
  isActive: boolean;
  isEnrolled?: boolean;
  enrollmentCount?: number;
  assignmentCount?: number;
  lecturer?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export type AssignmentEnvironment = 'C_GCC' | 'JAVA_JDK';
export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export interface StudentAssignment {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  environment: AssignmentEnvironment;
  submissionType: 'INDIVIDUAL' | 'GROUP';
  startTime: string;
  deadline: string;
  allowGitSubmission: boolean;
  allowZipSubmission: boolean;
  status: AssignmentStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type StudentExamTemporalStatus = 'UPCOMING' | 'OPEN' | 'ENDED' | 'UNKNOWN';

export interface StudentExamViewModel {
  assignment: StudentAssignment;
  course: StudentCourse | null;
  temporalStatus: StudentExamTemporalStatus;
}

export interface CourseJoinResult {
  alreadyEnrolled: boolean;
  message: string;
  course: StudentCourse;
}

export interface SandboxStatus {
  status: string;
  useDockerSandboxConfig: boolean;
  dockerDaemonRunning: boolean;
  activeMode: string;
  localJavaVersion: string;
  supportedLanguages: string[];
}

export type ResourceStatus = 'loading' | 'success' | 'error';

export interface ResourceState<T> {
  status: ResourceStatus;
  data: T;
  error: string | null;
}

export type GradingJobStatus =
  | 'QUEUED'
  | 'PREPROCESSING'
  | 'RUNNING_SANDBOX'
  | 'RUNNING_AI'
  | 'RETRYING'
  | 'COMPLETED'
  | 'FAILED';

export interface GradingJobInfo {
  id: string;
  submissionId: string;
  bullmqJobId?: string | null;
  priority?: number;
  status: GradingJobStatus;
  retryCount?: number;
  queuedAt: string;
  sandboxStartedAt?: string | null;
  sandboxEndedAt?: string | null;
  aiStartedAt?: string | null;
  aiEndedAt?: string | null;
  errorStage?: string | null;
  systemLogs?: string | null;
  queueState?: string | null;
  progress?: unknown;
}

export interface SubmissionTestResult {
  id: string;
  submissionId: string;
  testCaseId: string;
  verdict: string;
  executionTimeMs: number;
  memoryUsedKb: number;
  actualStdout?: string | null;
  actualFileOutput?: string | null;
  exitCode: number;
  earnedPoints: number | string;
  diffLog?: string | null;
  createdAt: string;
}

export interface SubmissionAiGradingResult {
  id: string;
  submissionId: string;
  overallAiScore: number | string;
  rubricBreakdownJson: unknown;
  detectedTimeComplexity?: string | null;
  detectedSpaceComplexity?: string | null;
  codeQualityFeedback: string;
  tokensConsumed?: number;
  evaluatedAt: string;
}

export interface StudentSubmissionDetail {
  id: string;
  assignmentId: string;
  userId: string;
  groupLabel?: string | null;
  submissionChannel: string;
  zipFilePath?: string | null;
  zipFileSize?: number | null;
  gitRepoUrl?: string | null;
  gitCommitHash?: string | null;
  status: string;
  sandboxScore?: number | null;
  aiScore?: number | null;
  finalScore?: number | null;
  compileSuccess?: boolean | null;
  compileOutput?: string | null;
  submittedAt: string;
  gradedAt?: string | null;
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
  gradingJob?: GradingJobInfo | null;
  testResults?: SubmissionTestResult[];
  aiGradingResult?: SubmissionAiGradingResult | null;
}

export interface RecentSubmissionItem {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseCode: string;
  courseName: string;
  environment: string;
  paperCode?: string | null;
  submissionChannel: string;
  submittedAt: string;
  status: string;
  sandboxScore: number;
  aiScore: number;
  finalScore: number;
}

export interface StudentPortfolioData {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
    status: string;
    createdAt: string;
    lastLoginAt?: string | null;
  };
  academicStats: {
    totalCourses: number;
    totalAssignments: number;
    submittedAssignments: number;
    completionRate: number;
    averageScore: number;
    highestScore: number;
    passedCount: number;
    failedCount: number;
  };
  enrolledCourses: Array<{
    id: string;
    code: string;
    name: string;
    semester: string;
    lecturer: {
      id: string;
      fullName: string;
      email: string;
    };
    enrolledAt: string;
    totalAssignments: number;
    submittedAssignments: number;
    averageScore: number;
  }>;
  recentSubmissions: RecentSubmissionItem[];
  skillsBreakdown: Array<{
    environment: string;
    submissionCount: number;
    averageScore: number;
  }>;
  aiTutorStats?: {
    totalConversations: number;
    totalMessages: number;
    lastInteractionAt?: string | null;
  };
}

export interface AssignmentTestCase {
  id: string;
  assignmentId: string;
  inputData: string;
  expectedOutput: string;
  isSample: boolean;
  scoreWeight: number;
  timeLimitMs: number;
  memoryLimitMb: number;
}

export interface AssignmentRubric {
  id: string;
  assignmentId: string;
  criteriaName: string;
  description?: string | null;
  maxPoints: number;
}

