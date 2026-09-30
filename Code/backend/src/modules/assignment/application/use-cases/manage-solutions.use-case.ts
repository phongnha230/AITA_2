import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { UpsertSolutionDto } from '../dtos/assignment.dto.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class ManageSolutionsUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async upsert(assignmentId: string, dto: UpsertSolutionDto) {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);
    }
    return this.assignmentRepository.upsertSolution(assignmentId, dto);
  }

  async getSolutions(assignmentId: string) {
    return this.assignmentRepository.getSolutions(assignmentId);
  }
}
