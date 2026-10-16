import { ICourseRepository } from '../../domain/repositories/course.repository.interface.js';
import { IUserRepository } from '../../../user/domain/repositories/user.repository.interface.js';
import { CreateCourseDto } from '../dtos/course.dto.js';
import { ConflictError, NotFoundError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

export class CreateCourseUseCase {
  constructor(
    private readonly courseRepository: ICourseRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: CreateCourseDto & { lecturerId: string }) {
    const lecturer = await this.userRepository.findById(dto.lecturerId);
    if (!lecturer) {
      throw new NotFoundError(`Giảng viên với ID: ${dto.lecturerId}`);
    }
    if (lecturer.role !== 'LECTURER') {
      throw new ValidationError('Khóa học phải được giao cho tài khoản giảng viên.');
    }

    const existing = await this.courseRepository.findByCodeAndSemester(
      dto.code.toUpperCase().trim(),
      dto.semester.trim()
    );
    if (existing) {
      throw new ConflictError(`Môn học '${dto.code}' trong học kỳ '${dto.semester}' đã tồn tại.`);
    }

    const course = await this.courseRepository.create({
      code: dto.code.toUpperCase().trim(),
      name: dto.name.trim(),
      semester: dto.semester.trim(),
      lecturerId: dto.lecturerId,
      capacity: dto.capacity,
    });

    return course.toJSON();
  }
}
