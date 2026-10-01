import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';
import { UpdateCourseDto } from '../dtos/course.dto.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class UpdateCourseUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(courseId: string, dto: UpdateCourseDto) {
    const existing = await this.courseRepository.findById(courseId);
    if (!existing) {
      throw new NotFoundError(`Khóa học với ID: ${courseId}`);
    }

    const updated = await this.courseRepository.update(courseId, {
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.semester !== undefined && { semester: dto.semester.trim() }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });

    return updated.toJSON();
  }
}
