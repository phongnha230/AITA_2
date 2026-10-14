import { IAiApiKeyRepository } from '../../domain/repositories/ai-api-key.repository.interface.js';
import { IApiKeyCipher } from '../../infrastructure/security/api-key-cipher.service.js';

export interface ReencryptAiKeysResult {
  discovered: number;
  migrated: number;
  disabled: number;
}

export class ReencryptAiKeysUseCase {
  constructor(
    private readonly repository: IAiApiKeyRepository,
    private readonly cipher: IApiKeyCipher
  ) {}

  public async execute(): Promise<ReencryptAiKeysResult> {
    const legacyKeys = (await this.repository.findAll()).filter(
      (key) => key.encryptionVersion === 1
    );
    const result: ReencryptAiKeysResult = {
      discovered: legacyKeys.length,
      migrated: 0,
      disabled: 0,
    };

    for (const key of legacyKeys) {
      try {
        const rawApiKey = this.cipher.decrypt({
          encryptedSecret: key.encryptedSecret,
          iv: key.iv,
          authTag: key.authTag,
          encryptionVersion: key.encryptionVersion,
        });
        await this.repository.updateEncryptedSecret(key.id, this.cipher.encrypt(rawApiKey));
        result.migrated += 1;
      } catch {
        await this.repository.markMigrationFailure(key.id);
        result.disabled += 1;
      }
    }
    return result;
  }
}
