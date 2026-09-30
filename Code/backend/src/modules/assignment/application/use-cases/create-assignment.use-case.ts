import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { ICourseRepository } from '../../../course/domain/repositories/course.repository.interface.js';
import { CreateAssignmentDto } from '../dtos/assignment.dto.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class CreateAssignmentUseCase {
  constructor(
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly courseRepository: ICourseRepository
  ) {}

  async execute(dto: CreateAssignmentDto, createdBy: string) {
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new NotFoundError(`Khóa học với ID: ${dto.courseId}`);
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
