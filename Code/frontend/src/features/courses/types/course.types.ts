export interface Lecturer {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Student {
  id: string;
  studentCode?: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: 'STUDENT' | string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | string;
}

export interface CourseEnrollment {
  id?: string;
  courseId: string;
  studentId: string;
  joinedAt: string;
  status?: 'VERIFIED' | 'PENDING';
  student: Student;
}

export interface CourseAssignmentSummary {
  id: string;
  title: string;
  description?: string;
  environment: string;
  submissionType: string;
  startTime?: string | null;
  deadline?: string | null;
  status: string;
  createdAt: string;
  _count?: {
    submissions: number;
    testCases: number;
  };
}

export interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  lecturerId: string;
  isActive: boolean;
  enrollmentCode?: string | null;
  codeExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lecturer?: Lecturer;
  room?: string;
  capacity?: number;
  enrolledStudentsCount?: number;
  syllabusProgress?: number;
  currentGpaAvg?: number;
  _count?: {
    enrollments: number;
    assignments: number;
  };
  enrollments?: CourseEnrollment[];
  assignments?: CourseAssignmentSummary[];
}

export interface CreateCoursePayload {
  code: string;
  name: string;
  semester: string;
  lecturerId?: string;
  capacity?: number;
}

export interface UpdateCoursePayload {
  name?: string;
  semester?: string;
  isActive?: boolean;
}

export interface GenerateJoinCodeResponse {
  courseId: string;
  enrollmentCode: string;
  expiresAt: string;
  expiresInMinutes: number;
  message: string;
}

export interface QueryCoursesParams {
  lecturerId?: string;
  studentId?: string;
  search?: string;
  semester?: string;
}

export interface LecturerKpiMetrics {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  avgCompletionRate: number;
  active24hCount: number;
}

export interface LecturerDashboardRecentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  assignmentId: string;
  assignmentTitle: string;
  courseCode: string;
  courseName: string;
  paperCode?: string | null;
  submittedAt: string;
  status: string;
  sandboxScore: number;
  aiScore: number;
  finalScore: number;
}

export interface LecturerDashboardAssignmentSummary {
  id: string;
  title: string;
  courseCode: string;
  status: string;
  environment: string;
  deadline: string;
  durationMinutes?: number | null;
  hasAccessCode: boolean;
  totalSubmissions: number;
  averageScore: number;
}

export interface LecturerDashboardResponse {
  lecturer: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
    status: string;
    lastLoginAt?: string | null;
  };
  teachingStats: {
    totalCourses: number;
    totalStudents: number;
    totalAssignments: number;
    totalSubmissions: number;
    averageScore: number;
    pendingGradingCount: number;
  };
  coursesOverview: Array<{
    id: string;
    code: string;
    name: string;
    semester: string;
    isActive: boolean;
    enrollmentCode?: string | null;
    codeExpiresAt?: string | null;
    totalStudents: number;
    totalAssignments: number;
    totalSubmissions: number;
    averageScore: number;
  }>;
  recentSubmissions: LecturerDashboardRecentSubmission[];
  assignmentsSummary: LecturerDashboardAssignmentSummary[];
}

