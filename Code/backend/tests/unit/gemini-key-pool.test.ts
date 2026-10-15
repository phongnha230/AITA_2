import { describe, expect, it, vi } from 'vitest';
import { AiApiKey } from '../../src/modules/ai/domain/entities/ai-api-key.entity.js';
import {
  AiKeyFailureUpdate,
  CreateAiApiKeyData,
  EncryptedSecretUpdate,
  IAiApiKeyRepository,
} from '../../src/modules/ai/domain/repositories/ai-api-key.repository.interface.js';
import { ApiKeyCipherService } from '../../src/modules/ai/infrastructure/security/api-key-cipher.service.js';
import {
  IRpmLimiter,
  RpmReservation,
} from '../../src/modules/ai/infrastructure/credentials/redis-rpm-limiter.js';
import {
  classifyGeminiFailure,
  GeminiCredentialPoolService,
} from '../../src/modules/ai/infrastructure/credentials/gemini-credential-pool.service.js';

const now = new Date('2026-10-14T10:00:00.000Z');
const currentKey = Buffer.alloc(32, 4).toString('base64');
const cipher = new ApiKeyCipherService(currentKey, 'legacy-secret-at-least-32-characters');

const makeKey = (id: string, rawKey: string): AiApiKey => {
  const encrypted = cipher.encrypt(rawKey);
  return new AiApiKey({
    id,
    provider: 'GEMINI',
    keyAlias: `Key ${id}`,
    keyHint: `...${rawKey.slice(-4)}`,
    ...encrypted,
    dailyRequestLimit: 10,
    currentRequestsToday: 0,
    usageDate: now,
    rpmLimit: 2,
    consecutiveFailures: 0,
    isActive: true,
    cooldownUntil: null,
    lastErrorCode: null,
    lastUsedAt: null,
    createdAt: now,
    updatedAt: now,
  });
};

class FakeRepository implements IAiApiKeyRepository {
  public candidates: AiApiKey[] = [];
  public dailyReservations: boolean[] = [];
  public failures: Array<{ id: string; update: AiKeyFailureUpdate }> = [];
  public successes: string[] = [];
  public dailyError: Error | null = null;

  findById(): Promise<AiApiKey | null> { return Promise.resolve(null); }
  findCandidates(): Promise<AiApiKey[]> { return Promise.resolve(this.candidates); }
  findAll(): Promise<AiApiKey[]> { return Promise.resolve(this.candidates); }
  create(_data: CreateAiApiKeyData): Promise<AiApiKey> { throw new Error('not used'); }
  reserveDailyUsage(): Promise<boolean> {
    if (this.dailyError) return Promise.reject(this.dailyError);
    return Promise.resolve(this.dailyReservations.shift() ?? true);
  }
  recordSuccess(id: string): Promise<void> {
    this.successes.push(id);
    return Promise.resolve();
  }
  recordFailure(id: string, update: AiKeyFailureUpdate): Promise<void> {
    this.failures.push({ id, update });
    return Promise.resolve();
  }
  updateEncryptedSecret(_id: string, _update: EncryptedSecretUpdate): Promise<void> {
    return Promise.resolve();
  }
  markMigrationFailure(): Promise<void> { return Promise.resolve(); }
  update(): Promise<AiApiKey> { throw new Error('not used'); }
  delete(): Promise<void> { return Promise.resolve(); }
}

class FakeLimiter implements IRpmLimiter {
  public reservations: Array<RpmReservation | null> = [];
  public released: RpmReservation[] = [];
  public error: Error | null = null;

  reserve(keyId: string): Promise<RpmReservation | null> {
    if (this.error) return Promise.reject(this.error);
    return Promise.resolve(
      this.reservations.shift() ?? { redisKey: `rpm:${keyId}`, member: `${keyId}:1` }
    );
  }
  release(reservation: RpmReservation): Promise<void> {
    this.released.push(reservation);
    return Promise.resolve();
  }
}

