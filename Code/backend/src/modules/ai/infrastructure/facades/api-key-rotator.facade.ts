import { env } from '../../../../infrastructure/config/env.js';
import { AppError } from '../../../../shared/domain/exceptions/app.error.js';
import {
  IAiGenerationService,
  AiGenerationOptions,
} from '../../application/services/ai-generation.service.interface.js';
import { IGeminiCredentialPool } from '../../application/services/gemini-credential-pool.interface.js';
import { GeminiAdapter } from '../adapters/gemini.adapter.js';
import { ILlmProvider } from '../adapters/llm-provider.interface.js';
import { MockLlmAdapter } from '../adapters/mock-llm.adapter.js';

export class ApiKeyRotatorFacade implements IAiGenerationService {
  constructor(
    private readonly credentialPool: IGeminiCredentialPool,
    private readonly geminiAdapter: ILlmProvider = new GeminiAdapter(),
    private readonly mockAdapter: ILlmProvider = new MockLlmAdapter()
  ) {}

  public async executeWithKeyRotation(prompt: string, options: AiGenerationOptions) {
    try {
      return await this.credentialPool.execute(options.operation, (apiKey) =>
        this.geminiAdapter.generateContent(prompt, { ...options, apiKey })
      );
    } catch (error) {
      if (
        error instanceof AppError &&
        error.errorCode === 'AI_PROVIDER_UNAVAILABLE' &&
        env.NODE_ENV !== 'production' &&
        env.ALLOW_MOCK_LLM
      ) {
        return this.mockAdapter.generateContent(prompt, { ...options, apiKey: 'mock-key' });
      }
      throw error;
    }
  }
}
