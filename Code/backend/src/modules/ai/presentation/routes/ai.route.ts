import { Router } from 'express';
import { AiGradingController } from '../controllers/ai-grading.controller.js';
import { AiTutorController } from '../controllers/ai-tutor.controller.js';
import { AiApiKeyController } from '../controllers/ai-api-key.controller.js';
import { GradeSubmissionAiUseCase } from '../../application/use-cases/grade-submission-ai.use-case.js';
import { StartTutorConversationUseCase } from '../../application/use-cases/start-tutor-conversation.use-case.js';
import { SendTutorMessageUseCase } from '../../application/use-cases/send-tutor-message.use-case.js';
import { GetTutorConversationUseCase } from '../../application/use-cases/get-tutor-conversation.use-case.js';
import { ManageApiKeysUseCase } from '../../application/use-cases/manage-api-keys.use-case.js';
import { PrismaAiGradingRepository } from '../../infrastructure/repositories/prisma-ai-grading.repository.js';
import { PrismaAiApiKeyRepository } from '../../infrastructure/repositories/prisma-ai-api-key.repository.js';
import { PrismaAiTutorRepository } from '../../infrastructure/repositories/prisma-ai-tutor.repository.js';
import { ApiKeyRotatorFacade } from '../../infrastructure/facades/api-key-rotator.facade.js';
import { RagKnowledgeFacade } from '../../infrastructure/facades/rag-knowledge.facade.js';
import prisma from '../../../../infrastructure/database/prisma.client.js';
import { authenticateJWT, authorizeRoles } from '../../../auth/presentation/middlewares/auth.middleware.js';
import { validateBody } from '../../../../shared/presentation/middlewares/validate.middleware.js';
import {
  StartTutorConversationSchema,
  SendTutorMessageSchema,
} from '../../application/dtos/ai-tutor.dto.js';
import { CreateAiApiKeySchema } from '../../application/dtos/ai-api-key.dto.js';

const router = Router();

// Composition Root for AI Module
const aiGradingRepository = new PrismaAiGradingRepository(prisma);
const aiApiKeyRepository = new PrismaAiApiKeyRepository(prisma);
const aiTutorRepository = new PrismaAiTutorRepository(prisma);

const apiKeyRotatorFacade = new ApiKeyRotatorFacade(aiApiKeyRepository);
const ragKnowledgeFacade = new RagKnowledgeFacade();

export const gradeSubmissionAiUseCase = new GradeSubmissionAiUseCase(
  aiGradingRepository,
  apiKeyRotatorFacade,
  ragKnowledgeFacade
);
const startTutorConversationUseCase = new StartTutorConversationUseCase(aiTutorRepository);
const sendTutorMessageUseCase = new SendTutorMessageUseCase(
  aiTutorRepository,
  apiKeyRotatorFacade
);
const getTutorConversationUseCase = new GetTutorConversationUseCase(aiTutorRepository);
const manageApiKeysUseCase = new ManageApiKeysUseCase(aiApiKeyRepository);

const aiGradingController = new AiGradingController(gradeSubmissionAiUseCase);
const aiTutorController = new AiTutorController(
  startTutorConversationUseCase,
  sendTutorMessageUseCase,
  getTutorConversationUseCase
);
const aiApiKeyController = new AiApiKeyController(manageApiKeysUseCase);

// 1. AI Grading Endpoints
router.post(
  '/grade/:submissionId',
  authenticateJWT,
  authorizeRoles('ADMIN', 'LECTURER'),
  aiGradingController.gradeSubmission
);

// 2. Socratic AI Tutor Endpoints
router.post(
  '/tutor/conversations',
  authenticateJWT,
  validateBody(StartTutorConversationSchema),
  aiTutorController.startConversation
);
router.get(
  '/tutor/conversations',
  authenticateJWT,
  aiTutorController.listMyConversations
);
router.get(
  '/tutor/conversations/:id',
  authenticateJWT,
  aiTutorController.getConversation
);
router.post(
  '/tutor/conversations/:id/messages',
  authenticateJWT,
  validateBody(SendTutorMessageSchema),
  aiTutorController.sendMessage
);

// 3. Admin AI API Key Management Endpoints
router.get(
  '/api-keys',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  aiApiKeyController.listKeys
);
router.post(
  '/api-keys',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  validateBody(CreateAiApiKeySchema),
  aiApiKeyController.createKey
);
router.patch(
  '/api-keys/:id/toggle',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  aiApiKeyController.toggleKey
);
router.delete(
  '/api-keys/:id',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  aiApiKeyController.deleteKey
);

export default router;
