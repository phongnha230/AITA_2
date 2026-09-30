import { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { IPasswordHasher } from '../../../auth/domain/services/password-hasher.service.interface.js';
import { AdminCreateUserDto } from '../dtos/user.dto.js';

export interface BatchUserResult {
  succeeded: Array<{ email: string; fullName: string; role: string; id: string }>;
  failed: Array<{ email: string; error: string }>;
  totalProcessed: number;
}

export class AdminCreateBatchUsersUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(users: AdminCreateUserDto[]): Promise<BatchUserResult> {
    const succeeded: Array<{ email: string; fullName: string; role: string; id: string }> = [];
    const failed: Array<{ email: string; error: string }> = [];

    for (const dto of users) {
      try {
        const existing = await this.userRepository.findByEmail(dto.email);
        if (existing) {
          failed.push({ email: dto.email, error: 'Email đã tồn tại.' });
          continue;
        }

        const passwordToHash = dto.password || 'password123';
        const passwordHash = await this.passwordHasher.hash(passwordToHash);

        const created = await this.userRepository.create({
          email: dto.email,
          fullName: dto.fullName,
          passwordHash,
          role: dto.role,
          status: dto.status || 'ACTIVE',
          avatarUrl: dto.avatarUrl ?? null,
        });

        succeeded.push({
          id: created.id,
          email: created.email,
          fullName: created.fullName,
          role: created.role,
        });
      } catch (error: any) {
        failed.push({ email: dto.email, error: error?.message || 'Lỗi không xác định.' });
      }
    }

    return {
      succeeded,
      failed,
      totalProcessed: users.length,
    };
  }
}
