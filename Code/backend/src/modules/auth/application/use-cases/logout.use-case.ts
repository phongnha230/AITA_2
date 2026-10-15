import { IUserRepository } from '../../../user/domain/repositories/user.repository.interface.js';
import { ITokenService } from '../../domain/services/token.service.interface.js';
import { hashRefreshToken } from '../../infrastructure/services/refresh-token-hash.service.js';

export class LogoutUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;

    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      await this.userRepository.clearRefreshTokenHash(
        payload.userId,
        hashRefreshToken(refreshToken)
      );
    } catch (error) {
      // Logout remains idempotent; an invalid/expired token is still cleared client-side.
      console.warn('[Auth] Refresh token could not be revoked during logout', {
        error: error instanceof Error ? error.message : 'unknown error',
      });
    }
  }
}
