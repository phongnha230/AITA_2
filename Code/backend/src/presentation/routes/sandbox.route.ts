import { Router } from 'express';
import { SandboxController } from '../controllers/sandbox.controller.js';

const router = Router();

// GET /api/v1/sandbox/status
router.get('/status', SandboxController.getStatus);

// POST /api/v1/sandbox/execute
router.post('/execute', SandboxController.executeCode);

// POST /api/v1/sandbox/grade/:submissionId
router.post('/grade/:submissionId', SandboxController.gradeSubmission);

export default router;
