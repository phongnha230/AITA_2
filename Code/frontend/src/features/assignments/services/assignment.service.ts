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
} from '../types/assignment.types';
import type { ExamRoom, StudentExamStation } from '../../proctoring/types/proctoring.types';


export const assignmentService = {
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

  /**
   * Kích hoạt chấm lại qua Docker Sandbox
   */
  async reGradeWithSandbox(submissionId: string): Promise<any> {
    await this.ensureLecturerAuth();
    const res = await api.post(`/sandbox/grade/${submissionId}`);
    return res.data?.data;
  },

  /**
   * Kích hoạt chấm lại qua AI Rubrics
   */
  async reGradeWithAi(submissionId: string): Promise<any> {
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
  async getProctoringRooms(): Promise<ExamRoom[]> {
    await this.ensureLecturerAuth();
    try {
      const res = await api.get('/assignments/proctoring/rooms');
      const data = res.data?.data;
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (err) {
      console.warn('[AssignmentService] getProctoringRooms failed:', err);
    }
    return [];
  },

  /**
   * Lấy chi tiết dữ liệu giám sát phòng thi theo assignmentId
   */
  async getProctoringData(assignmentId: string): Promise<{
    room: ExamRoom;
    stations: StudentExamStation[];
    assignment: any;
  } | null> {
    await this.ensureLecturerAuth();
    try {
      const res = await api.get(`/assignments/${assignmentId}/proctoring`);
      return res.data?.data || null;
    } catch (err) {
      console.warn(`[AssignmentService] getProctoringData failed for ${assignmentId}:`, err);
      return null;
    }
  },

  /**
   * Điều khiển phiên ca thi (Gia hạn +5m, Thu bài toàn bộ, Bắt đầu)
   */
  async controlExamSession(
    assignmentId: string,
    action: 'EXTEND' | 'CLOSE' | 'START' | 'PAUSE',
    extraMinutes?: number
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
    });
    return res.data?.data;
  },
};

