export type ExamSessionStatus = 'LIVE' | 'UPCOMING' | 'PAUSED' | 'COMPLETED';

export interface ExamSession {
  id: string;
  assignmentId: string;
  title: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  semester: string;
  status: ExamSessionStatus;
  assignmentStatus: 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';
  startTime: string;
  deadline: string;
  durationMinutes: number | null;
  pausedAt: string | null;
  secondsLeft: number | null;
  enrolledStudents: number;
  unlockedStudents: number;
  submittedStudents: number;
}

export interface ExamSessionSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string | null;
  status: string;
  submittedAt: string;
  score: number | null;
  compileOutput?: string | null;
}

export interface ExamSessionStudentAccess {
  studentId: string;
  studentName: string;
  studentCode: string | null;
  unlockedAt: string;
}

export type RoomStudentStatus = 'NOT_JOINED' | 'IN_ROOM' | 'SUBMITTED' | 'EXPIRED_ZERO';

export interface RosterSubmissionDetail {
  id: string;
  status: string;
  submittedAt: string;
  sandboxScore: number | null;
  aiScore: number | null;
  finalScore: number | null;
  compileSuccess: boolean | null;
  compileOutput: string | null;
  passedTestCases: number;
  totalTestCases: number;
}

export interface ExamSessionRosterStudent {
  studentId: string;
  studentName: string;
  studentCode: string | null;
  email: string;
  avatarUrl: string | null;
  unlockedAt: string | null;
  roomStatus: RoomStudentStatus;
  submission: RosterSubmissionDetail | null;
}

export interface SourceCodeFile {
  name: string;
  path: string;
  content: string;
  size: number;
}

export interface ProctoringRoomDetailData {
  session: ExamSession;
  submissions: ExamSessionSubmission[];
  unlockedStudents: ExamSessionStudentAccess[];
  roster?: ExamSessionRosterStudent[];
  testCases?: Array<{ id: string; label: string; points: number }>;
}
