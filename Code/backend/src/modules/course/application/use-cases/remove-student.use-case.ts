import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';

export class RemoveStudentUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(courseId: string, studentId: string): Promise<void> {
    await this.courseRepository.removeStudent(courseId, studentId);
  }
}
