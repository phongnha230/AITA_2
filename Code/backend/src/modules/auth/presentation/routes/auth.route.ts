import { Router } from 'express';
import { container } from '../../../../infrastructure/container/container.js';
import { validateBody } from '../../../../shared/presentation/middlewares/validate.middleware.js';
import {
  LoginSchema,
  RegisterSchema,
  RefreshTokenSchema,
  SendOtpSchema,
  VerifyOtpSchema,
  ChangePasswordSchema,
  GoogleLoginCodeSchema,
  GoogleIdTokenSchema,
} from '../../application/dtos/auth.dto.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { createAuthRateLimiter } from '../middlewares/auth-rate-limit.middleware.js';

const router = Router();

const identityByEmail = (req: import('express').Request): string =>
  String(req.body?.email || req.body?.username || 'anonymous');
const loginLimiter = createAuthRateLimiter({ scope: 'login', max: 10, windowSeconds: 900, identity: identityByEmail });
const sendOtpLimiter = createAuthRateLimiter({ scope: 'send-otp', max: 3, windowSeconds: 900, identity: identityByEmail });
const verifyOtpLimiter = createAuthRateLimiter({ scope: 'verify-otp', max: 5, windowSeconds: 900, identity: identityByEmail });
const registerLimiter = createAuthRateLimiter({ scope: 'register', max: 5, windowSeconds: 900, identity: identityByEmail });


const authController = container.authController;

// Traditional Email/Password Auth
router.post('/login', loginLimiter, validateBody(LoginSchema), authController.login);
router.post('/register', registerLimiter, validateBody(RegisterSchema), authController.register);
router.post('/send-otp', sendOtpLimiter, validateBody(SendOtpSchema), authController.sendOtp);
router.post('/verify-otp', verifyOtpLimiter, validateBody(VerifyOtpSchema), authController.verifyOtp);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticateJWT, authController.me);
router.post('/change-password', authenticateJWT, validateBody(ChangePasswordSchema), authController.changePassword);

// Google OAuth 2.0 Endpoints
router.get('/google', authController.getGoogleAuthUrl);
router.get('/google/callback', authController.googleCallback);
router.post('/google/code', loginLimiter, validateBody(GoogleLoginCodeSchema), authController.googleLoginWithCode);
router.post('/google/token', loginLimiter, validateBody(GoogleIdTokenSchema), authController.googleLoginWithIdToken);

export default router;
