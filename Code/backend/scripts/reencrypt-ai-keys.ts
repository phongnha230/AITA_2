import prisma from '../src/infrastructure/database/prisma.client.js';
import { ReencryptAiKeysUseCase } from '../src/modules/ai/application/use-cases/reencrypt-ai-keys.use-case.js';
import { PrismaAiApiKeyRepository } from '../src/modules/ai/infrastructure/repositories/prisma-ai-api-key.repository.js';
import { ApiKeyCipherService } from '../src/modules/ai/infrastructure/security/api-key-cipher.service.js';

try {
  const useCase = new ReencryptAiKeysUseCase(
    new PrismaAiApiKeyRepository(prisma),
    new ApiKeyCipherService()
  );
  const summary = await useCase.execute();
  console.log(JSON.stringify({ event: 'ai_key_reencryption_completed', ...summary }));
} catch (error) {
  console.error(JSON.stringify({
    event: 'ai_key_reencryption_failed',
    error: error instanceof Error ? error.message : 'Unknown error',
  }));
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
