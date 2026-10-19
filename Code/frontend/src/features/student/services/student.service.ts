import axios from 'axios';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import type {
  CourseJoinResult,
  GradingJobInfo,
  PublicSandboxHealth,
  StudentAssignment,
  StudentCourse,
  StudentProfile,
  StudentProfileUpdate,
  StudentSubmissionDetail,
  TutorConversation,
  TutorMessage,
} from '../types/student.types';
import type { GradingRun } from '@/features/grading/types/grading-history.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const requireString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`AI Tutor response thiếu ${field}.`);
  }
  return value;
};

const normalizeTutorMessage = (value: unknown): TutorMessage => {
  if (!isRecord(value)) throw new Error('AI Tutor message không hợp lệ.');
  const senderRole = requireString(value.senderRole, 'senderRole');
  if (!['USER', 'MODEL', 'SYSTEM'].includes(senderRole)) {
    throw new Error('AI Tutor message có senderRole không hợp lệ.');
  }
  return {
    id: requireString(value.id, 'message.id'),
    role: senderRole === 'MODEL' ? 'ASSISTANT' : senderRole as TutorMessage['role'],
    content: requireString(value.content, 'message.content'),
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : undefined,
  };
};

const normalizeTutorConversation = (value: unknown): TutorConversation => {
  if (!isRecord(value)) throw new Error('AI Tutor conversation không hợp lệ.');
  const status = requireString(value.status, 'conversation.status');
  if (status !== 'ACTIVE' && status !== 'CLOSED') {
    throw new Error('AI Tutor conversation có trạng thái không hợp lệ.');
  }
  return {
    id: requireString(value.id, 'conversation.id'),
    submissionId: requireString(value.submissionId, 'conversation.submissionId'),
    title: requireString(value.title, 'conversation.title'),
    status,
    messages: Array.isArray(value.messages) ? value.messages.map(normalizeTutorMessage) : [],
  };
};

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

  async getSandboxHealth(): Promise<PublicSandboxHealth> {
    const response = await api.get<PublicSandboxHealth>('/sandbox/health');
    return response.data;
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

  async getGradingHistory(submissionId: string): Promise<GradingRun[]> {
    const response = await api.get<ApiResponse<GradingRun[]>>(`/submissions/${encodeURIComponent(submissionId)}/grading-history`);
    return response.data.data ?? [];
  },

  async getGradingEvidence(submissionId: string, runId: string, evidenceId: string): Promise<Blob> {
    const response = await api.get<Blob>(`/submissions/${encodeURIComponent(submissionId)}/grading-history/${encodeURIComponent(runId)}/evidence/${encodeURIComponent(evidenceId)}`, { responseType: 'blob' });
    return response.data;
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

  async unlockExam(id: string, accessCode: string): Promise<{
    assignmentId: string; status: 'UPCOMING' | 'OPEN' | 'PAUSED' | 'ENDED' | 'CLOSED';
    assignmentStatus: string; startTime: string; deadline: string; durationMinutes: number | null;
  }> {
    const response = await api.post<ApiResponse<{
      assignmentId: string; status: 'UPCOMING' | 'OPEN' | 'PAUSED' | 'ENDED' | 'CLOSED';
      assignmentStatus: string; startTime: string; deadline: string; durationMinutes: number | null;
    }>>(`/assignments/${encodeURIComponent(id)}/unlock`, { accessCode });
    if (!response.data.data) throw new Error('Không nhận được trạng thái ca thi.');
    return response.data.data;
  },

  async getExamSession(id: string): Promise<{
    assignmentId: string; status: 'UPCOMING' | 'OPEN' | 'PAUSED' | 'ENDED' | 'CLOSED';
    assignmentStatus: string; startTime: string; deadline: string; durationMinutes: number | null;
  }> {
    const response = await api.get<ApiResponse<{
      assignmentId: string; status: 'UPCOMING' | 'OPEN' | 'PAUSED' | 'ENDED' | 'CLOSED';
      assignmentStatus: string; startTime: string; deadline: string; durationMinutes: number | null;
    }>>(`/assignments/${encodeURIComponent(id)}/session`);
    if (!response.data.data) throw new Error('Không nhận được trạng thái ca thi.');
    return response.data.data;
  },

  async downloadExamPdf(id: string): Promise<Blob> {
    const response = await api.get<Blob>(`/assignments/${encodeURIComponent(id)}/files/pdf`, { responseType: 'blob' });
    return response.data;
  },

  async getAssignmentTestCases(id: string): Promise<import('../types/student.types').AssignmentTestCase[]> {
    const response = await api.get<ApiResponse<import('../types/student.types').AssignmentTestCase[]>>(`/assignments/${encodeURIComponent(id)}/testcases`);
    return response.data.data ?? [];
  },

  async getAssignmentRubrics(id: string): Promise<import('../types/student.types').AssignmentRubric[]> {
    const response = await api.get<ApiResponse<import('../types/student.types').AssignmentRubric[]>>(`/assignments/${encodeURIComponent(id)}/rubrics`);
    return response.data.data ?? [];
  },

  async startTutorConversation(submissionId?: string, title?: string): Promise<TutorConversation> {
    const response = await api.post<ApiResponse<unknown>>('/ai/tutor/conversations', {
      submissionId: submissionId || undefined,
      title: title || 'Hỏi đáp Socratic AI',
    });
    if (!response.data.data) {
      throw new Error('Không thể khởi tạo phiên trò chuyện với AI.');
    }
    return normalizeTutorConversation(response.data.data);
  },

  async sendTutorMessage(
    conversationId: string,
    content: string
  ): Promise<TutorMessage> {
    const response = await api.post<ApiResponse<unknown>>(
      `/ai/tutor/conversations/${encodeURIComponent(conversationId)}/messages`,
      { content }
    );
    const pair = response.data.data;
    if (!isRecord(pair) || !pair.aiReply) {
      throw new Error('Không nhận được phản hồi từ AI.');
    }
    return normalizeTutorMessage(pair.aiReply);
  },

  async getTutorConversation(conversationId: string): Promise<TutorConversation> {
    const response = await api.get<ApiResponse<unknown>>(
      `/ai/tutor/conversations/${encodeURIComponent(conversationId)}`
    );
    if (!response.data.data) {
      throw new Error('Không tìm thấy cuộc hội thoại.');
    }
    return normalizeTutorConversation(response.data.data);
  },
};

export function getStudentServiceErrorMessage(error: unknown, fallback: string): string {
  return axios.isAxiosError(error) ? getErrorMessage(error, fallback) : fallback;
}
