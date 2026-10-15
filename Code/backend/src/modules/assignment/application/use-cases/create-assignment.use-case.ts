import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { ICourseRepository } from '../../../course/domain/repositories/course.repository.interface.js';
import { IUserRepository } from '../../../user/domain/repositories/user.repository.interface.js';
import { CreateAssignmentDto } from '../dtos/assignment.dto.js';
import { NotFoundError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export class CreateAssignmentUseCase {
  constructor(
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly userRepository?: IUserRepository
  ) {}

  async execute(dto: CreateAssignmentDto, createdBy: string) {
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new NotFoundError(`Khóa học với ID: ${dto.courseId}`);
    }

    // Chỉ giảng viên phụ trách môn học hoặc ADMIN mới được tạo đề thi
    if (course.lecturerId !== createdBy) {
      if (this.userRepository) {
        const creator = await this.userRepository.findById(createdBy);
        if (creator?.role !== 'ADMIN') {
          throw new ForbiddenError('Bạn không có quyền tạo đề thi trong môn học của giảng viên khác.');
        }
      }
    }

    const assignment = await this.assignmentRepository.create({
      courseId: dto.courseId,
      title: dto.title.trim(),
      description: dto.description,
      environment: dto.environment,
      submissionType: dto.submissionType || 'INDIVIDUAL',
      startTime: dto.startTime || new Date(),
      deadline: new Date(dto.deadline),
      allowGitSubmission: dto.allowGitSubmission !== undefined ? dto.allowGitSubmission : true,
      allowZipSubmission: dto.allowZipSubmission !== undefined ? dto.allowZipSubmission : true,
      status: dto.status || 'DRAFT',
      createdBy,
    });

    return assignment.toJSON();
  }
}
