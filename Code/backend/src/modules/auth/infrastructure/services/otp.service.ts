import { createHmac, randomBytes, randomInt } from 'node:crypto';
import { redisConnection } from '../../../../infrastructure/redis/redis.client.js';
import { env } from '../../../../infrastructure/config/env.js';
import { AppError } from '../../../../shared/domain/exceptions/app.error.js';

interface InMemoryOtp {
  hash: string;
  attempts: number;
  expiresAt: number;
}

interface InMemoryChallenge {
  email: string;
  expiresAt: number;
}

export class OtpService {
  private readonly inMemoryOtpMap = new Map<string, InMemoryOtp>();
  private readonly inMemoryChallengeMap = new Map<string, InMemoryChallenge>();

  private getKey(email: string): string {
    return `aita:otp:${email.trim().toLowerCase()}`;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private hashOtp(email: string, otp: string): string {
    return createHmac('sha256', env.JWT_SECRET)
      .update(`${this.normalizeEmail(email)}:${otp}`, 'utf8')
      .digest('hex');
  }

  private canUseMemoryFallback(): boolean {
    return env.NODE_ENV !== 'production' && env.ALLOW_IN_MEMORY_AUTH_CHALLENGES;
  }

  public generateOtp(): string {
    if (env.NODE_ENV !== 'production' && env.DEV_FIXED_OTP) return env.DEV_FIXED_OTP;
    return randomInt(100000, 1000000).toString();
  }

  public async saveOtp(email: string, otp: string, ttlSeconds: number = 300): Promise<void> {
    const key = this.getKey(email);
    const entry = JSON.stringify({ hash: this.hashOtp(email, otp), attempts: 5 });
    try {
      if (redisConnection.status === 'ready') {
        await redisConnection.set(key, entry, 'EX', ttlSeconds);
        return;
      }
    } catch (err) {
      console.error('[OtpService] Redis unavailable while saving OTP', err);
    }

    if (!this.canUseMemoryFallback()) {
      throw new AppError('Dịch vụ xác thực tạm thời không khả dụng.', 503, 'AUTH_STORE_UNAVAILABLE');
    }
    this.inMemoryOtpMap.set(key, {
      hash: this.hashOtp(email, otp),
      attempts: 5,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  public async verifyOtp(email: string, inputOtp: string): Promise<boolean> {
    const key = this.getKey(email);
    const candidateHash = this.hashOtp(email, inputOtp.trim());

    // 1. Thử đọc từ Redis
    try {
      if (redisConnection.status === 'ready') {
        const result = await redisConnection.eval(
          `local raw = redis.call('GET', KEYS[1])
           if not raw then return 0 end
           local entry = cjson.decode(raw)
           if entry.hash == ARGV[1] then
             redis.call('DEL', KEYS[1])
             return 1
           end
           entry.attempts = entry.attempts - 1
           if entry.attempts <= 0 then
             redis.call('DEL', KEYS[1])
           else
             local ttl = redis.call('TTL', KEYS[1])
             if ttl > 0 then redis.call('SET', KEYS[1], cjson.encode(entry), 'EX', ttl) end
           end
           return 0`,
          1,
          key,
          candidateHash
        );
        return result === 1;
      }
    } catch (err) {
      console.error('[OtpService] Redis unavailable while verifying OTP', err);
    }

    if (!this.canUseMemoryFallback()) {
      throw new AppError('Dịch vụ xác thực tạm thời không khả dụng.', 503, 'AUTH_STORE_UNAVAILABLE');
    }
    const memEntry = this.inMemoryOtpMap.get(key);
    if (memEntry) {
      if (Date.now() <= memEntry.expiresAt && memEntry.hash === candidateHash) {
        this.inMemoryOtpMap.delete(key);
        return true;
      }
      memEntry.attempts -= 1;
      if (Date.now() > memEntry.expiresAt) {
        this.inMemoryOtpMap.delete(key);
      } else if (memEntry.attempts <= 0) {
        this.inMemoryOtpMap.delete(key);
      }
    }
    return false;
  }

  public async createRegistrationChallenge(email: string, ttlSeconds: number = 600): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    const key = `aita:registration:${this.hashOpaqueToken(token)}`;
    const normalizedEmail = this.normalizeEmail(email);
    try {
      if (redisConnection.status === 'ready') {
        await redisConnection.set(key, normalizedEmail, 'EX', ttlSeconds);
        return token;
      }
    } catch (error) {
      console.error('[OtpService] Redis unavailable while creating registration challenge', error);
    }
    if (!this.canUseMemoryFallback()) {
      throw new AppError('Dịch vụ xác thực tạm thời không khả dụng.', 503, 'AUTH_STORE_UNAVAILABLE');
    }
    this.inMemoryChallengeMap.set(key, {
      email: normalizedEmail,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    return token;
  }

  public async consumeRegistrationChallenge(token: string, email: string): Promise<boolean> {
    const key = `aita:registration:${this.hashOpaqueToken(token)}`;
    const normalizedEmail = this.normalizeEmail(email);
    try {
      if (redisConnection.status === 'ready') {
        const result = await redisConnection.eval(
          `local value = redis.call('GET', KEYS[1])
           if value and value == ARGV[1] then
             redis.call('DEL', KEYS[1])
             return 1
           end
           return 0`,
          1,
          key,
          normalizedEmail
        );
        return result === 1;
      }
    } catch (error) {
      console.error('[OtpService] Redis unavailable while consuming registration challenge', error);
    }
    if (!this.canUseMemoryFallback()) {
      throw new AppError('Dịch vụ xác thực tạm thời không khả dụng.', 503, 'AUTH_STORE_UNAVAILABLE');
    }
    const challenge = this.inMemoryChallengeMap.get(key);
    if (!challenge || challenge.expiresAt < Date.now() || challenge.email !== normalizedEmail) {
      this.inMemoryChallengeMap.delete(key);
      return false;
    }
    this.inMemoryChallengeMap.delete(key);
    return true;
  }

  private hashOpaqueToken(token: string): string {
    return createHmac('sha256', env.JWT_SECRET).update(token, 'utf8').digest('hex');
  }
}

export const otpService = new OtpService();
