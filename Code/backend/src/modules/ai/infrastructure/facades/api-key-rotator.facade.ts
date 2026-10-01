import crypto from 'crypto';
import { IAiApiKeyRepository } from '../../domain/repositories/ai-api-key.repository.interface.js';
import { ILlmProvider } from '../adapters/llm-provider.interface.js';
import { GeminiAdapter } from '../adapters/gemini.adapter.js';
import { MockLlmAdapter } from '../adapters/mock-llm.adapter.js';
import { env } from '../../../../infrastructure/config/env.js';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = crypto
  .createHash('sha256')
  .update(env.JWT_SECRET || 'aita_master_key_secret_2024')
  .digest();

export class ApiKeyRotatorFacade {
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
    options: {
      systemInstruction?: string;
      temperature?: number;
      maxOutputTokens?: number;
      jsonMode?: boolean;
    }
  ) {
    // 1. Kiểm tra nếu có GEMINI_API_KEY trong env
    const envKey = (process.env.GEMINI_API_KEY || '').trim();
    if (envKey) {
      try {
        return await this.geminiAdapter.generateContent(prompt, {
          ...options,
          apiKey: envKey,
        });
      } catch (err: any) {
        console.warn('[ApiKeyRotatorFacade] Env GEMINI_API_KEY failed, trying DB keys ->', err.message);
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
      } catch (err: any) {
        console.warn(`[ApiKeyRotatorFacade] Key ${dbKey.keyAlias} error:`, err.message);
        await this.apiKeyRepository.recordFailure(dbKey.id);
      }
    }

    // 3. Fallback sang Mock LLM để hệ thống luôn phản hồi ổn định
    console.warn('[ApiKeyRotatorFacade] Using Mock LLM fallback for local test.');
    return await this.mockAdapter.generateContent(prompt, {
      ...options,
      apiKey: 'mock-key',
    });
  }
}
