import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RefreshTokenUseCase } from '../../src/modules/auth/application/use-cases/refresh-token.use-case.js';
import { hashRefreshToken } from '../../src/modules/auth/infrastructure/services/refresh-token-hash.service.js';
import { ITokenService, JwtPayload } from '../../src/modules/auth/domain/services/token.service.interface.js';
import { IUserRepository } from '../../src/modules/user/domain/repositories/user.repository.interface.js';
import { User } from '../../src/modules/user/domain/entities/user.entity.js';
import { UnauthorizedError } from '../../src/shared/domain/exceptions/app.error.js';

const payload: JwtPayload = {
  userId: 'user-1',
  email: 'student@example.com',
  fullName: 'Student One',
  role: 'STUDENT',
};

const makeUser = (refreshTokenHash: string | null): User =>
  new User({
    id: payload.userId,
    email: payload.email,
    fullName: payload.fullName,
    role: 'STUDENT',
    status: 'ACTIVE',
    refreshTokenHash,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

describe('RefreshTokenUseCase', () => {
  const oldRefreshToken = 'old-refresh-token';
  const newRefreshToken = 'new-refresh-token';
  let storedHash: string | null;
  let userRepository: IUserRepository;
  let tokenService: ITokenService;

  beforeEach(() => {
    storedHash = hashRefreshToken(oldRefreshToken);
    userRepository = {
      findById: vi.fn(async () => makeUser(storedHash)),
      findByEmail: vi.fn(),
      findByUsernameOrEmail: vi.fn(),
      findByGoogleId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateLastLogin: vi.fn(),
      rotateRefreshTokenHash: vi.fn(async (_id, currentHash, nextHash) => {
        if (storedHash !== currentHash) return false;
        storedHash = nextHash;
        return true;
      }),
      clearRefreshTokenHash: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
    };
    tokenService = {
      generateAccessToken: vi.fn(() => 'new-access-token'),
      generateRefreshToken: vi.fn(() => newRefreshToken),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn(() => payload),
    };
  });

  it('rotates the persisted refresh token hash with compare-and-swap', async () => {
    const useCase = new RefreshTokenUseCase(userRepository, tokenService);

    const result = await useCase.execute({ refreshToken: oldRefreshToken });

    expect(result.refreshToken).toBe(newRefreshToken);
    expect(userRepository.rotateRefreshTokenHash).toHaveBeenCalledWith(
      payload.userId,
      hashRefreshToken(oldRefreshToken),
      hashRefreshToken(newRefreshToken)
    );
    expect(storedHash).toBe(hashRefreshToken(newRefreshToken));
  });

  it('rejects reuse of the previous refresh token after rotation', async () => {
    const useCase = new RefreshTokenUseCase(userRepository, tokenService);
    await useCase.execute({ refreshToken: oldRefreshToken });

    await expect(useCase.execute({ refreshToken: oldRefreshToken })).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it('rejects a refresh token when compare-and-swap loses a race', async () => {
    userRepository.rotateRefreshTokenHash = vi.fn(async () => false);
    const useCase = new RefreshTokenUseCase(userRepository, tokenService);

    await expect(useCase.execute({ refreshToken: oldRefreshToken })).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });
});
