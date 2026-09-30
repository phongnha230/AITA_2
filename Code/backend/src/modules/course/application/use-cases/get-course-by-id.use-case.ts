import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class GetCourseByIdUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(courseId: string) {
    const course = await this.courseRepository.findDetailedById(courseId);
    if (!course) {
      throw new NotFoundError(`Khóa học với ID: ${courseId}`);
    }
    return course;
  }
}
