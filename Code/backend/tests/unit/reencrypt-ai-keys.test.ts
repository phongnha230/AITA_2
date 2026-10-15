import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { ReencryptAiKeysUseCase } from '../../src/modules/ai/application/use-cases/reencrypt-ai-keys.use-case.js';
import { AiApiKey } from '../../src/modules/ai/domain/entities/ai-api-key.entity.js';
import {
  AiKeyFailureUpdate,
  CreateAiApiKeyData,
  EncryptedSecretUpdate,
  IAiApiKeyRepository,
} from '../../src/modules/ai/domain/repositories/ai-api-key.repository.interface.js';
import { ApiKeyCipherService } from '../../src/modules/ai/infrastructure/security/api-key-cipher.service.js';

const legacySecret = 'legacy-jwt-secret-at-least-32-characters';
const currentKey = Buffer.alloc(32, 8).toString('base64');

const legacyEncrypted = (rawKey: string) => {
  const key = crypto.createHash('sha256').update(legacySecret).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(rawKey, 'utf8'), cipher.final()]);
  return {
    encryptedSecret: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
    encryptionVersion: 1,
  };
};

const keyEntity = (id: string, secret: ReturnType<typeof legacyEncrypted>): AiApiKey =>
  new AiApiKey({
    id,
    provider: 'GEMINI',
    keyAlias: id,
    keyHint: '...test',
    ...secret,
    dailyRequestLimit: 10,
    currentRequestsToday: 0,
    usageDate: null,
    rpmLimit: 5,
    consecutiveFailures: 0,
    isActive: true,
    cooldownUntil: null,
    lastErrorCode: null,
    lastUsedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

class MigrationRepository implements IAiApiKeyRepository {
  public updates = new Map<string, EncryptedSecretUpdate>();
  public disabled: string[] = [];
  constructor(private readonly keys: AiApiKey[]) {}
  findById(): Promise<AiApiKey | null> { return Promise.resolve(null); }
  findCandidates(): Promise<AiApiKey[]> { return Promise.resolve([]); }
  findAll(): Promise<AiApiKey[]> { return Promise.resolve(this.keys); }
  create(_data: CreateAiApiKeyData): Promise<AiApiKey> { throw new Error('not used'); }
  reserveDailyUsage(): Promise<boolean> { return Promise.resolve(false); }
  recordSuccess(): Promise<void> { return Promise.resolve(); }
  recordFailure(_id: string, _update: AiKeyFailureUpdate): Promise<void> { return Promise.resolve(); }
  updateEncryptedSecret(id: string, update: EncryptedSecretUpdate): Promise<void> {
    this.updates.set(id, update);
    return Promise.resolve();
  }
  markMigrationFailure(id: string): Promise<void> {
    this.disabled.push(id);
    return Promise.resolve();
  }
  update(): Promise<AiApiKey> { throw new Error('not used'); }
  delete(): Promise<void> { return Promise.resolve(); }
}

describe('ReencryptAiKeysUseCase', () => {
  it('re-encrypts valid legacy keys and disables invalid placeholders', async () => {
    const cipher = new ApiKeyCipherService(currentKey, legacySecret);
    const repository = new MigrationRepository([
      keyEntity('valid', legacyEncrypted('real-dashboard-key')),
      keyEntity('invalid', {
        encryptedSecret: 'not-hex',
        iv: 'bad',
        authTag: 'bad',
        encryptionVersion: 1,
      }),
    ]);

    await expect(new ReencryptAiKeysUseCase(repository, cipher).execute()).resolves.toEqual({
      discovered: 2,
      migrated: 1,
      disabled: 1,
    });
    const migrated = repository.updates.get('valid');
    expect(migrated?.encryptionVersion).toBe(2);
    if (!migrated) throw new Error('Expected migrated key');
    expect(cipher.decrypt(migrated)).toBe('real-dashboard-key');
    expect(repository.disabled).toEqual(['invalid']);
  });
});
