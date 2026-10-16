import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';
import { ForbiddenError, NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class GetCourseByIdUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(courseId: string, requester: { userId: string; role: string }) {
    const courseRecord = await this.courseRepository.findById(courseId);
    if (!courseRecord) {
      throw new NotFoundError(`Khóa học với ID: ${courseId}`);
    }

    if (requester.role === 'LECTURER' && courseRecord.lecturerId !== requester.userId) {
      throw new ForbiddenError('Bạn không có quyền xem khóa học của giảng viên khác.');
    }

    if (requester.role === 'STUDENT') {
      const isEnrolled = await this.courseRepository.isStudentEnrolled(courseId, requester.userId);
      if (!isEnrolled) {
        throw new NotFoundError(`Khóa học với ID: ${courseId}`);
      }
    } else if (requester.role !== 'LECTURER' && requester.role !== 'ADMIN') {
      throw new ForbiddenError('Bạn không có quyền xem khóa học này.');
    }

    const course = await this.courseRepository.findDetailedById(courseId);
    if (!course) {
      throw new NotFoundError(`Khóa học với ID: ${courseId}`);
    }
    return course;
  }
}
