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
  liveSessions?: Array<{
    code: string;
    subject: string;
    room: string;
    proctor: string;
    badge: string;
    badgeTone: 'warning' | 'student' | 'neutral';
    progressLabel: string;
    progressValue: string;
    percent: number;
    barColor: string;
  }>;
  opsEvents?: Array<{
    time: string;
    level: 'Warning' | 'Info' | 'Success' | 'Proctor Alert';
    subsystem: string;
    message: string;
    status: string;
    action: string;
  }>;
  hourlyThroughput?: {
    labels: string[];
    submissions: number[];
    aiCalls: number[];
  };
  roomClusterLoad?: Array<{
    label: string;
    value: number;
    secondaryValue: number;
    subLabel: string;
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
