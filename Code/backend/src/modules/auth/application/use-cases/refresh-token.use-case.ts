import { IUserRepository } from '../../../user/domain/repositories/user.repository.interface.js';
import { ITokenService } from '../../domain/services/token.service.interface.js';
import { RefreshTokenDto } from '../dtos/auth.dto.js';
import { UnauthorizedError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';
import {
  hashRefreshToken,
  refreshTokenHashesMatch,
} from '../../infrastructure/services/refresh-token-hash.service.js';

export interface RefreshTokenResult {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatarUrl?: string | null;
  };
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(dto: RefreshTokenDto): Promise<RefreshTokenResult> {
    const { refreshToken } = dto;

    if (!refreshToken) {
      throw new UnauthorizedError('Vui lòng cung cấp refreshToken.');
    }

    // 1. Xác thực tính hợp lệ của Refresh Token
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    // 2. Tìm user trong CSDL
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('Người dùng không tồn tại hoặc đã bị xóa.');
    }

    if (user.isSuspended()) {
      throw new ForbiddenError('Tài khoản đã bị tạm khóa bởi quản trị viên.');
    }

    const currentHash = hashRefreshToken(refreshToken);
    if (!user.refreshTokenHash || !refreshTokenHashesMatch(user.refreshTokenHash, currentHash)) {
      throw new UnauthorizedError('Refresh token đã bị thu hồi hoặc được thay thế.');
    }

    // 3. Cấp phát cặp Token mới (Access Token & Refresh Token)
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const newAccessToken = this.tokenService.generateAccessToken(tokenPayload);
    const newRefreshToken = this.tokenService.generateRefreshToken(tokenPayload);
    const rotated = await this.userRepository.rotateRefreshTokenHash(
      user.id,
      currentHash,
      hashRefreshToken(newRefreshToken)
    );
    if (!rotated) {
      throw new UnauthorizedError('Refresh token đã được sử dụng. Vui lòng đăng nhập lại.');
    }

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
