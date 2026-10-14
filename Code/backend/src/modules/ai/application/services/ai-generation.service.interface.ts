import { LlmResponse } from '../../infrastructure/adapters/llm-provider.interface.js';

export interface AiGenerationOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
}

export interface IAiGenerationService {
  executeWithKeyRotation(prompt: string, options: AiGenerationOptions): Promise<LlmResponse>;
}
