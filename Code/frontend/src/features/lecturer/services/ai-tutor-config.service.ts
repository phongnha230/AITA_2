import api from '@/lib/api';

interface ApiResponse<T> {
  data?: T;
}

export type SocraticMode = 'STRICT' | 'BALANCED' | 'LENIENT';

export interface AiTutorCourseConfig {
  courseId: string;
  socraticMode: SocraticMode;
  customPrompt: string;
  temperature: number;
  enableContext: boolean;
  updatedAt: string | null;
}

export const DEFAULT_AI_TUTOR_CONFIG: Omit<AiTutorCourseConfig, 'courseId' | 'updatedAt'> = {
  socraticMode: 'BALANCED',
  customPrompt: '',
  temperature: 0.7,
  enableContext: true,
};

export const aiTutorConfigService = {
  async get(courseId: string): Promise<AiTutorCourseConfig> {
    const response = await api.get<ApiResponse<AiTutorCourseConfig>>(`/ai/tutor/config/${encodeURIComponent(courseId)}`);
    if (!response.data.data) throw new Error('API không trả về cấu hình AI Tutor.');
    return response.data.data;
  },

  async save(courseId: string, config: Omit<AiTutorCourseConfig, 'courseId' | 'updatedAt'>): Promise<AiTutorCourseConfig> {
    const response = await api.put<ApiResponse<AiTutorCourseConfig>>(`/ai/tutor/config/${encodeURIComponent(courseId)}`, config);
    if (!response.data.data) throw new Error('API không xác nhận cấu hình AI Tutor đã lưu.');
    return response.data.data;
  },
};
