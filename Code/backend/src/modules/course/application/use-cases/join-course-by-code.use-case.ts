import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';
import { JoinCourseByCodeDto } from '../dtos/course.dto.js';
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from '../../../../shared/domain/exceptions/app.error.js';

export class JoinCourseByCodeUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(studentId: string, dto: JoinCourseByCodeDto) {
    const cleanCode = dto.code.toUpperCase().trim();
    const course = await this.courseRepository.findByEnrollmentCode(cleanCode);

    if (!course) {
      throw new NotFoundError(`Mã tham gia '${cleanCode}' không tồn tại hoặc không chính xác.`);
    }

    if (!course.isActive) {
      throw new ForbiddenError('Lớp học này hiện đang tạm đóng.');
    }

    if (course.isCodeExpired()) {
      throw new ValidationError(
        `Mã tham gia '${cleanCode}' đã hết hạn lúc ${course.codeExpiresAt?.toLocaleTimeString('vi-VN')}. Vui lòng liên hệ Giảng viên để lấy mã mới.`
      );
    }

    // Kiểm tra sinh viên đã ở trong lớp chưa
    const alreadyEnrolled = await this.courseRepository.isStudentEnrolled(course.id, studentId);
    if (alreadyEnrolled) {
      return {
        alreadyEnrolled: true,
        message: 'Bạn đã là thành viên của lớp học này.',
        course: course.toJSON(),
      };
    }

    // Ghi danh sinh viên vào lớp
    await this.courseRepository.enrollStudents(course.id, [studentId]);

    return {
      alreadyEnrolled: false,
      message: `Chúc mừng! Bạn đã tham gia thành công lớp học '${course.name}' (${course.code}).`,
      course: course.toJSON(),
    };
  }
}
