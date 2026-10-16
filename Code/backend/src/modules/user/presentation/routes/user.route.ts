import { Router } from 'express';
import { container } from '../../../../infrastructure/container/container.js';
import { authenticateJWT, authorizeRoles } from '../../../auth/presentation/middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../../../../shared/presentation/middlewares/validate.middleware.js';
import { uploadImageMiddleware } from '../../../../infrastructure/storage/upload.middleware.js';
import {
  UpdateProfileSchema,
  QueryUsersSchema,
  AdminCreateUserSchema,
  AdminCreateBatchUsersSchema,
  AdminUpdateUserSchema,
} from '../../application/dtos/user.dto.js';
import { AdminResetPasswordSchema } from '../../../auth/application/dtos/auth.dto.js';


const router = Router();

const userController = container.userController;

// --- 1. User & Lecturer Self-Service Endpoints ---
router.get('/profile', authenticateJWT, userController.getProfile);
router.get('/portfolio', authenticateJWT, userController.getStudentPortfolio);
router.get('/lecturer-dashboard', authenticateJWT, authorizeRoles('LECTURER'), userController.getLecturerDashboard);
router.get('/admin-dashboard', authenticateJWT, authorizeRoles('ADMIN'), userController.getAdminDashboard);
router.patch('/profile', authenticateJWT, validateBody(UpdateProfileSchema), userController.updateProfile);
router.post('/avatar', authenticateJWT, uploadImageMiddleware.single('avatar'), userController.uploadAvatar);

// --- 2. Admin Management Endpoints (Requires ADMIN Role) ---
router.get('/', authenticateJWT, authorizeRoles('ADMIN'), validateQuery(QueryUsersSchema), userController.getUsers);
router.post('/', authenticateJWT, authorizeRoles('ADMIN'), validateBody(AdminCreateUserSchema), userController.adminCreateUser);
router.post('/batch', authenticateJWT, authorizeRoles('ADMIN'), validateBody(AdminCreateBatchUsersSchema), userController.adminCreateBatchUsers);
router.get('/:id', authenticateJWT, authorizeRoles('ADMIN'), userController.getUserById);
router.patch('/:id', authenticateJWT, authorizeRoles('ADMIN'), validateBody(AdminUpdateUserSchema), userController.adminUpdateUser);
router.post(
  '/:id/reset-password',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  validateBody(AdminResetPasswordSchema),
  userController.adminResetPassword
);

export default router;
