import crypto from 'node:crypto';
import { env } from '../../../../infrastructure/config/env.js';
import { AppError } from '../../../../shared/domain/exceptions/app.error.js';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
export const AI_KEY_ENCRYPTION_VERSION = 2;

export interface EncryptedApiKeySecret {
  encryptedSecret: string;
  iv: string;
  authTag: string;
  encryptionVersion: number;
}

export interface IApiKeyCipher {
  encrypt(rawKey: string): EncryptedApiKeySecret;
  decrypt(secret: EncryptedApiKeySecret): string;
}

const decryptWithKey = (secret: EncryptedApiKeySecret, key: Buffer): string => {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    key,
    Buffer.from(secret.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(secret.authTag, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(secret.encryptedSecret, 'hex')),
    decipher.final(),
  ]).toString('utf8');
};

export class ApiKeyCipherService implements IApiKeyCipher {
  private readonly legacyKey: Buffer;
  private readonly configuredCurrentKey: string;

  constructor(
    currentKeyBase64: string = env.AI_KEY_ENCRYPTION_KEY,
    legacySecret: string = env.JWT_SECRET
  ) {
    this.configuredCurrentKey = currentKeyBase64;
    this.legacyKey = crypto.createHash('sha256').update(legacySecret).digest();
  }

  private currentKey(): Buffer {
    if (!this.configuredCurrentKey) {
      throw new AppError(
        'AI key encryption is not configured.',
        503,
        'AI_KEY_ENCRYPTION_UNAVAILABLE'
      );
    }
    return Buffer.from(this.configuredCurrentKey, 'base64');
  }

  public encrypt(rawKey: string): EncryptedApiKeySecret {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, this.currentKey(), iv);
    const encrypted = Buffer.concat([cipher.update(rawKey, 'utf8'), cipher.final()]);
    return {
      encryptedSecret: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex'),
      encryptionVersion: AI_KEY_ENCRYPTION_VERSION,
    };
  }

  public decrypt(secret: EncryptedApiKeySecret): string {
    if (secret.encryptionVersion === 1) return decryptWithKey(secret, this.legacyKey);
    if (secret.encryptionVersion === AI_KEY_ENCRYPTION_VERSION) {
      return decryptWithKey(secret, this.currentKey());
    }
    throw new AppError('Unsupported AI key encryption version.', 500, 'AI_KEY_VERSION_UNSUPPORTED');
  }
}
