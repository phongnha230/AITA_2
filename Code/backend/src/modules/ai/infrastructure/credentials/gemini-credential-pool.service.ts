import { AppError } from '../../../../shared/domain/exceptions/app.error.js';
import { env } from '../../../../infrastructure/config/env.js';
import { logger } from '../../../../infrastructure/logging/logger.js';
import { IAiApiKeyRepository } from '../../domain/repositories/ai-api-key.repository.interface.js';
import {
  GeminiOperation,
  IGeminiCredentialPool,
} from '../../application/services/gemini-credential-pool.interface.js';
import { IApiKeyCipher } from '../security/api-key-cipher.service.js';
import { IRpmLimiter } from './redis-rpm-limiter.js';

type FailureKind = 'AUTH' | 'RATE_LIMITED' | 'TRANSIENT' | 'CLIENT';

interface ClassifiedFailure {
  kind: FailureKind;
  code: string;
  retryAfterMs?: number;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;

const numericStatus = (value: unknown): number | null => {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(number) && number >= 100 && number <= 599 ? number : null;
};

const getErrorStatus = (error: unknown): number | null => {
  const record = asRecord(error);
  if (!record) return null;
  const direct = numericStatus(record.status) ?? numericStatus(record.statusCode) ?? numericStatus(record.code);
  if (direct) return direct;
  return numericStatus(asRecord(record.response)?.status);
};

const parseRetryAfterMs = (error: unknown): number | undefined => {
  const response = asRecord(asRecord(error)?.response);
  const headers = asRecord(response?.headers);
  const raw = headers?.['retry-after'];
  const seconds = typeof raw === 'string' || typeof raw === 'number' ? Number(raw) : Number.NaN;
  return Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds * 1_000, 15 * 60_000) : undefined;
};

export const classifyGeminiFailure = (error: unknown): ClassifiedFailure => {
  const status = getErrorStatus(error);
  if (status === 401 || status === 403) return { kind: 'AUTH', code: `HTTP_${status}` };
  if (status === 429) {
    return { kind: 'RATE_LIMITED', code: 'HTTP_429', retryAfterMs: parseRetryAfterMs(error) };
  }
  if (status !== null && status >= 400 && status < 500) {
    return { kind: 'CLIENT', code: `HTTP_${status}` };
  }
  return { kind: 'TRANSIENT', code: status ? `HTTP_${status}` : 'PROVIDER_TRANSIENT' };
};

const utcDayStart = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const transientCooldownMs = (failureCount: number): number => {
  if (failureCount <= 1) return 30_000;
  if (failureCount === 2) return 120_000;
  return 300_000;
};

export const getEnvFallbackKeys = (): string[] => {
  if (!env.GEMINI_ENV_KEY_FALLBACK) return [];
  return [...new Set([
    env.GEMINI_API_KEY.trim(),
    ...env.GEMINI_API_KEYS.split(',').map((key) => key.trim()),
  ].filter(Boolean))];
};

export class GeminiCredentialPoolService implements IGeminiCredentialPool {
  constructor(
    private readonly repository: IAiApiKeyRepository,
    private readonly rpmLimiter: IRpmLimiter,
    private readonly cipher: IApiKeyCipher,
    private readonly fallbackKeys: string[] = getEnvFallbackKeys(),
    private readonly clock: () => Date = () => new Date()
  ) {}

