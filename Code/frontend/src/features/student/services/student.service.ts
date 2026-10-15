import axios from 'axios';
import api from '@/lib/api';
import type {
  CourseJoinResult,
  GradingJobInfo,
  SandboxStatus,
  StudentAssignment,
  StudentCourse,
  StudentProfile,
  StudentProfileUpdate,
  StudentSubmissionDetail,
} from '../types/student.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T | null;
}

interface ApiErrorResponse {
  message?: string;
}

export const studentService = {
  async getProfile(): Promise<StudentProfile> {
    const response = await api.get<ApiResponse<StudentProfile>>('/users/profile');
    if (!response.data.data) {
      throw new Error('Thông tin tài khoản chưa có sẵn.');
    }
    return response.data.data;
  },

  async updateProfile(data: StudentProfileUpdate): Promise<StudentProfile> {
    const response = await api.patch<ApiResponse<StudentProfile>>('/users/profile', data);
    if (!response.data.data) {
      throw new Error('Không nhận được hồ sơ sau khi cập nhật.');
    }
    return response.data.data;
  },

  async getCourses(studentId: string): Promise<StudentCourse[]> {
    const response = await api.get<ApiResponse<StudentCourse[]>>('/courses', {
      params: { studentId },
    });
    return response.data.data ?? [];
  },

  async getAllCourses(params?: { search?: string }): Promise<StudentCourse[]> {
    const response = await api.get<ApiResponse<StudentCourse[]>>('/courses', {
      params: {
        scope: 'all',
        search: params?.search,
      },
    });
    return response.data.data ?? [];
  },

  async getAssignmentsByCourse(courseId: string): Promise<StudentAssignment[]> {
    const response = await api.get<ApiResponse<StudentAssignment[]>>(
      `/assignments/course/${courseId}`,
    );
    return response.data.data ?? [];
  },

  async joinCourse(code: string): Promise<CourseJoinResult> {
    const response = await api.post<ApiResponse<CourseJoinResult>>('/courses/join', { code });
    if (!response.data.data) {
      throw new Error('Không nhận được kết quả tham gia lớp học.');
    }
    return response.data.data;
  },

  async getSandboxStatus(): Promise<SandboxStatus | null> {
    const response = await api.get<ApiResponse<SandboxStatus>>('/sandbox/status');
    return response.data.data ?? null;
  },

  async getSubmission(submissionId: string): Promise<StudentSubmissionDetail> {
    const response = await api.get<ApiResponse<StudentSubmissionDetail>>(
      `/submissions/${encodeURIComponent(submissionId)}`,
    );
    if (!response.data.data) {
      throw new Error('Không tìm thấy thông tin bài nộp.');
    }
    return response.data.data;
  },

  async getGradingJobStatus(submissionId: string): Promise<GradingJobInfo | null> {
    const response = await api.get<ApiResponse<GradingJobInfo>>(
      `/jobs/${encodeURIComponent(submissionId)}`,
    );
    return response.data.data ?? null;
  },

  async submitAssignment(formData: FormData): Promise<{ id: string }> {
    const response = await api.post<ApiResponse<{ id: string }>>('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể nộp bài.');
    }
    return response.data.data;
  },

  async getPortfolio(): Promise<import('../types/student.types').StudentPortfolioData> {
    const response = await api.get<ApiResponse<import('../types/student.types').StudentPortfolioData>>('/users/portfolio');
    if (!response.data.data) {
      throw new Error('Không thể tải thông tin portfolio.');
    }
    return response.data.data;
  },

  async getAssignmentDetail(id: string): Promise<StudentAssignment> {
    const response = await api.get<ApiResponse<StudentAssignment>>(`/assignments/${encodeURIComponent(id)}`);
    if (!response.data.data) {
      throw new Error('Không tìm thấy thông tin đề thi.');
    }
    return response.data.data;
  },

  async getAssignmentTestCases(id: string): Promise<import('../types/student.types').AssignmentTestCase[]> {
    const response = await api.get<ApiResponse<import('../types/student.types').AssignmentTestCase[]>>(`/assignments/${encodeURIComponent(id)}/testcases`);
    return response.data.data ?? [];
  },

  async getAssignmentRubrics(id: string): Promise<import('../types/student.types').AssignmentRubric[]> {
    const response = await api.get<ApiResponse<import('../types/student.types').AssignmentRubric[]>>(`/assignments/${encodeURIComponent(id)}/rubrics`);
    return response.data.data ?? [];
  },

  async startTutorConversation(submissionId?: string, title?: string): Promise<{ id: string }> {
    const response = await api.post<ApiResponse<{ id: string }>>('/ai/tutor/conversations', {
      submissionId: submissionId || undefined,
      title: title || 'Hỏi đáp Socratic AI',
    });
    if (!response.data.data) {
      throw new Error('Không thể khởi tạo phiên trò chuyện với AI.');
    }
    return response.data.data;
  },

  async sendTutorMessage(
    conversationId: string,
    content: string,
    studentCodeSnippet?: string
  ): Promise<{ id: string; role: string; content: string }> {
    const response = await api.post<ApiResponse<{ id: string; role: string; content: string }>>(
      `/ai/tutor/conversations/${encodeURIComponent(conversationId)}/messages`,
      { content, studentCodeSnippet }
    );
    if (!response.data.data) {
      throw new Error('Không nhận được phản hồi từ AI.');
    }
    return response.data.data;
  },

  async getTutorConversation(conversationId: string): Promise<{ id: string; messages: Array<{ id: string; role: string; content: string }> }> {
    const response = await api.get<ApiResponse<{ id: string; messages: Array<{ id: string; role: string; content: string }> }>>(
      `/ai/tutor/conversations/${encodeURIComponent(conversationId)}`
    );
    if (!response.data.data) {
      throw new Error('Không tìm thấy cuộc hội thoại.');
    }
    return response.data.data;
  },
};

export function getStudentServiceErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}
