import { IUserRepository, FindUsersFilter } from '../../domain/repositories/user.repository.interface.js';

export class GetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(filter?: FindUsersFilter) {
    const { users, total } = await this.userRepository.findAll(filter);
    return {
      users: users.map((u) => u.toJSON()),
      total,
      page: filter?.page || 1,
      limit: filter?.limit || 10,
    };
  }
}
