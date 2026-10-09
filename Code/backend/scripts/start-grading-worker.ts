import { createGradingWorker } from '../src/infrastructure/queue/bullmq.worker.js';
import { SandboxService } from '../src/modules/sandbox/application/services/sandbox.service.js';
import { GradeSubmissionAiUseCase } from '../src/modules/ai/application/use-cases/grade-submission-ai.use-case.js';
import { PrismaAiGradingRepository } from '../src/modules/ai/infrastructure/repositories/prisma-ai-grading.repository.js';
import { ApiKeyRotatorFacade } from '../src/modules/ai/infrastructure/facades/api-key-rotator.facade.js';
import { PrismaAiApiKeyRepository } from '../src/modules/ai/infrastructure/repositories/prisma-ai-api-key.repository.js';
import { RagKnowledgeFacade } from '../src/modules/ai/infrastructure/facades/rag-knowledge.facade.js';
import prisma from '../src/infrastructure/database/prisma.client.js';

console.log('====================================================');
console.log('🚀 AITA BullMQ Grading Worker Starting...');
console.log('====================================================');

const aiUseCase = new GradeSubmissionAiUseCase(
  new PrismaAiGradingRepository(prisma),
  new ApiKeyRotatorFacade(new PrismaAiApiKeyRepository(prisma)),
  new RagKnowledgeFacade()
);

const worker = createGradingWorker({
  persistLifecycle: true,
  runSandbox: async (jobData) => {
    console.log(`[Worker] Running Sandbox (TV5) for submission: ${jobData.submissionId}`);
    const summary = await SandboxService.gradeSubmission(jobData.submissionId, jobData.language);
    return summary;
  },
  runAiGrading: async (jobData, sandboxResult) => {
    console.log(`[Worker] Running AI Grading (TV6) for submission: ${jobData.submissionId}`);
    const aiResult = await aiUseCase.execute(jobData.submissionId);
    return {
      rubricScore: aiResult.overallAiScore,
      aiScore: aiResult.overallAiScore,
      ...aiResult,
    };
  },
});

console.log('✅ AITA BullMQ Grading Worker is active and listening on "grading-queue"');

process.on('SIGINT', async () => {
  console.log('Shutting down grading worker...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
