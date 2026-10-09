import { IUserRepository } from '../../../user/domain/repositories/user.repository.interface.js';
import { IPasswordHasher } from '../../domain/services/password-hasher.service.interface.js';
import { ITokenService } from '../../domain/services/token.service.interface.js';
import { LoginDto } from '../dtos/auth.dto.js';
import { UnauthorizedError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export interface LoginResult {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatarUrl?: string | null;
  };
  redirectTo: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const { username, password } = dto;

    // 1. Tìm user theo username/email
    const user = await this.userRepository.findByUsernameOrEmail(username);

    if (!user) {
      throw new UnauthorizedError('Tài khoản hoặc mật khẩu không chính xác.');
    }

    if (user.isSuspended()) {
      throw new ForbiddenError('Tài khoản đã bị tạm khóa bởi quản trị viên.');
    }

    // 2. So khớp mật khẩu
    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await this.passwordHasher.compare(password, user.passwordHash);
    }

    if (!isMatch) {
      throw new UnauthorizedError('Tài khoản hoặc mật khẩu không chính xác.');
    }

    // 3. Cập nhật thời điểm đăng nhập gần nhất
    await this.userRepository.updateLastLogin(user.id);

    // 4. Sinh JWT Tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

    // 5. Xác định trang chuyển hướng theo Role
    let redirectTo = '/student/dashboard';
    if (user.role === 'ADMIN') {
      redirectTo = '/admin/dashboard';
    } else if (user.role === 'LECTURER') {
      redirectTo = '/dashboard';
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
