import { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { IPasswordHasher } from '../../../auth/domain/services/password-hasher.service.interface.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class AdminResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(targetUserId: string, newPlainPassword?: string): Promise<{ temporaryPassword?: string }> {
    const user = await this.userRepository.findById(targetUserId);
    if (!user) {
      throw new NotFoundError('Người dùng');
    }

    const passwordToSet = newPlainPassword || 'Aita@123456';
    const passwordHash = await this.passwordHasher.hash(passwordToSet);

    await this.userRepository.update(targetUserId, {
      passwordHash,
    });

    return {
      temporaryPassword: passwordToSet,
    };
  }
}
