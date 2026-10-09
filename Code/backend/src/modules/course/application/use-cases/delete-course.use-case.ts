import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';
import { NotFoundError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export class DeleteCourseUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(courseId: string, requester?: { userId: string; role: string }): Promise<void> {
    const existing = await this.courseRepository.findById(courseId);
    if (!existing) {
      throw new NotFoundError(`Khóa học với ID: ${courseId}`);
    }

    if (requester && requester.role !== 'ADMIN' && existing.lecturerId !== requester.userId) {
      throw new ForbiddenError('Bạn không có quyền xóa khóa học của giảng viên khác.');
    }

    await this.courseRepository.delete(courseId);
  }
}
