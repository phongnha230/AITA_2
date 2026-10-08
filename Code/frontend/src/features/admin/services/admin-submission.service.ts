import api from '@/lib/api';

export interface AdminSubmissionItem {
  id: string;
  studentName: string;
  studentEmail: string;
  courseCode: string;
  courseName: string;
  assignmentTitle: string;
  paperCode?: string | null;
  submittedAt: string;
  status: string;
  sandboxScore: number;
  aiScore: number;
  finalScore: number;
  submissionChannel?: string;
  gitRepoUrl?: string;
  gitCommitHash?: string;
}

export interface QuerySubmissionsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  assignmentId?: string;
}

export const adminSubmissionService = {
  /**
   * Lấy danh sách toàn bộ bài thi nộp toàn trường (Graceful Fallback)
   */
  async getSubmissions(
    params?: QuerySubmissionsParams
  ): Promise<{ submissions: AdminSubmissionItem[]; total: number }> {
    try {
      const res = await api.get('/submissions', { params });
      const rawList = res.data?.data || [];
      const total = res.data?.meta?.total ?? rawList.length;

      const submissions: AdminSubmissionItem[] = rawList.map((s: any) => ({
        id: s.id,
        studentName: s.user?.fullName || 'Sinh viên',
        studentEmail: s.user?.email || 'N/A',
        courseCode: s.assignment?.course?.code || s.assignment?.courseId || 'SWD392',
        courseName: s.assignment?.course?.name || 'Khóa học',
        assignmentTitle: s.assignment?.title || 'Đề thi PE',
        paperCode: s.paperCode || null,
        submittedAt: s.submittedAt || new Date().toISOString(),
        status: s.status || 'PENDING',
        sandboxScore: typeof s.sandboxScore === 'number' ? s.sandboxScore : Number(s.sandboxScore) || 0,
        aiScore: typeof s.aiScore === 'number' ? s.aiScore : Number(s.aiScore) || 0,
        finalScore: typeof s.finalScore === 'number' ? s.finalScore : Number(s.finalScore) || 0,
        submissionChannel: s.submissionChannel,
        gitRepoUrl: s.gitRepoUrl,
        gitCommitHash: s.gitCommitHash,
      }));

      return { submissions, total };
    } catch (error) {
      console.warn('[AdminSubmissionService] Failed to fetch system submissions, using fallback:', error);
      return { submissions: [], total: 0 };
    }
  },
};
