import api from '../../../lib/api';
import {
  Assignment,
  CreateAssignmentPayload,
  TestCase,
  AssignmentSolution,
  Course,
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
  async getSolutions(assignmentId: string): Promise<AssignmentSolution[]> {
    await this.ensureLecturerAuth();
    const res = await api.get(`/assignments/${assignmentId}/solutions`);
    return res.data?.data || [];
  },
};
