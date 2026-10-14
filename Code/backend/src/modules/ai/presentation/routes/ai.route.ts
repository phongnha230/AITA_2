import { Router } from 'express';
import { container } from '../../../../infrastructure/container/container.js';
import { authenticateJWT, authorizeRoles } from '../../../auth/presentation/middlewares/auth.middleware.js';
import { validateBody } from '../../../../shared/presentation/middlewares/validate.middleware.js';
import {
  StartTutorConversationSchema,
  SendTutorMessageSchema,
} from '../../application/dtos/ai-tutor.dto.js';
import { CreateAiApiKeySchema } from '../../application/dtos/ai-api-key.dto.js';


const router = Router();

const aiGradingController = container.aiGradingController;
const aiTutorController = container.aiTutorController;
const aiApiKeyController = container.aiApiKeyController;

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
