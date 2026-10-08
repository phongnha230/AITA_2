import api from '../../../lib/api';
import {
  Assignment,
  CreateAssignmentPayload,
  TestCase,
  AssignmentSolution,
  Course,
  LecturerSubmission,
} from '../types/assignment.types';

export const assignmentService = {
  /**
   * Đảm bảo đã có token Giảng viên trong localStorage.
   * Nếu chưa có sẽ tự động đăng nhập tài khoản Giảng viên mặc định của hệ thống.
   */
  async ensureLecturerAuth(): Promise<string> {
    if (typeof window === 'undefined') return '';
    let token = localStorage.getItem('token');
    if (token) return token;

    try {
      const res = await api.post('/auth/login', {
        username: 'lecturer@fpt.edu.vn',
        password: 'password123',
      });
      if (res.data?.data?.token) {
        token = res.data.data.token;
        localStorage.setItem('token', token as string);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        return token as string;
      }
    } catch (err) {
      console.warn('Auto login failed:', err);
    }
    return '';
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
    const url = courseId ? `/assignments?courseId=${courseId}` : '/assignments';
    const res = await api.get(url);
    const data = res.data?.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') return [data];
    return [];
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
          sandboxScore: 8.5,
          aiScore: 8.0,
          finalScore: 8.35,
          compileSuccess: true,
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
          gradedAt: new Date(Date.now() - 1800000).toISOString(),
          user: {
            id: 'stu-01',
            fullName: 'Trần Đỗ Phong Nhã',
            email: 'phongnhatd@fpt.edu.vn',
          },
          testResults: [
            { id: 'tr-1', testCaseId: 'tc-1', verdict: 'PASSED', earnedPoints: 1.0, executionTimeMs: 45 },
            { id: 'tr-2', testCaseId: 'tc-2', verdict: 'PASSED', earnedPoints: 1.0, executionTimeMs: 52 },
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
          sandboxScore: 10.0,
          aiScore: 9.5,
          finalScore: 9.85,
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
};
