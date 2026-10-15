import { LlmResponse } from '../../infrastructure/adapters/llm-provider.interface.js';
import { GeminiOperation } from './gemini-credential-pool.interface.js';

export interface AiGenerationOptions {
  operation: Extract<GeminiOperation, 'CHAT_GENERATION' | 'GRADING_GENERATION'>;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
}

export interface IAiGenerationService {
  executeWithKeyRotation(prompt: string, options: AiGenerationOptions): Promise<LlmResponse>;
}
