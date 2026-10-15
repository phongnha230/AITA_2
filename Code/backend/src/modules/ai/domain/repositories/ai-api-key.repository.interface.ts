import { AiApiKey, ApiProvider } from '../entities/ai-api-key.entity.js';

export interface CreateAiApiKeyData {
  provider: ApiProvider;
  keyAlias: string;
  keyHint: string;
  encryptedSecret: string;
  iv: string;
  authTag: string;
  encryptionVersion: number;
  dailyRequestLimit?: number;
  rpmLimit?: number;
}

export interface AiKeyFailureUpdate {
  consecutiveFailures: number;
  cooldownUntil: Date | null;
  lastErrorCode: string;
  isActive?: boolean;
}

export interface EncryptedSecretUpdate {
  encryptedSecret: string;
  iv: string;
  authTag: string;
  encryptionVersion: number;
}

export interface IAiApiKeyRepository {
  findById(id: string): Promise<AiApiKey | null>;
  findCandidates(provider?: ApiProvider, now?: Date): Promise<AiApiKey[]>;
  findAll(): Promise<AiApiKey[]>;
  create(data: CreateAiApiKeyData): Promise<AiApiKey>;
  reserveDailyUsage(id: string, utcDay: Date, now: Date): Promise<boolean>;
  recordSuccess(id: string): Promise<void>;
  recordFailure(id: string, update: AiKeyFailureUpdate): Promise<void>;
  updateEncryptedSecret(id: string, update: EncryptedSecretUpdate): Promise<void>;
  markMigrationFailure(id: string): Promise<void>;
  update(id: string, data: Partial<{ isActive: boolean; rpmLimit: number; dailyRequestLimit: number }>): Promise<AiApiKey>;
  delete(id: string): Promise<void>;
}
