import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';
import { UpdateCourseDto } from '../dtos/course.dto.js';
import { NotFoundError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export class UpdateCourseUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(
    courseId: string,
    dto: UpdateCourseDto,
    requester?: { userId: string; role: string }
  ) {
    const existing = await this.courseRepository.findById(courseId);
    if (!existing) {
      throw new NotFoundError(`Khóa học với ID: ${courseId}`);
    }

    if (requester && requester.role !== 'ADMIN' && existing.lecturerId !== requester.userId) {
      throw new ForbiddenError('Bạn không có quyền chỉnh sửa khóa học của giảng viên khác.');
    }

    const updated = await this.courseRepository.update(courseId, {
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.semester !== undefined && { semester: dto.semester.trim() }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });

    return updated.toJSON();
  }
}
