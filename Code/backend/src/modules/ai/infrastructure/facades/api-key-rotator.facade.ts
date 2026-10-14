import crypto from 'crypto';
import { IAiApiKeyRepository } from '../../domain/repositories/ai-api-key.repository.interface.js';
import { ILlmProvider } from '../adapters/llm-provider.interface.js';
import { GeminiAdapter } from '../adapters/gemini.adapter.js';
import { MockLlmAdapter } from '../adapters/mock-llm.adapter.js';
import { env } from '../../../../infrastructure/config/env.js';
import { AppError } from '../../../../shared/domain/exceptions/app.error.js';
import { logger } from '../../../../infrastructure/logging/logger.js';
import {
  AiGenerationOptions,
  IAiGenerationService,
} from '../../application/services/ai-generation.service.interface.js';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = crypto
  .createHash('sha256')
  .update(env.JWT_SECRET)
  .digest();

export class ApiKeyRotatorFacade implements IAiGenerationService {
  private geminiAdapter = new GeminiAdapter();
  private mockAdapter = new MockLlmAdapter();

  constructor(private readonly apiKeyRepository: IAiApiKeyRepository) {}

  public static encryptKey(rawKey: string): {
    encryptedSecret: string;
    iv: string;
    authTag: string;
  } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, SECRET_KEY, iv);
    let encrypted = cipher.update(rawKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encryptedSecret: encrypted,
      iv: iv.toString('hex'),
      authTag,
    };
  }

  public static decryptKey(encryptedSecret: string, ivHex: string, authTagHex: string): string {
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      SECRET_KEY,
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedSecret, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Thực hiện gọi LLM với cơ chế xoay vòng Key tự động và fallback chịu lỗi
   */
  async executeWithKeyRotation(
    prompt: string,
    options: AiGenerationOptions
  ) {
    // 1. Kiểm tra nếu có GEMINI_API_KEY trong env
    const envKey = env.GEMINI_API_KEY.trim();
    if (envKey) {
      try {
        return await this.geminiAdapter.generateContent(prompt, {
          ...options,
          apiKey: envKey,
        });
      } catch (error: unknown) {
        logger.warn('gemini_env_key_failed', {
          stage: 'AI_PROVIDER',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }

    // 2. Tìm key khả dụng trong Database
    const dbKey = await this.apiKeyRepository.findAvailableKey('GEMINI');
    if (dbKey) {
      try {
        const rawApiKey = ApiKeyRotatorFacade.decryptKey(
          dbKey.encryptedSecret,
          dbKey.iv,
          dbKey.authTag
        );
        const result = await this.geminiAdapter.generateContent(prompt, {
          ...options,
          apiKey: rawApiKey,
        });

        await this.apiKeyRepository.incrementUsage(dbKey.id);
        await this.apiKeyRepository.resetConsecutiveFailures(dbKey.id);
        return result;
      } catch (error: unknown) {
        logger.warn('gemini_database_key_failed', {
          stage: 'AI_PROVIDER',
          keyAlias: dbKey.keyAlias,
          error: error instanceof Error ? error : new Error(String(error)),
        });
        await this.apiKeyRepository.recordFailure(dbKey.id);
      }
    }

    if (env.NODE_ENV !== 'production' && env.ALLOW_MOCK_LLM) {
      console.warn('[ApiKeyRotatorFacade] Using explicitly enabled Mock LLM.');
      return this.mockAdapter.generateContent(prompt, { ...options, apiKey: 'mock-key' });
    }

    throw new AppError('Không có Gemini API key khả dụng.', 503, 'AI_PROVIDER_UNAVAILABLE');
  }
}
