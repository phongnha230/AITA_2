import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import { RegisterUseCase } from '../../application/use-cases/register.use-case.js';
import { GoogleLoginUseCase } from '../../application/use-cases/google-login.use-case.js';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case.js';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';
import { UnauthorizedError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { env } from '../../../../infrastructure/config/env.js';

import { setAuthCookies, clearAuthCookies } from '../../../../shared/presentation/utils/cookie.util.js';
import { otpService } from '../../infrastructure/services/otp.service.js';
import { emailService } from '../../../../infrastructure/email/email.service.js';
import { recaptchaService } from '../../../../infrastructure/recaptcha/recaptcha.service.js';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly googleLoginUseCase: GoogleLoginUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly refreshTokenUseCase?: RefreshTokenUseCase
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      setAuthCookies(res, result.token, result.refreshToken);
      sendSuccess(res, result, 'Đăng nhập thành công!');
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.refreshTokenUseCase) {
        throw new Error('RefreshTokenUseCase is not injected');
      }
      const token = req.body?.refreshToken || req.cookies?.refreshToken;
      if (!token) {
        throw new UnauthorizedError('Thiếu refresh token.');
      }
      const result = await this.refreshTokenUseCase.execute({ refreshToken: token });
      setAuthCookies(res, result.token, result.refreshToken);
      sendSuccess(res, result, 'Làm mới token thành công!');
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.registerUseCase.execute(req.body);
      setAuthCookies(res, result.token, result.refreshToken);
      sendSuccess(res, result, 'Đăng ký tài khoản thành công!', 201);
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      clearAuthCookies(res);
      sendSuccess(res, null, 'Đăng xuất thành công!');
    } catch (error) {
      next(error);
    }
  };

  sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, fullName, recaptchaToken } = req.body;

      // 1. Xác thực Google reCAPTCHA
      const recaptchaResult = await recaptchaService.verifyRecaptcha(recaptchaToken);
      if (!recaptchaResult.success) {
        throw new ValidationError(recaptchaResult.message || 'Xác thực reCAPTCHA không hợp lệ.');
      }

      // 2. Sinh mã và lưu vào Redis
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await otpService.saveOtp(email, otpCode, 300);
      await emailService.sendOtpEmail(email, otpCode, fullName);
      sendSuccess(res, { email }, 'Mã xác thực OTP đã được gửi về email của bạn (hiệu lực 5 phút).');
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const isValid = await otpService.verifyOtp(email, otp);
      if (!isValid) {
        throw new UnauthorizedError('Mã OTP không chính xác hoặc đã hết hạn.');
      }
      sendSuccess(res, { valid: true }, 'Xác thực mã OTP thành công!');
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, req.user, 'Lấy thông tin người dùng hiện tại thành công.');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Người dùng chưa xác thực.');
      }
      await this.changePasswordUseCase.execute(req.user.userId, req.body);
      sendSuccess(res, null, 'Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.');
    } catch (error) {
      next(error);
    }
  };

  getGoogleAuthUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const state = req.query.state as string | undefined;
      const url = this.googleLoginUseCase.getAuthUrl(state);

      if (req.query.redirect === 'true') {
        res.redirect(url);
      } else {
        sendSuccess(res, { url }, 'Lấy URL đăng nhập Google thành công.');
      }
    } catch (error) {
      next(error);
    }
  };

  googleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const code = req.query.code as string;
      const error = req.query.error as string;
      const frontendUrl = env.FRONTEND_URL;

      if (error) {
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error)}`);
        return;
      }

      if (!code) {
        res.redirect(`${frontendUrl}/login?error=missing_google_code`);
        return;
      }

      const result = await this.googleLoginUseCase.executeWithCode(code);

      // Set HttpOnly Cookies
      setAuthCookies(res, result.token, result.refreshToken);

      // Redirect back to frontend
      const targetUrl = new URL(`${frontendUrl}/auth/callback`);
      targetUrl.searchParams.set('role', result.user.role);
      targetUrl.searchParams.set('redirectTo', result.redirectTo);

      res.redirect(targetUrl.toString());
    } catch (error: any) {
      console.error('Google Callback Error:', error);
      const frontendUrl = env.FRONTEND_URL;
      const message = error?.message || 'Đăng nhập Google thất bại';
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
    }
  };

  googleLoginWithCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.googleLoginUseCase.executeWithCode(req.body.code);
      setAuthCookies(res, result.token, result.refreshToken);
      sendSuccess(res, result, 'Đăng nhập Google thành công!');
    } catch (error) {
      next(error);
    }
  };

  googleLoginWithIdToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.googleLoginUseCase.executeWithIdToken(req.body.idToken);
      setAuthCookies(res, result.token, result.refreshToken);
      sendSuccess(res, result, 'Đăng nhập Google thành công!');
    } catch (error) {
      next(error);
    }
  };
}
