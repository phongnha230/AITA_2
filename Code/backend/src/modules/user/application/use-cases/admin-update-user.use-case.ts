import { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { AdminUpdateUserDto } from '../dtos/user.dto.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class AdminUpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, dto: AdminUpdateUserDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Người dùng');
    }

    const updatedUser = await this.userRepository.update(userId, {
      ...(dto.fullName !== undefined && { fullName: dto.fullName }),
      ...(dto.role !== undefined && { role: dto.role }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
    });

    return updatedUser.toJSON();
  }
}
