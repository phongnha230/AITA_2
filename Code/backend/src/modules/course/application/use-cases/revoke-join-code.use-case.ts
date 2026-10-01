import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class RevokeJoinCodeUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(courseId: string) {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError(`Khóa học với ID: ${courseId}`);
    }

    await this.courseRepository.updateEnrollmentCode(courseId, null, null);
    return {
      message: 'Đã khóa và tắt mã tham gia lớp học thành công.',
    };
  }
}
