export type SocraticMode = 'STRICT' | 'BALANCED' | 'LENIENT';

export interface AiTutorConfig {
  courseId: string;
  socraticMode: SocraticMode;
  customPrompt: string;
  temperature: number;
  enableContext: boolean;
  updatedAt: Date | null;
}

export const DEFAULT_AI_TUTOR_CONFIG: AiTutorConfig = {
  courseId: '',
  socraticMode: 'BALANCED',
  customPrompt: '',
  temperature: 0.7,
  enableContext: true,
  updatedAt: null,
};
