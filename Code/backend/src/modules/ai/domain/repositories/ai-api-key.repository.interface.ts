import { AiApiKey, ApiProvider } from '../entities/ai-api-key.entity.js';

export interface CreateAiApiKeyData {
  provider: ApiProvider;
  keyAlias: string;
  keyHint: string;
  encryptedSecret: string;
  iv: string;
  authTag: string;
  dailyRequestLimit?: number;
  rpmLimit?: number;
}

export interface IAiApiKeyRepository {
  findById(id: string): Promise<AiApiKey | null>;
  findAvailableKey(provider?: ApiProvider): Promise<AiApiKey | null>;
  findAll(): Promise<AiApiKey[]>;
  create(data: CreateAiApiKeyData): Promise<AiApiKey>;
  incrementUsage(id: string): Promise<void>;
  recordFailure(id: string): Promise<void>;
  resetConsecutiveFailures(id: string): Promise<void>;
  update(id: string, data: Partial<{ isActive: boolean; rpmLimit: number; dailyRequestLimit: number }>): Promise<AiApiKey>;
  delete(id: string): Promise<void>;
}
