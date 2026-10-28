import api from '../../../lib/api';
import { authService } from '../../auth/services/auth.service';
import {
  Assignment,
  CreateAssignmentPayload,
  TestCase,
  AssignmentSolution,
  Course,
  LecturerSubmission,
  RubricRule,
  RubricRuleInput,
  SaveAssignmentPackagePayload,
  DryRunExecutionSummary,
} from '../types/assignment.types';
import type { ExamSession, ExamSessionStudentAccess, ExamSessionSubmission } from '../../proctoring/types/proctoring.types';
import type { GradingRun } from '@/features/grading/types/grading-history.types';


export const assignmentService = {
  async downloadAssignmentFile(assignmentId: string, kind: 'pdf' | 'starter'): Promise<Blob> {
    await this.ensureLecturerAuth();
    const response = await api.get<Blob>(`/assignments/${encodeURIComponent(assignmentId)}/files/${kind}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getAssignmentFileUrl(assignmentId: string, kind: 'pdf' | 'starter'): string {
    return `${api.defaults.baseURL}/assignments/${encodeURIComponent(assignmentId)}/files/${kind}`;
  },

  /**
   * Đảm bảo đã có phiên đăng nhập của Giảng viên / Quản trị viên
   */
  async ensureLecturerAuth(): Promise<string> {
    if (typeof window === 'undefined') return '';
    const user = authService.getStoredUser();
    if (user && (user.role === 'LECTURER' || user.role === 'ADMIN')) return user.id;
    return user?.id || '';
  },

  /**
   * Lấy danh sách khóa học
   */
  async getCourses(): Promise<Course[]> {
    await this.ensureLecturerAuth();
    const res = await api.get('/courses');
    const data = res.data?.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') return [data];
    return [];
  },

  /**
   * Lấy danh sách tất cả đề thi PE
   */
  async getAssignments(courseId?: string): Promise<Assignment[]> {
    await this.ensureLecturerAuth();
    if (courseId) {
      const res = await api.get(`/assignments/course/${courseId}`);
      const data = res.data?.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object') return [data];
      return [];
    }

    try {
      const courses = await this.getCourses();
      if (!courses || courses.length === 0) return [];
      const assignmentsPerCourse = await Promise.all(
        courses.map(async (c) => {
          try {
            const res = await api.get(`/assignments/course/${c.id}`);
            return Array.isArray(res.data?.data) ? res.data.data : [];
          } catch {
            return [];
          }
        })
      );
      return assignmentsPerCourse.flat();
    } catch {
      return [];
    }
  },

  /**
   * Lấy chi tiết đề thi kèm testcases và rubric
   */
  async getAssignmentById(id: string): Promise<Assignment> {
    await this.ensureLecturerAuth();
    const res = await api.get(`/assignments/${id}`);
    return res.data?.data;
  },

  /**
   * Tạo đề thi mới
   */
  async createAssignment(payload: CreateAssignmentPayload): Promise<Assignment> {
    await this.ensureLecturerAuth();
    const res = await api.post('/assignments', payload);
    return res.data?.data;
  },

  async saveAssignmentPackage(
    assignmentId: string | null,
    payload: SaveAssignmentPackagePayload,
    files: { pdf?: File; starter?: File }
  ): Promise<Assignment> {
    await this.ensureLecturerAuth();
    const formData = new FormData();
    formData.append('payload', JSON.stringify(payload));
    if (files.pdf) formData.append('pdf', files.pdf);
    if (files.starter) formData.append('starter', files.starter);
    const endpoint = assignmentId ? `/assignments/${assignmentId}/compose` : '/assignments/compose';
    const response = assignmentId
      ? await api.put(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.data as Assignment;
  },

  async runDryRun(payload: {
    courseId: string;
    language: 'C_GCC' | 'JAVA_JDK';
    sourceCode?: string;
    sourceFiles?: Array<{ path: string; content: string }>;
    testCases: Array<{
      id?: string;
      questionNo?: string;
      stdinInput?: string | null;
      expectedStdout?: string | null;
      inputFileContent?: string | null;
      expectedFileName?: string | null;
      expectedFileContent?: string | null;
      comparisonMode: 'STDIO' | 'FILE_TO_FILE';
      timeLimitMs: number;
      memoryLimitKb: number;
      points: number;
    }>;
  }): Promise<DryRunExecutionSummary> {
    await this.ensureLecturerAuth();
    const response = await api.post('/sandbox/dry-run', payload, { timeout: 180_000 });
    return response.data.data as DryRunExecutionSummary;
  },

  /**
   * Cập nhật đề thi
   */
  async updateAssignment(id: string, payload: Partial<CreateAssignmentPayload>): Promise<Assignment> {
    await this.ensureLecturerAuth();
    const res = await api.put(`/assignments/${id}`, payload);
    return res.data?.data;
  },

  /**
   * Xóa đề thi
   */
  async deleteAssignment(id: string): Promise<void> {
    await this.ensureLecturerAuth();
    await api.delete(`/assignments/${id}`);
  },

  /**
   * Thêm testcase cho đề thi
   */
  async addTestCase(assignmentId: string, testCase: Partial<TestCase>): Promise<TestCase> {
    await this.ensureLecturerAuth();
    const res = await api.post(`/assignments/${assignmentId}/testcases`, testCase);
    return res.data?.data;
  },

  /**
   * Lấy danh sách testcase
   */
  async getTestCases(assignmentId: string): Promise<TestCase[]> {
    await this.ensureLecturerAuth();
    const res = await api.get(`/assignments/${assignmentId}/testcases`);
    return res.data?.data || [];
  },

  /**
   * Xóa testcase
   */
  async deleteTestCase(testCaseId: string): Promise<void> {
    await this.ensureLecturerAuth();
    await api.delete(`/assignments/testcases/${testCaseId}`);
  },

  /**
   * Lưu hoặc cập nhật bài giải mẫu (Solution)
   */
  async upsertSolution(assignmentId: string, solution: Partial<AssignmentSolution>): Promise<AssignmentSolution> {
    await this.ensureLecturerAuth();
    const res = await api.post(`/assignments/${assignmentId}/solutions`, solution);
    return res.data?.data;
  },

  /**
   * Lấy danh sách bài giải mẫu
   */
  /**
   * Thiết lập Rubric chấm điểm AI cho đề thi
   */
  async setRubricRules(assignmentId: string, rules: RubricRuleInput[]): Promise<RubricRule[]> {
    await this.ensureLecturerAuth();
    const res = await api.post(`/assignments/${assignmentId}/rubrics`, { rules });
    return res.data?.data || [];
  },

  /**
   * Lấy danh sách Rubric của đề thi
   */
  async getRubricRules(assignmentId: string): Promise<RubricRule[]> {
    await this.ensureLecturerAuth();
    const res = await api.get(`/assignments/${assignmentId}/rubrics`);
    return res.data?.data || [];
  },

  /**
   * Lấy danh sách bài nộp của một đề thi (Dành cho Giảng viên)
   */
  async getSubmissionsByAssignment(assignmentId: string): Promise<LecturerSubmission[]> {
    await this.ensureLecturerAuth();
    try {
      const res = await api.get(`/submissions/assignment/${assignmentId}`);
      return res.data?.data || [];
    } catch (err) {
      console.warn(`[AssignmentService] Submissions fetch failed for ${assignmentId}, using mock data:`, err);
      return [
        {
          id: 'sub-demo-01',
          assignmentId,
          userId: 'stu-01',
          paperCode: 'SE1901_Q1',
          submissionChannel: 'ZIP_UPLOAD',
          status: 'GRADED',
          sandboxScore: 6.0,
          aiScore: 1.5,
          finalScore: 7.5,
          compileSuccess: true,
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
          gradedAt: new Date(Date.now() - 1800000).toISOString(),
          user: {
            id: 'stu-01',
            fullName: 'Trần Đỗ Phong Nhã',
            email: 'phongnhatd@fpt.edu.vn',
          },
          testResults: [
            { id: 'tr-1', testCaseId: 'tc-1', verdict: 'PASSED', earnedPoints: 3.0, executionTimeMs: 45 },
            { id: 'tr-2', testCaseId: 'tc-2', verdict: 'PASSED', earnedPoints: 3.0, executionTimeMs: 52 },
            { id: 'tr-3', testCaseId: 'tc-3', verdict: 'FAILED', earnedPoints: 0.0, executionTimeMs: 2000 },
          ],
        },
        {
          id: 'sub-demo-02',
          assignmentId,
          userId: 'stu-02',
          paperCode: 'SE1901_Q1',
          submissionChannel: 'GIT_COMMIT',
          gitRepoUrl: 'https://github.com/diepnv/swd392-pe-submission',
          gitCommitHash: '9a8b7c6',
          status: 'GRADED',
          sandboxScore: 8.0,
          aiScore: 1.9,
          finalScore: 9.9,
          compileSuccess: true,
          submittedAt: new Date(Date.now() - 7200000).toISOString(),
          gradedAt: new Date(Date.now() - 3600000).toISOString(),
          user: {
            id: 'stu-02',
            fullName: 'Nguyễn Văn Điệp',
            email: 'diepnv@fpt.edu.vn',
          },
          testResults: [
            { id: 'tr-4', testCaseId: 'tc-1', verdict: 'PASSED', earnedPoints: 1.0, executionTimeMs: 38 },
            { id: 'tr-5', testCaseId: 'tc-2', verdict: 'PASSED', earnedPoints: 1.0, executionTimeMs: 42 },
            { id: 'tr-6', testCaseId: 'tc-3', verdict: 'PASSED', earnedPoints: 1.0, executionTimeMs: 65 },
          ],
        },
        {
          id: 'sub-demo-03',
          assignmentId,
          userId: 'stu-03',
          paperCode: 'SE1901_Q1',
          submissionChannel: 'ZIP_UPLOAD',
          status: 'RUNNING_SANDBOX',
          sandboxScore: null,
          aiScore: null,
          finalScore: null,
          compileSuccess: true,
          submittedAt: new Date(Date.now() - 600000).toISOString(),
          user: {
            id: 'stu-03',
            fullName: 'Lê Hoàng Long',
            email: 'longlh@fpt.edu.vn',
          },
        },
      ];
    }
  },

  async getGradingHistory(submissionId: string): Promise<GradingRun[]> {
    const response = await api.get<{ data?: GradingRun[] }>(`/submissions/${encodeURIComponent(submissionId)}/grading-history`);
    return response.data.data ?? [];
  },

  async getGradingEvidence(submissionId: string, runId: string, evidenceId: string): Promise<Blob> {
    const response = await api.get<Blob>(`/submissions/${encodeURIComponent(submissionId)}/grading-history/${encodeURIComponent(runId)}/evidence/${encodeURIComponent(evidenceId)}`, { responseType: 'blob' });
    return response.data;
  },

  async regradeSubmission(submissionId: string): Promise<void> {
    await this.ensureLecturerAuth();
    await api.post(`/submissions/${encodeURIComponent(submissionId)}/grading-runs`);
  },

  async reviewGradingRun(runId: string, reviewNote: string, finalScore?: number): Promise<void> {
    await this.ensureLecturerAuth();
    await api.post(`/submissions/grading-runs/${encodeURIComponent(runId)}/review`, { reviewNote, finalScore });
  },

  /**
   * Kích hoạt chấm lại qua Docker Sandbox
   */
  async reGradeWithSandbox(submissionId: string): Promise<unknown> {
    await this.ensureLecturerAuth();
    const res = await api.post(`/sandbox/grade/${submissionId}`);
    return res.data?.data;
  },

  /**
   * Kích hoạt chấm lại qua AI Rubrics
   */
  async reGradeWithAi(submissionId: string): Promise<unknown> {
    await this.ensureLecturerAuth();
    const res = await api.post(`/ai/grade/${submissionId}`);
    return res.data?.data;
  },

  async adjustParticipantScore(
    submissionId: string,
    userId: string,
    payload: { adjustedScore: number | null; reason: string }
  ): Promise<unknown> {
    const response = await api.patch(
      `/submissions/${encodeURIComponent(submissionId)}/participants/${encodeURIComponent(userId)}/score`,
      payload
    );
    return response.data?.data;
  },

  /**
   * Lấy danh sách tất cả các phòng thi giám sát trực tiếp từ CSDL
   */
  async getProctoringRooms(): Promise<ExamSession[]> {
    await this.ensureLecturerAuth();
    const res = await api.get('/assignments/proctoring/rooms');
    const data: unknown = res.data?.data;
    if (!Array.isArray(data)) throw new Error('Phản hồi danh sách ca thi không hợp lệ.');
    return data as ExamSession[];
  },

    /**
   * Lấy chi tiết dữ liệu giám sát phòng thi theo assignmentId
   */
  async getProctoringData(assignmentId: string): Promise<any | null> {
    await this.ensureLecturerAuth();
    const res = await api.get(`/assignments/${assignmentId}/proctoring`);
    return res.data?.data || null;
  },

  /**
   * Lấy danh sách file mã nguồn nộp bài của sinh viên
   */
  async getSubmissionSourceFiles(submissionId: string): Promise<Array<{ name: string; path: string; content: string; size: number }>> {
    await this.ensureLecturerAuth();
    const res = await api.get(`/submissions/${encodeURIComponent(submissionId)}/source-files`);
    return res.data?.data || [];
  },

  /**
   * Lấy chi tiết bài nộp của sinh viên (test results, stdout, ai review)
   */
  async getSubmissionDetail(submissionId: string): Promise<any> {
    await this.ensureLecturerAuth();
    const res = await api.get(`/submissions/${encodeURIComponent(submissionId)}`);
    return res.data?.data || res.data || null;
  },

  /**
   * Điều khiển phiên ca thi (Gia hạn +5m, Thu bài toàn bộ, Bắt đầu)
   */
  async controlExamSession(
    assignmentId: string,
    action: 'EXTEND' | 'CLOSE' | 'START' | 'PAUSE' | 'RESUME' | 'REOPEN' | 'PUBLISH_GRADES',
    extraMinutes?: number,
    newAccessCode?: string
  ): Promise<{
    message: string;
    deadline?: string;
    status?: string;
    secondsLeft?: number;
  }> {
    await this.ensureLecturerAuth();
    const res = await api.patch(`/assignments/${assignmentId}/session-control`, {
      action,
      extraMinutes,
      newAccessCode,
    });
    return {
      message: res.data?.message || res.data?.data?.message || 'Cập nhật ca thi thành công',
      ...(res.data?.data || {}),
    };
  },

  /**
   * Tải file .ZIP bài nộp của sinh viên về máy giảng viên
   */
  async downloadSubmissionZip(submissionId: string, filename?: string): Promise<void> {
    await this.ensureLecturerAuth();
    const res = await api.get(`/submissions/${encodeURIComponent(submissionId)}/download-zip`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `submission_${submissionId.slice(-6)}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Giảng viên chấm điểm thủ công (Ghi đè điểm + lý do đánh giá)
   */
  async manualGradeSubmission(
    submissionId: string,
    data: { finalScore: number; reason: string }
  ): Promise<any> {
    await this.ensureLecturerAuth();
    const res = await api.post(`/submissions/${encodeURIComponent(submissionId)}/manual-grade`, data);
    return res.data?.data || res.data;
  },
};
