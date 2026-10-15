import { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string) {
    if (this.userRepository.findDetailedById) {
      const detailed = await this.userRepository.findDetailedById(userId);
      if (detailed) return detailed;
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Người dùng');
    }

    return user.toJSON();
  }
}
