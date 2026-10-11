import { redisConnection } from '../../../../infrastructure/redis/redis.client.js';

export class OtpService {
  // Bộ nhớ tạm fallback nếu Redis không sẵn sàng
  private inMemoryOtpMap = new Map<string, { code: string; expiresAt: number }>();

  private getKey(email: string): string {
    return `aita:otp:${email.trim().toLowerCase()}`;
  }

  public async saveOtp(email: string, otp: string, ttlSeconds: number = 300): Promise<void> {
    const key = this.getKey(email);
    try {
      if (redisConnection.status === 'ready' || redisConnection.status === 'connecting') {
        await redisConnection.set(key, otp, 'EX', ttlSeconds);
        return;
      }
    } catch (err) {
      console.warn('⚠️ [OtpService] Redis không sẵn sàng, chuyển sang bộ nhớ tạm:', err);
    }

    // Fallback in-memory
    this.inMemoryOtpMap.set(key, {
      code: otp,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  public async verifyOtp(email: string, inputOtp: string): Promise<boolean> {
    const key = this.getKey(email);
    const trimmedInput = inputOtp.trim();

    // 1. Thử đọc từ Redis
    try {
      if (redisConnection.status === 'ready' || redisConnection.status === 'connecting') {
        const storedOtp = await redisConnection.get(key);
        if (storedOtp && storedOtp === trimmedInput) {
          await redisConnection.del(key);
          return true;
        }
      }
    } catch (err) {
      console.warn('⚠️ [OtpService] Lỗi kết nối Redis khi verify OTP:', err);
    }

    // 2. Thử đọc từ in-memory fallback
    const memEntry = this.inMemoryOtpMap.get(key);
    if (memEntry) {
      if (Date.now() <= memEntry.expiresAt && memEntry.code === trimmedInput) {
        this.inMemoryOtpMap.delete(key);
        return true;
      }
      if (Date.now() > memEntry.expiresAt) {
        this.inMemoryOtpMap.delete(key);
      }
    }

    // 3. Cho phép mã mẫu 123456 trong môi trường dev nếu chưa có mã thực
    if (process.env.NODE_ENV !== 'production' && trimmedInput === '123456') {
      return true;
    }

    return false;
  }
}

export const otpService = new OtpService();
