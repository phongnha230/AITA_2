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
}

export interface ExamSessionStudentAccess {
  studentId: string;
  studentName: string;
  studentCode: string | null;
  unlockedAt: string;
}
