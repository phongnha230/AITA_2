import { PrismaClient, ApiProvider as PrismaApiProvider } from '@prisma/client';
import {
  IAiApiKeyRepository,
  CreateAiApiKeyData,
} from '../../domain/repositories/ai-api-key.repository.interface.js';
import { AiApiKey, ApiProvider } from '../../domain/entities/ai-api-key.entity.js';

export class PrismaAiApiKeyRepository implements IAiApiKeyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: any): AiApiKey {
    return new AiApiKey({
      id: raw.id,
      provider: raw.provider,
      keyAlias: raw.keyAlias,
      keyHint: raw.keyHint,
      encryptedSecret: raw.encryptedSecret,
      iv: raw.iv,
      authTag: raw.authTag,
      dailyRequestLimit: raw.dailyRequestLimit,
      currentRequestsToday: raw.currentRequestsToday,
      rpmLimit: raw.rpmLimit,
      consecutiveFailures: raw.consecutiveFailures,
      isActive: raw.isActive,
      lastUsedAt: raw.lastUsedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findById(id: string): Promise<AiApiKey | null> {
    const raw = await this.prisma.aiApiKey.findUnique({ where: { id } });
    return raw ? this.toDomain(raw) : null;
  }

  async findAvailableKey(provider: ApiProvider = 'GEMINI'): Promise<AiApiKey | null> {
    const raw = await this.prisma.aiApiKey.findFirst({
      where: {
        provider,
        isActive: true,
        consecutiveFailures: { lt: 3 },
      },
      orderBy: [
        { currentRequestsToday: 'asc' },
        { lastUsedAt: 'asc' },
      ],
    });

    return raw ? this.toDomain(raw) : null;
  }

  async findAll(): Promise<AiApiKey[]> {
    const list = await this.prisma.aiApiKey.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return list.map((r) => this.toDomain(r));
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
        dailyRequestLimit: data.dailyRequestLimit ?? 1500,
        rpmLimit: data.rpmLimit ?? 60,
      },
    });

    return this.toDomain(raw);
  }

  async incrementUsage(id: string): Promise<void> {
    await this.prisma.aiApiKey.update({
      where: { id },
      data: {
        currentRequestsToday: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  }

  async recordFailure(id: string): Promise<void> {
    await this.prisma.aiApiKey.update({
      where: { id },
      data: {
        consecutiveFailures: { increment: 1 },
      },
    });
  }

  async resetConsecutiveFailures(id: string): Promise<void> {
    await this.prisma.aiApiKey.update({
      where: { id },
      data: {
        consecutiveFailures: 0,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.aiApiKey.delete({ where: { id } });
  }
}
