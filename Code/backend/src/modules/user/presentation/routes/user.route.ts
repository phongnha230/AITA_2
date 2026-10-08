import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case.js';
import { GetStudentPortfolioUseCase } from '../../application/use-cases/get-student-portfolio.use-case.js';
import { GetLecturerDashboardUseCase } from '../../application/use-cases/get-lecturer-dashboard.use-case.js';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case.js';
import { GetUsersUseCase } from '../../application/use-cases/get-users.use-case.js';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case.js';
import { AdminCreateUserUseCase } from '../../application/use-cases/admin-create-user.use-case.js';
import { AdminCreateBatchUsersUseCase } from '../../application/use-cases/admin-create-batch-users.use-case.js';
import { AdminUpdateUserUseCase } from '../../application/use-cases/admin-update-user.use-case.js';
import { AdminResetPasswordUseCase } from '../../application/use-cases/admin-reset-password.use-case.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository.js';
import { BcryptHasherService } from '../../../auth/infrastructure/services/bcrypt-hasher.service.js';
import prisma from '../../../../infrastructure/database/prisma.client.js';
import { authenticateJWT, authorizeRoles } from '../../../auth/presentation/middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../../../../shared/presentation/middlewares/validate.middleware.js';
import {
  UpdateProfileSchema,
  QueryUsersSchema,
  AdminCreateUserSchema,
  AdminCreateBatchUsersSchema,
  AdminUpdateUserSchema,
} from '../../application/dtos/user.dto.js';
import { AdminResetPasswordSchema } from '../../../auth/application/dtos/auth.dto.js';

const router = Router();

// Composition Root for User & Admin Management
const userRepository = new PrismaUserRepository(prisma);
const passwordHasher = new BcryptHasherService();

const getProfileUseCase = new GetProfileUseCase(userRepository);
const getStudentPortfolioUseCase = new GetStudentPortfolioUseCase(prisma);
const getLecturerDashboardUseCase = new GetLecturerDashboardUseCase(prisma);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
const getUsersUseCase = new GetUsersUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
const adminCreateUserUseCase = new AdminCreateUserUseCase(userRepository, passwordHasher);
const adminCreateBatchUsersUseCase = new AdminCreateBatchUsersUseCase(userRepository, passwordHasher);
const adminUpdateUserUseCase = new AdminUpdateUserUseCase(userRepository);
const adminResetPasswordUseCase = new AdminResetPasswordUseCase(userRepository, passwordHasher);

const userController = new UserController(
  getProfileUseCase,
  getStudentPortfolioUseCase,
  getLecturerDashboardUseCase,
  updateProfileUseCase,
  getUsersUseCase,
  getUserByIdUseCase,
  adminCreateUserUseCase,
  adminCreateBatchUsersUseCase,
  adminUpdateUserUseCase,
  adminResetPasswordUseCase
);

// --- 1. User & Lecturer Self-Service Endpoints ---
router.get('/profile', authenticateJWT, userController.getProfile);
router.get('/portfolio', authenticateJWT, userController.getStudentPortfolio);
router.get('/lecturer-dashboard', authenticateJWT, authorizeRoles('LECTURER', 'ADMIN'), userController.getLecturerDashboard);
router.patch('/profile', authenticateJWT, validateBody(UpdateProfileSchema), userController.updateProfile);

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
