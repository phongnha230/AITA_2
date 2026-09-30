import { IUserRepository } from '../../../user/domain/repositories/user.repository.interface.js';
import { IPasswordHasher } from '../../domain/services/password-hasher.service.interface.js';
import { ITokenService } from '../../domain/services/token.service.interface.js';
import { RegisterDto } from '../dtos/auth.dto.js';
import { ConflictError } from '../../../../shared/domain/exceptions/app.error.js';
import { LoginResult } from './login.use-case.js';

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async execute(dto: RegisterDto): Promise<LoginResult> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('Email này đã được đăng ký trên hệ thống.');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = await this.userRepository.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash,
      role: dto.role,
      status: 'ACTIVE',
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

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
      redirectTo: user.role === 'LECTURER' ? '/lecturer/courses' : '/student/assignments',
    };
  }
}
