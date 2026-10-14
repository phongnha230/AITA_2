import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';
import { container } from '../../infrastructure/container/container.js';

const router = Router();
const healthController: HealthController = container.healthController;

router.get('/', healthController.checkHealth);

export default router;
