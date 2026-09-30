import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class DeleteCourseUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(courseId: string): Promise<void> {
    const existing = await this.courseRepository.findById(courseId);
    if (!existing) {
      throw new NotFoundError(`Khóa học với ID: ${courseId}`);
    }
    await this.courseRepository.delete(courseId);
  }
}
