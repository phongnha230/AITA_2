import crypto from 'crypto';
import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';
import { GenerateJoinCodeDto } from '../dtos/course.dto.js';
import { NotFoundError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export class GenerateJoinCodeUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(
    courseId: string,
    dto: GenerateJoinCodeDto,
    requester?: { userId: string; role: string }
  ) {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError(`Khóa học với ID: ${courseId}`);
    }

    if (requester && requester.role !== 'ADMIN' && course.lecturerId !== requester.userId) {
      throw new ForbiddenError('Bạn không có quyền tạo mã tham gia cho khóa học của giảng viên khác.');
    }

    const expiresInMinutes = dto.expiresInMinutes || 30;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // Sinh mã ngẫu nhiên dạng 6 ký tự viết hoa dễ đọc (không dùng O, 0, I, 1 gây nhầm lẫn)
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomChars = '';
    const randomBytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      randomChars += charset[randomBytes[i] % charset.length];
    }

    // Format: ví dụ PRF-8K9P2X hoặc CSD-7M4N8Q
    const codePrefix = course.code.split('_')[0].substring(0, 4);
    const joinCode = `${codePrefix}-${randomChars}`;

    const updated = await this.courseRepository.updateEnrollmentCode(courseId, joinCode, expiresAt);

    return {
      courseId: updated.id,
      courseCode: updated.code,
      courseName: updated.name,
      joinCode,
      expiresAt,
      expiresInMinutes,
      message: `Mã tham gia lớp học đã được tạo: ${joinCode}. Mã có hiệu lực trong ${expiresInMinutes} phút.`,
    };
  }
}
