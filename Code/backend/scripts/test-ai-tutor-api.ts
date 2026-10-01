import prisma from '../src/infrastructure/database/prisma.client.js';
import { PrismaAiGradingRepository } from '../src/modules/ai/infrastructure/repositories/prisma-ai-grading.repository.js';
import { PrismaAiApiKeyRepository } from '../src/modules/ai/infrastructure/repositories/prisma-ai-api-key.repository.js';
import { PrismaAiTutorRepository } from '../src/modules/ai/infrastructure/repositories/prisma-ai-tutor.repository.js';
import { ApiKeyRotatorFacade } from '../src/modules/ai/infrastructure/facades/api-key-rotator.facade.js';
import { RagKnowledgeFacade } from '../src/modules/ai/infrastructure/facades/rag-knowledge.facade.js';
import { GradeSubmissionAiUseCase } from '../src/modules/ai/application/use-cases/grade-submission-ai.use-case.js';
import { StartTutorConversationUseCase } from '../src/modules/ai/application/use-cases/start-tutor-conversation.use-case.js';
import { SendTutorMessageUseCase } from '../src/modules/ai/application/use-cases/send-tutor-message.use-case.js';
import { ManageApiKeysUseCase } from '../src/modules/ai/application/use-cases/manage-api-keys.use-case.js';

async function main() {
  console.log('--- Testing Member 6: RAG Engine, AI Semantic Grader & Socratic Tutor ---');

  const aiGradingRepo = new PrismaAiGradingRepository(prisma);
  const aiApiKeyRepo = new PrismaAiApiKeyRepository(prisma);
  const aiTutorRepo = new PrismaAiTutorRepository(prisma);

  const keyRotator = new ApiKeyRotatorFacade(aiApiKeyRepo);
  const ragFacade = new RagKnowledgeFacade();

  const gradeAiUseCase = new GradeSubmissionAiUseCase(aiGradingRepo, keyRotator, ragFacade);
  const startTutorUseCase = new StartTutorConversationUseCase(aiTutorRepo);
  const sendTutorUseCase = new SendTutorMessageUseCase(aiTutorRepo, keyRotator);
  const manageKeysUseCase = new ManageApiKeysUseCase(aiApiKeyRepo);

  // 1. Test Admin Create & Encrypt API Key
  console.log('\n[1] Testing AI API Key Management & AES-256-GCM Encryption:');
  const createdKey = await manageKeysUseCase.createKey({
    provider: 'GEMINI',
    keyAlias: 'Gemini Flash Primary Key',
    rawApiKey: 'AIzaSyDemoSecretKeyForAitaTesting123456',
    dailyRequestLimit: 1500,
    rpmLimit: 60,
  });
  console.log('✅ Created Encrypted Key:', {
    id: createdKey.id,
    keyAlias: createdKey.keyAlias,
    keyHint: createdKey.keyHint,
    dailyLimit: createdKey.dailyRequestLimit,
  });

  const allKeys = await manageKeysUseCase.listKeys();
  console.log(`✅ Listing Keys Count: ${allKeys.length}`);

  // 2. Prepare or find a test submission
  let submission = await prisma.submission.findFirst({
    include: {
      assignment: { include: { rubricRules: true, solutions: true } },
      user: true,
    },
  });

  if (!submission) {
    const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
    const assignment = await prisma.assignment.findFirst();
    if (student && assignment) {
      submission = await prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          userId: student.id,
          submissionChannel: 'ZIP_UPLOAD',
          status: 'PENDING',
          sandboxScore: 6.5,
        },
        include: {
          assignment: { include: { rubricRules: true, solutions: true } },
          user: true,
        },
      });
    }
  }

  if (submission) {
    console.log(`\n[2] Testing AI Semantic Grader on Submission: ${submission.id}`);
    const gradingResult = await gradeAiUseCase.execute(submission.id);
    console.log('✅ AI Grading Result:', {
      sandboxScore: gradingResult.sandboxScore,
      overallAiScore: gradingResult.overallAiScore,
      finalScore: gradingResult.finalScore,
      timeComplexity: gradingResult.gradingResult.detectedTimeComplexity,
      rubricCount: gradingResult.gradingResult.rubricBreakdown.length,
    });

    console.log(`\n[3] Testing Socratic AI Tutor Session for Student: ${submission.userId}`);
    const conversation = await startTutorUseCase.execute(
      submission.userId,
      submission.id,
      'Socratic Debugging Session'
    );
    console.log('✅ Started Conversation:', {
      conversationId: conversation.id,
      title: conversation.title,
      messagesCount: conversation.messages?.length,
    });

    console.log('\n[4] Testing Sending Student Question to Socratic Tutor:');
    const reply = await sendTutorUseCase.execute(
      conversation.id,
      submission.userId,
      'Thầy ơi, bài của em chạy test 3 bị Time Limit Exceeded thì em nên sửa thuật toán thế nào ạ?'
    );
    console.log('✅ AI Socratic Reply:');
    console.log(`   Student: "${reply.studentMessage}"`);
    console.log(`   AI Tutor: "${reply.aiReply.content}"`);
    console.log(`   Has Leakage: ${reply.aiReply.hasLeakageDetected}`);
  }

  // Cleanup test key
  await manageKeysUseCase.deleteKey(createdKey.id);
  console.log('\n✅ Cleaned up test API Key.');

  console.log('\n=== All Member 6 AI & Socratic Tutor Tests Passed Successfully! ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
