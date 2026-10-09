import { Router } from 'express';
import { SandboxController } from '../controllers/sandbox.controller.js';
import { authenticateJWT, authorizeRoles } from '../../../auth/presentation/middlewares/auth.middleware.js';

const router = Router();

// 1. Kiểm tra trạng thái máy chủ Sandbox (public — thông tin không nhạy cảm)
router.get('/status', SandboxController.getStatus);

// 2. Chạy thử nghiệm Sandbox trực tiếp qua code gửi lên
//    Yêu cầu đăng nhập để ngăn RCE từ unauthenticated bên ngoài
router.post(
  '/execute',
  authenticateJWT,
  authorizeRoles('ADMIN', 'LECTURER', 'STUDENT'),
  SandboxController.executeCode
);

// 3. Chấm điểm bài nộp theo ID trong CSDL
router.post(
  '/grade/:submissionId',
  authenticateJWT,
  authorizeRoles('ADMIN', 'LECTURER'),
  SandboxController.gradeSubmission
);

export default router;
