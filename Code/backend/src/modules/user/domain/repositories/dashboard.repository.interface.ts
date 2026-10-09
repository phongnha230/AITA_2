export interface AdminDashboardResponse {
  kpis: {
    totalUsers: number;
    totalStudents: number;
    totalLecturers: number;
    totalAdmins: number;
    totalCourses: number;
    totalAssignments: number;
    totalSubmissions: number;
    completedSubmissions: number;
    pendingSubmissions: number;
    failedSubmissions: number;
    totalAiKeys: number;
    activeAiKeys: number;
  };
  submissionOutcomes: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  languageDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  recentSubmissions: Array<{
    id: string;
    studentName: string;
    studentEmail: string;
    courseCode: string;
    courseName: string;
    assignmentTitle: string;
    submittedAt: Date;
    status: string;
    sandboxScore: number;
    aiScore: number;
    finalScore: number;
  }>;
}

export interface LecturerDashboardResponse {
  lecturer: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
    status: string;
    lastLoginAt?: Date | null;
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
    codeExpiresAt?: Date | null;
    totalStudents: number;
    totalAssignments: number;
    totalSubmissions: number;
    averageScore: number;
  }>;
  recentSubmissions: Array<{
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    assignmentId: string;
    assignmentTitle: string;
    courseCode: string;
    courseName: string;
    paperCode?: string | null;
    submittedAt: Date;
    status: string;
    sandboxScore: number;
    aiScore: number;
    finalScore: number;
  }>;
  assignmentsSummary: Array<{
    id: string;
    title: string;
    courseCode: string;
    status: string;
    environment: string;
    deadline: Date;
    durationMinutes?: number | null;
    hasAccessCode: boolean;
    totalSubmissions: number;
    averageScore: number;
  }>;
}

export interface StudentPortfolioResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
    status: string;
    createdAt: Date;
    lastLoginAt?: Date | null;
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
    enrolledAt: Date;
    totalAssignments: number;
    submittedAssignments: number;
    averageScore: number;
  }>;
  recentSubmissions: Array<{
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    courseCode: string;
    courseName: string;
    environment: string;
    paperCode?: string | null;
    submissionChannel: string;
    submittedAt: Date;
    status: string;
    sandboxScore: number;
    aiScore: number;
    finalScore: number;
  }>;
  skillsBreakdown: Array<{
    environment: string;
    submissionCount: number;
    averageScore: number;
  }>;
  aiTutorStats: {
    totalConversations: number;
    totalMessagesCount: number;
  };
}

export interface IDashboardRepository {
  getAdminDashboard(): Promise<AdminDashboardResponse>;
  getLecturerDashboard(lecturerId: string): Promise<LecturerDashboardResponse>;
  getStudentPortfolio(studentId: string): Promise<StudentPortfolioResponse>;
}
