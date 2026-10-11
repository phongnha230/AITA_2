import api from '../../../lib/api';

export interface AdminDashboardData {
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
    submittedAt: string;
    status: string;
    sandboxScore: number;
    aiScore: number;
    finalScore: number;
  }>;
}

export const adminDashboardService = {
  async getDashboard(): Promise<AdminDashboardData | null> {
    try {
      const res = await api.get('/users/admin-dashboard');
      return res.data?.data ?? null;
    } catch (error) {
      console.warn('[AdminDashboardService] Backend /users/admin-dashboard unreachable, using fallback demo telemetry:', error);
      return null;
    }
  },
};
