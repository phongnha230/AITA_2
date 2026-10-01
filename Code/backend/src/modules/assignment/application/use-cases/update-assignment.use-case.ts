import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { UpdateAssignmentDto } from '../dtos/assignment.dto.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class UpdateAssignmentUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async execute(assignmentId: string, dto: UpdateAssignmentDto) {
    const existing = await this.assignmentRepository.findById(assignmentId);
    if (!existing) {
      throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);
    }

    const updated = await this.assignmentRepository.update(assignmentId, {
      ...(dto.title && { title: dto.title.trim() }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.environment && { environment: dto.environment }),
      ...(dto.submissionType && { submissionType: dto.submissionType }),
      ...(dto.startTime && { startTime: new Date(dto.startTime) }),
      ...(dto.deadline && { deadline: new Date(dto.deadline) }),
      ...(dto.allowGitSubmission !== undefined && { allowGitSubmission: dto.allowGitSubmission }),
      ...(dto.allowZipSubmission !== undefined && { allowZipSubmission: dto.allowZipSubmission }),
      ...(dto.status && { status: dto.status }),
    });

    return updated.toJSON();
  }
}
