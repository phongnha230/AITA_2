import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';
import { NotFoundError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export class RevokeJoinCodeUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(courseId: string, requester?: { userId: string; role: string }) {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError(`Khóa học với ID: ${courseId}`);
    }

    if (requester && requester.role !== 'ADMIN' && course.lecturerId !== requester.userId) {
      throw new ForbiddenError('Bạn không có quyền thu hồi mã tham gia của khóa học của giảng viên khác.');
    }

    await this.courseRepository.updateEnrollmentCode(courseId, null, null);
    return {
      message: 'Đã khóa và tắt mã tham gia lớp học thành công.',
    };
  }
}
