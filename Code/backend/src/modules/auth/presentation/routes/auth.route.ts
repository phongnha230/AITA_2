import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import { RegisterUseCase } from '../../application/use-cases/register.use-case.js';
import { GoogleLoginUseCase } from '../../application/use-cases/google-login.use-case.js';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case.js';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case.js';
import { PrismaUserRepository } from '../../../user/infrastructure/repositories/prisma-user.repository.js';
import { BcryptHasherService } from '../../infrastructure/services/bcrypt-hasher.service.js';
import { JwtTokenService } from '../../infrastructure/services/jwt-token.service.js';
import { GoogleOAuthService } from '../../infrastructure/services/google-oauth.service.js';
import prisma from '../../../../infrastructure/database/prisma.client.js';
import { validateBody } from '../../../../shared/presentation/middlewares/validate.middleware.js';
import {
  LoginSchema,
  RegisterSchema,
  RefreshTokenSchema,
  ChangePasswordSchema,
  GoogleLoginCodeSchema,
  GoogleIdTokenSchema,
} from '../../application/dtos/auth.dto.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Composition Root for Auth
const userRepository = new PrismaUserRepository(prisma);
const passwordHasher = new BcryptHasherService();
const tokenService = new JwtTokenService();
const oauthService = new GoogleOAuthService();

const loginUseCase = new LoginUseCase(userRepository, passwordHasher, tokenService);
const registerUseCase = new RegisterUseCase(userRepository, passwordHasher, tokenService);
const googleLoginUseCase = new GoogleLoginUseCase(userRepository, oauthService, tokenService);
const changePasswordUseCase = new ChangePasswordUseCase(userRepository, passwordHasher);
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService);

const authController = new AuthController(
  loginUseCase,
  registerUseCase,
  googleLoginUseCase,
  changePasswordUseCase,
  refreshTokenUseCase
);

// Traditional Email/Password Auth
router.post('/login', validateBody(LoginSchema), authController.login);
router.post('/register', validateBody(RegisterSchema), authController.register);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticateJWT, authController.me);
router.post('/change-password', authenticateJWT, validateBody(ChangePasswordSchema), authController.changePassword);

// Google OAuth 2.0 Endpoints
router.get('/google', authController.getGoogleAuthUrl);
router.get('/google/callback', authController.googleCallback);
router.post('/google/code', validateBody(GoogleLoginCodeSchema), authController.googleLoginWithCode);
router.post('/google/token', validateBody(GoogleIdTokenSchema), authController.googleLoginWithIdToken);

export default router;
