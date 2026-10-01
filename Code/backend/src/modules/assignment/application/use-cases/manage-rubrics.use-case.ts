import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { SetRubricRulesDto } from '../dtos/assignment.dto.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class ManageRubricsUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async setRules(assignmentId: string, dto: SetRubricRulesDto) {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);
    }
    return this.assignmentRepository.setRubricRules(assignmentId, dto.rules);
  }

  async getRules(assignmentId: string) {
    return this.assignmentRepository.getRubricRules(assignmentId);
  }
}
