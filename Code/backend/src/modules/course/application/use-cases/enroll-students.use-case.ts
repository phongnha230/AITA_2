import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';
import { NotFoundError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export class EnrollStudentsUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(
    courseId: string,
    studentIds: string[],
    requester?: { userId: string; role: string }
  ): Promise<{ enrolledCount: number }> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError(`Khóa học với ID: ${courseId}`);
    }

    if (requester && requester.role !== 'ADMIN' && course.lecturerId !== requester.userId) {
      throw new ForbiddenError('Bạn không có quyền ghi danh học viên vào khóa học của giảng viên khác.');
    }

    const count = await this.courseRepository.enrollStudents(courseId, studentIds);
    return { enrolledCount: count };
  }
}
