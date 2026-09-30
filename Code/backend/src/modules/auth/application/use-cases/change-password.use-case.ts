import { IUserRepository } from '../../../user/domain/repositories/user.repository.interface.js';
import { IPasswordHasher } from '../../domain/services/password-hasher.service.interface.js';
import { ChangePasswordDto } from '../dtos/auth.dto.js';
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  ForbiddenError,
} from '../../../../shared/domain/exceptions/app.error.js';

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Người dùng');
    }

    if (user.isSuspended()) {
      throw new ForbiddenError('Tài khoản của bạn hiện đang bị khóa.');
    }

    // 1. Kiểm tra mật khẩu hiện tại
    if (user.passwordHash) {
      const isMatch = await this.passwordHasher.compare(dto.currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new UnauthorizedError('Mật khẩu hiện tại không chính xác.');
      }
    } else {
      // Nếu user đăng nhập thuần bằng Google và chưa có password, kiểm tra mật khẩu hiện tại nếu cần
      // hoặc yêu cầu cập nhật mật khẩu lần đầu
    }

    // 2. Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
    if (dto.currentPassword === dto.newPassword) {
      throw new ValidationError('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
    }

    // 3. Băm mật khẩu mới và lưu vào cơ sở dữ liệu
    const newPasswordHash = await this.passwordHasher.hash(dto.newPassword);
    await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
    });
  }
}