  public async execute<T>(
    operation: GeminiOperation,
    handler: (apiKey: string) => Promise<T>
  ): Promise<T> {
    let dashboardUnavailable = false;
    try {
      const candidates = await this.repository.findCandidates('GEMINI');
      for (const candidate of candidates) {
        if (!candidate.isAvailable()) continue;

        let rawApiKey: string;
        try {
          rawApiKey = this.cipher.decrypt({
            encryptedSecret: candidate.encryptedSecret,
            iv: candidate.iv,
            authTag: candidate.authTag,
            encryptionVersion: candidate.encryptionVersion,
          });
        } catch (error) {
          await this.repository.recordFailure(candidate.id, {
            consecutiveFailures: candidate.consecutiveFailures + 1,
            cooldownUntil: null,
            lastErrorCode: 'DECRYPTION_FAILED',
            isActive: false,
          });
          logger.error('gemini_dashboard_key_decryption_failed', {
            stage: 'AI_CREDENTIAL_POOL',
            keyId: candidate.id,
            operation,
            error,
          });
          continue;
        }

        const now = this.clock();
        let reservation;
        try {
          reservation = await this.rpmLimiter.reserve(candidate.id, candidate.rpmLimit, now);
        } catch (error) {
          dashboardUnavailable = true;
          logger.error('gemini_dashboard_rpm_store_failed', {
            stage: 'AI_CREDENTIAL_POOL',
            operation,
            error,
          });
          break;
        }
        if (!reservation) continue;

        let dailyReserved: boolean;
        try {
          dailyReserved = await this.repository.reserveDailyUsage(
            candidate.id,
            utcDayStart(now),
            now
          );
        } catch (error) {
          await this.rpmLimiter.release(reservation);
          dashboardUnavailable = true;
          logger.error('gemini_dashboard_daily_quota_store_failed', {
            stage: 'AI_CREDENTIAL_POOL',
            keyId: candidate.id,
            operation,
            error,
          });
          break;
        }
        if (!dailyReserved) {
          await this.rpmLimiter.release(reservation);
          continue;
        }

        try {
          const result = await handler(rawApiKey);
          try {
            await this.repository.recordSuccess(candidate.id);
          } catch (error) {
            logger.error('gemini_dashboard_success_metric_failed', {
              stage: 'AI_CREDENTIAL_POOL',
              keyId: candidate.id,
              operation,
              error,
            });
          }
          return result;
        } catch (error) {
          const failure = classifyGeminiFailure(error);
          if (failure.kind === 'CLIENT') {
            throw new AppError('Gemini rejected the request.', 502, 'AI_PROVIDER_REQUEST_FAILED');
          }

          const failureCount = candidate.consecutiveFailures + 1;
          const cooldownMs = failure.kind === 'RATE_LIMITED'
            ? failure.retryAfterMs ?? 60_000
            : transientCooldownMs(failureCount);
          await this.repository.recordFailure(candidate.id, {
            consecutiveFailures: failureCount,
            cooldownUntil: failure.kind === 'AUTH'
              ? null
              : new Date(this.clock().getTime() + cooldownMs),
            lastErrorCode: failure.code,
            ...(failure.kind === 'AUTH' ? { isActive: false } : {}),
          });
          logger.warn('gemini_dashboard_key_failed', {
            stage: 'AI_PROVIDER',
            keyId: candidate.id,
            keyAlias: candidate.keyAlias,
            operation,
            failureCode: failure.code,
          });
        }
      }
    } catch (error) {
      if (error instanceof AppError && error.errorCode === 'AI_PROVIDER_REQUEST_FAILED') {
        throw error;
      }
      dashboardUnavailable = true;
      logger.error('gemini_dashboard_pool_failed', {
        stage: 'AI_CREDENTIAL_POOL',
        operation,
        error,
      });
    }

    for (const [index, apiKey] of this.fallbackKeys.entries()) {
      try {
        return await handler(apiKey);
      } catch (error) {
        const failure = classifyGeminiFailure(error);
        logger.warn('gemini_env_fallback_failed', {
          stage: 'AI_PROVIDER',
          operation,
          envKeyIndex: index,
          failureCode: failure.code,
        });
        if (failure.kind === 'CLIENT') {
          throw new AppError('Gemini rejected the request.', 502, 'AI_PROVIDER_REQUEST_FAILED');
        }
      }
    }

    throw new AppError(
      dashboardUnavailable
        ? 'Gemini credential pool is temporarily unavailable.'
        : 'No Gemini API key is currently available.',
      503,
      'AI_PROVIDER_UNAVAILABLE'
    );
  }
}