describe('GeminiCredentialPoolService', () => {
  it('uses a dashboard key before environment fallback', async () => {
    const repository = new FakeRepository();
    repository.candidates = [makeKey('db-1', 'dashboard-key')];
    const handler = vi.fn(async (apiKey: string) => `used:${apiKey}`);
    const pool = new GeminiCredentialPoolService(
      repository,
      new FakeLimiter(),
      cipher,
      ['env-key'],
      () => now
    );

    await expect(pool.execute('CHAT_GENERATION', handler)).resolves.toBe('used:dashboard-key');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(repository.successes).toEqual(['db-1']);
  });

  it('rotates to the next dashboard key after a 429 response', async () => {
    const repository = new FakeRepository();
    repository.candidates = [makeKey('db-1', 'rate-limited'), makeKey('db-2', 'healthy')];
    const pool = new GeminiCredentialPoolService(
      repository,
      new FakeLimiter(),
      cipher,
      ['env-key'],
      () => now
    );
    const handler = vi.fn(async (apiKey: string) => {
      if (apiKey === 'rate-limited') {
        throw Object.assign(new Error('quota'), {
          status: 429,
          response: { headers: { 'retry-after': '90' } },
        });
      }
      return apiKey;
    });

    await expect(pool.execute('DOCUMENT_EMBEDDING', handler)).resolves.toBe('healthy');
    expect(repository.failures[0]?.update.lastErrorCode).toBe('HTTP_429');
    expect(repository.failures[0]?.update.cooldownUntil?.toISOString()).toBe(
      '2026-10-14T10:01:30.000Z'
    );
  });

  it('disables an unauthorized dashboard key and uses env fallback', async () => {
    const repository = new FakeRepository();
    repository.candidates = [makeKey('db-1', 'invalid-key')];
    const pool = new GeminiCredentialPoolService(
      repository,
      new FakeLimiter(),
      cipher,
      ['env-key'],
      () => now
    );
    const handler = vi.fn(async (apiKey: string) => {
      if (apiKey === 'invalid-key') throw Object.assign(new Error('unauthorized'), { status: 401 });
      return apiKey;
    });

    await expect(pool.execute('GRADING_GENERATION', handler)).resolves.toBe('env-key');
    expect(repository.failures[0]?.update).toMatchObject({
      isActive: false,
      lastErrorCode: 'HTTP_401',
      cooldownUntil: null,
    });
  });

  it('releases the RPM slot when daily quota cannot be reserved', async () => {
    const repository = new FakeRepository();
    repository.candidates = [makeKey('db-1', 'quota-key')];
    repository.dailyReservations = [false];
    const limiter = new FakeLimiter();
    const pool = new GeminiCredentialPoolService(
      repository,
      limiter,
      cipher,
      ['env-key'],
      () => now
    );

    await expect(pool.execute('QUERY_EMBEDDING', async (apiKey) => apiKey)).resolves.toBe('env-key');
    expect(limiter.released).toHaveLength(1);
  });

  it('fails closed for dashboard keys when Redis fails but permits env fallback', async () => {
    const repository = new FakeRepository();
    repository.candidates = [makeKey('db-1', 'dashboard-key')];
    const limiter = new FakeLimiter();
    limiter.error = new Error('redis unavailable');
    const pool = new GeminiCredentialPoolService(
      repository,
      limiter,
      cipher,
      ['env-key'],
      () => now
    );

    await expect(pool.execute('CHAT_GENERATION', async (apiKey) => apiKey)).resolves.toBe('env-key');
  });

  it('disables an undecryptable dashboard key without exposing its ciphertext', async () => {
    const repository = new FakeRepository();
    const broken = makeKey('db-1', 'dashboard-key');
    repository.candidates = [new AiApiKey({
      id: broken.id,
      provider: broken.provider,
      keyAlias: broken.keyAlias,
      keyHint: broken.keyHint,
      encryptedSecret: broken.encryptedSecret,
      iv: broken.iv,
      authTag: '00'.repeat(16),
      encryptionVersion: broken.encryptionVersion,
      dailyRequestLimit: broken.dailyRequestLimit,
      currentRequestsToday: 0,
      usageDate: now,
      rpmLimit: broken.rpmLimit,
      consecutiveFailures: 0,
      isActive: true,
      cooldownUntil: null,
      lastErrorCode: null,
      lastUsedAt: null,
      createdAt: now,
      updatedAt: now,
    })];
    const pool = new GeminiCredentialPoolService(
      repository,
      new FakeLimiter(),
      cipher,
      ['env-key'],
      () => now
    );
    await expect(pool.execute('CHAT_GENERATION', async (apiKey) => apiKey)).resolves.toBe('env-key');
    expect(repository.failures[0]?.update).toMatchObject({
      isActive: false,
      lastErrorCode: 'DECRYPTION_FAILED',
    });
  });

  it('uses a thirty-second cooldown for the first transient failure', async () => {
    const repository = new FakeRepository();
    repository.candidates = [makeKey('db-1', 'unstable-key')];
    const pool = new GeminiCredentialPoolService(
      repository,
      new FakeLimiter(),
      cipher,
      ['env-key'],
      () => now
    );
    const handler = vi.fn(async (apiKey: string) => {
      if (apiKey === 'unstable-key') throw Object.assign(new Error('upstream'), { status: 503 });
      return apiKey;
    });
    await expect(pool.execute('QUERY_EMBEDDING', handler)).resolves.toBe('env-key');
    expect(repository.failures[0]?.update.cooldownUntil?.toISOString()).toBe(
      '2026-10-14T10:00:30.000Z'
    );
  });

  it('releases RPM and falls back when the daily quota store fails', async () => {
    const repository = new FakeRepository();
    repository.candidates = [makeKey('db-1', 'dashboard-key')];
    repository.dailyError = new Error('database unavailable');
    const limiter = new FakeLimiter();
    const pool = new GeminiCredentialPoolService(
      repository,
      limiter,
      cipher,
      ['env-key'],
      () => now
    );
    await expect(pool.execute('CHAT_GENERATION', async (apiKey) => apiKey)).resolves.toBe('env-key');
    expect(limiter.released).toHaveLength(1);
  });

  it('returns AI_PROVIDER_UNAVAILABLE when no dashboard or env key exists', async () => {
    const pool = new GeminiCredentialPoolService(
      new FakeRepository(),
      new FakeLimiter(),
      cipher,
      [],
      () => now
    );
    await expect(pool.execute('CHAT_GENERATION', async (apiKey) => apiKey)).rejects.toMatchObject({
      statusCode: 503,
      errorCode: 'AI_PROVIDER_UNAVAILABLE',
    });
  });

  it('rejects non-retryable provider requests without trying fallback keys', async () => {
    const repository = new FakeRepository();
    repository.candidates = [makeKey('db-1', 'dashboard-key')];
    const handler = vi.fn(async () => {
      throw Object.assign(new Error('bad request'), { statusCode: 400 });
    });
    const pool = new GeminiCredentialPoolService(
      repository,
      new FakeLimiter(),
      cipher,
      ['env-key'],
      () => now
    );
    await expect(pool.execute('CHAT_GENERATION', handler)).rejects.toMatchObject({
      errorCode: 'AI_PROVIDER_REQUEST_FAILED',
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('classifyGeminiFailure', () => {
  it('classifies authentication, rate limit, client and transient errors', () => {
    expect(classifyGeminiFailure({ status: 403 }).kind).toBe('AUTH');
    expect(classifyGeminiFailure({ status: 429 }).kind).toBe('RATE_LIMITED');
    expect(classifyGeminiFailure({ response: { status: 422 } }).kind).toBe('CLIENT');
    expect(classifyGeminiFailure(new Error('network'))).toMatchObject({ kind: 'TRANSIENT' });
  });
});
