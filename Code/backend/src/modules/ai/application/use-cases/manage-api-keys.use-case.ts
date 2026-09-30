import { IAiApiKeyRepository } from '../../domain/repositories/ai-api-key.repository.interface.js';
import { CreateAiApiKeyInput } from '../dtos/ai-api-key.dto.js';
import { ApiKeyRotatorFacade } from '../../infrastructure/facades/api-key-rotator.facade.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class ManageApiKeysUseCase {
  constructor(private readonly apiKeyRepository: IAiApiKeyRepository) {}

  public async createKey(dto: CreateAiApiKeyInput) {
    const keyHint = `...${dto.rawApiKey.slice(-4)}`;
    const { encryptedSecret, iv, authTag } = ApiKeyRotatorFacade.encryptKey(dto.rawApiKey);

    const apiKey = await this.apiKeyRepository.create({
      provider: dto.provider,
      keyAlias: dto.keyAlias,
      keyHint,
      encryptedSecret,
      iv,
      authTag,
      dailyRequestLimit: dto.dailyRequestLimit,
      rpmLimit: dto.rpmLimit,
    });

    return apiKey.toJSON();
  }

  public async listKeys() {
    const keys = await this.apiKeyRepository.findAll();
    return keys.map((k) => k.toJSON());
  }

  public async deleteKey(id: string) {
    const key = await this.apiKeyRepository.findById(id);
    if (!key) {
      throw new NotFoundError(`API Key với ID: ${id}`);
    }

    await this.apiKeyRepository.delete(id);
    return { message: 'Đã xóa API Key thành công.' };
  }
}
