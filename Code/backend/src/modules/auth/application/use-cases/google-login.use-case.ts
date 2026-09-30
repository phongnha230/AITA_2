import { IUserRepository } from '../../../user/domain/repositories/user.repository.interface.js';
import { IOAuthService } from '../../domain/services/oauth.service.interface.js';
import { ITokenService } from '../../domain/services/token.service.interface.js';
import { ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';
import { LoginResult } from './login.use-case.js';

export class GoogleLoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly oauthService: IOAuthService,
    private readonly tokenService: ITokenService
  ) {}

  async executeWithCode(code: string): Promise<LoginResult> {
    const googleUser = await this.oauthService.getGoogleUserFromCode(code);
    return this.handleGoogleUser(googleUser);
  }

  async executeWithIdToken(idToken: string): Promise<LoginResult> {
    const googleUser = await this.oauthService.verifyGoogleIdToken(idToken);
    return this.handleGoogleUser(googleUser);
  }

  getAuthUrl(state?: string): string {
    return this.oauthService.getGoogleAuthUrl(state);
  }

  private async handleGoogleUser(googleUser: {
    googleId: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
  }): Promise<LoginResult> {
    // 1. Tìm kiếm user theo Google ID hoặc Email
    let user = await this.userRepository.findByGoogleId(googleUser.googleId);

    if (!user) {
      user = await this.userRepository.findByEmail(googleUser.email);
    }

    if (user) {
      if (user.isSuspended()) {
        throw new ForbiddenError('Tài khoản đã bị tạm khóa bởi quản trị viên.');
      }

      // Cập nhật googleId hoặc avatarUrl nếu chưa có
      await this.userRepository.update(user.id, {
        ...(googleUser.avatarUrl && !user.avatarUrl && { avatarUrl: googleUser.avatarUrl }),
        ...(googleUser.fullName && !user.fullName && { fullName: googleUser.fullName }),
      });
      await this.userRepository.updateLastLogin(user.id);
    } else {
      // 2. Tạo tài khoản mới với role mặc định là STUDENT
      user = await this.userRepository.create({
        email: googleUser.email,
        fullName: googleUser.fullName,
        avatarUrl: googleUser.avatarUrl,
        googleId: googleUser.googleId,
        role: 'STUDENT',
        status: 'ACTIVE',
      });
    }

    // 3. Cấp phát JWT Tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

    // 4. Xác định trang chuyển hướng
    let redirectTo = '/student/assignments';
    if (user.role === 'ADMIN') {
      redirectTo = '/admin/dashboard';
    } else if (user.role === 'LECTURER') {
      redirectTo = '/lecturer/courses';
    }

    return {
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      redirectTo,
    };
  }
}
