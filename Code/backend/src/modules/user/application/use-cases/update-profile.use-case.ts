import { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';
import { UpdateProfileDto } from '../dtos/user.dto.js';

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, data: UpdateProfileDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Người dùng');
    }

    const updatedUser = await this.userRepository.update(userId, {
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    });

    return updatedUser.toJSON();
  }
}
