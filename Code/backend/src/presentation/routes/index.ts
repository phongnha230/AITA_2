import { Router } from 'express';
import healthRouter from './health.route.js';
import authRouter from '../../modules/auth/presentation/routes/auth.route.js';
import userRouter from '../../modules/user/presentation/routes/user.route.js';
import courseRouter from '../../modules/course/presentation/routes/course.route.js';
import assignmentRouter from '../../modules/assignment/presentation/routes/assignment.route.js';
import submissionRouter from '../../modules/submission/presentation/routes/submission.route.js';
import sandboxRouter from '../../modules/sandbox/presentation/routes/sandbox.route.js';
import aiRouter from '../../modules/ai/presentation/routes/ai.route.js';

const router = Router();

// Mount Module Routes
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/courses', courseRouter);
router.use('/assignments', assignmentRouter);
router.use('/submissions', submissionRouter);
router.use('/sandbox', sandboxRouter);
router.use('/ai', aiRouter);

export default router;



