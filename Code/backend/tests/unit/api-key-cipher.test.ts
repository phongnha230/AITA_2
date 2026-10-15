import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  AI_KEY_ENCRYPTION_VERSION,
  ApiKeyCipherService,
} from '../../src/modules/ai/infrastructure/security/api-key-cipher.service.js';

const currentKey = Buffer.alloc(32, 9).toString('base64');
const legacySecret = 'legacy-jwt-secret-at-least-32-characters';

const encryptLegacy = (rawKey: string) => {
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

describe('ApiKeyCipherService', () => {
  it('encrypts new keys as version 2 and decrypts them', () => {
    const cipher = new ApiKeyCipherService(currentKey, legacySecret);
    const encrypted = cipher.encrypt('gemini-secret-key');
    expect(encrypted.encryptionVersion).toBe(AI_KEY_ENCRYPTION_VERSION);
    expect(encrypted.encryptedSecret).not.toContain('gemini-secret-key');
    expect(cipher.decrypt(encrypted)).toBe('gemini-secret-key');
  });

  it('decrypts legacy version 1 keys during rollout', () => {
    const cipher = new ApiKeyCipherService(currentKey, legacySecret);
    expect(cipher.decrypt(encryptLegacy('legacy-gemini-key'))).toBe('legacy-gemini-key');
  });

  it('rejects tampered ciphertext and unsupported versions', () => {
    const cipher = new ApiKeyCipherService(currentKey, legacySecret);
    const encrypted = cipher.encrypt('gemini-secret-key');
    expect(() => cipher.decrypt({ ...encrypted, authTag: '00'.repeat(16) })).toThrow();
    expect(() => cipher.decrypt({ ...encrypted, encryptionVersion: 99 })).toThrow(
      'Unsupported AI key encryption version'
    );
  });

  it('fails safely when version 2 encryption is not configured', () => {
    const cipher = new ApiKeyCipherService('', legacySecret);
    expect(() => cipher.encrypt('secret')).toThrow('AI key encryption is not configured');
  });
});
