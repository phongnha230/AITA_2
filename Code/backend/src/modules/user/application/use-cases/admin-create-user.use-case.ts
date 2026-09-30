import { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { IPasswordHasher } from '../../../auth/domain/services/password-hasher.service.interface.js';
import { AdminCreateUserDto } from '../dtos/user.dto.js';
import { ConflictError } from '../../../../shared/domain/exceptions/app.error.js';

export class AdminCreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: AdminCreateUserDto) {
    // 1. Kiểm tra email đã tồn tại hay chưa
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError(`Email '${dto.email}' đã tồn tại trong hệ thống.`);
    }

    // 2. Băm mật khẩu (mặc định 'password123' nếu không truyền)
    const passwordToHash = dto.password || 'password123';
    const passwordHash = await this.passwordHasher.hash(passwordToHash);

    // 3. Tạo User trong cơ sở dữ liệu
    const user = await this.userRepository.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash,
      role: dto.role,
      status: dto.status || 'ACTIVE',
      avatarUrl: dto.avatarUrl ?? null,
    });

    return user.toJSON();
  }
}
