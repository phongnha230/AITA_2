import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class GetAssignmentDetailUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async execute(assignmentId: string, userRole?: string) {
    const isLecturerOrAdmin = userRole === 'LECTURER' || userRole === 'ADMIN';
    const assignment = await this.assignmentRepository.findDetailedById(assignmentId, isLecturerOrAdmin);

    if (!assignment) {
      throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);
    }

    return assignment;
  }
}
