import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';
import { NotFoundError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export class RemoveStudentUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(
    courseId: string,
    studentId: string,
    requester?: { userId: string; role: string }
  ): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError(`Khóa học với ID: ${courseId}`);
    }

    if (requester && requester.role !== 'ADMIN' && course.lecturerId !== requester.userId) {
      throw new ForbiddenError('Bạn không có quyền xóa học viên khỏi khóa học của giảng viên khác.');
    }

    await this.courseRepository.removeStudent(courseId, studentId);
  }
}
