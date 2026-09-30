import { ICourseRepository, FindCoursesFilter } from '../../domain/repositories/course.repository.interface.js';

export class GetCoursesUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(filters?: FindCoursesFilter) {
    const courses = await this.courseRepository.findAll(filters);
    return courses.map((c) => c.toJSON());
  }
}
