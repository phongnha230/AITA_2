export type RoomStatus = 'LIVE' | 'UPCOMING' | 'COMPLETED';

export type StationStatus = 'working' | 'submitted' | 'compiling' | 'warning';

export interface StudentExamStation {
  id: string;
  pcNumber: string;
  studentName: string;
  studentCode: string;
  initials: string;
  status: StationStatus;
  startTime: string;
  submittedAt?: string;
  score?: number;
  passedCases: number;
  totalCases: number;
  testAttempts: number;
  maxAttempts: number;
  currentProblem: string;
  warningNote?: string;
}

export interface ExamRoom {
  id: string;
  name: string;
  building: string;
  capacity: number;
  courseCode: string;
  courseName: string;
  examTitle: string;
  assignmentId?: string;
  sessionTime: string;
  proctorName: string;
  status: RoomStatus;
  durationSeconds: number;
  secondsLeft: number;
  totalStudents: number;
  submittedStudents: number;
  workingStudents: number;
  averageScore?: number;
  kioskLockEnabled: boolean;
}
