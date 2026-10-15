import {
  AiApiKey as PrismaAiApiKey,
  PrismaClient,
  ApiProvider as PrismaApiProvider,
} from '@prisma/client';
import {
  IAiApiKeyRepository,
  CreateAiApiKeyData,
  AiKeyFailureUpdate,
  EncryptedSecretUpdate,
} from '../../domain/repositories/ai-api-key.repository.interface.js';
import { AiApiKey, ApiProvider } from '../../domain/entities/ai-api-key.entity.js';

export class PrismaAiApiKeyRepository implements IAiApiKeyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: PrismaAiApiKey): AiApiKey {
    return new AiApiKey({
      id: raw.id,
      provider: raw.provider,
      keyAlias: raw.keyAlias,
      keyHint: raw.keyHint,
      encryptedSecret: raw.encryptedSecret,
      iv: raw.iv,
      authTag: raw.authTag,
      encryptionVersion: raw.encryptionVersion,
      dailyRequestLimit: raw.dailyRequestLimit,
      currentRequestsToday: raw.currentRequestsToday,
      usageDate: raw.usageDate,
      rpmLimit: raw.rpmLimit,
      consecutiveFailures: raw.consecutiveFailures,
      isActive: raw.isActive,
      cooldownUntil: raw.cooldownUntil,
      lastErrorCode: raw.lastErrorCode,
      lastUsedAt: raw.lastUsedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findById(id: string): Promise<AiApiKey | null> {
    const raw = await this.prisma.aiApiKey.findUnique({ where: { id } });
    return raw ? this.toDomain(raw) : null;
  }

  async findCandidates(provider: ApiProvider = 'GEMINI', now: Date = new Date()): Promise<AiApiKey[]> {
    const rows = await this.prisma.aiApiKey.findMany({
      where: {
        provider,
        isActive: true,
        OR: [{ cooldownUntil: null }, { cooldownUntil: { lte: now } }],
      },
      orderBy: [
        { currentRequestsToday: 'asc' },
        { lastUsedAt: 'asc' },
      ],
    });

    return rows.map((row) => this.toDomain(row));
  }

  async findAll(): Promise<AiApiKey[]> {
    const list = await this.prisma.aiApiKey.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return list.map((key) => this.toDomain(key));
  }

  async create(data: CreateAiApiKeyData): Promise<AiApiKey> {
    const raw = await this.prisma.aiApiKey.create({
      data: {
        provider: data.provider,
        keyAlias: data.keyAlias,
        keyHint: data.keyHint,
        encryptedSecret: data.encryptedSecret,
        iv: data.iv,
        authTag: data.authTag,
        encryptionVersion: data.encryptionVersion,
        dailyRequestLimit: data.dailyRequestLimit ?? 1500,
        rpmLimit: data.rpmLimit ?? 60,
      },
    });

    return this.toDomain(raw);
  }

  async reserveDailyUsage(id: string, utcDay: Date, now: Date): Promise<boolean> {
    const updated = await this.prisma.$executeRaw`
      UPDATE ai_api_keys
      SET current_requests_today = CASE
            WHEN usage_date IS NULL OR usage_date < ${utcDay} THEN 1
            ELSE current_requests_today + 1
          END,
          usage_date = ${utcDay},
          last_used_at = ${now}
      WHERE id = ${id}
        AND is_active = 1
        AND (cooldown_until IS NULL OR cooldown_until <= ${now})
        AND (
          usage_date IS NULL
          OR usage_date < ${utcDay}
          OR current_requests_today < daily_request_limit
        )
    `;
    return updated === 1;
  }

  async recordFailure(id: string, update: AiKeyFailureUpdate): Promise<void> {
    await this.prisma.aiApiKey.update({
      where: { id },
      data: {
        consecutiveFailures: update.consecutiveFailures,
        cooldownUntil: update.cooldownUntil,
        lastErrorCode: update.lastErrorCode,
        ...(typeof update.isActive === 'boolean' ? { isActive: update.isActive } : {}),
      },
    });
  }

  async recordSuccess(id: string): Promise<void> {
    await this.prisma.aiApiKey.update({
      where: { id },
      data: {
        consecutiveFailures: 0,
        cooldownUntil: null,
        lastErrorCode: null,
      },
    });
  }

  async updateEncryptedSecret(id: string, update: EncryptedSecretUpdate): Promise<void> {
    await this.prisma.aiApiKey.update({ where: { id }, data: update });
  }

  async markMigrationFailure(id: string): Promise<void> {
    await this.prisma.aiApiKey.updateMany({
      where: { id, encryptionVersion: 1 },
      data: { isActive: false, lastErrorCode: 'LEGACY_DECRYPTION_FAILED' },
    });
  }

  async update(id: string, data: Partial<{ isActive: boolean; rpmLimit: number; dailyRequestLimit: number }>): Promise<AiApiKey> {
    const raw = await this.prisma.aiApiKey.update({
      where: { id },
      data,
    });
    return this.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.aiApiKey.delete({ where: { id } });
  }
}
