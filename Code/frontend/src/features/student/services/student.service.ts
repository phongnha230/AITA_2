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
};

export function getStudentServiceErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}
