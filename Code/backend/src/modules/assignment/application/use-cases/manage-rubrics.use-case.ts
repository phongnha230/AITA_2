import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { SetRubricRulesDto } from '../dtos/assignment.dto.js';
import { NotFoundError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

export class ManageRubricsUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async setRules(assignmentId: string, dto: SetRubricRulesDto) {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);
    }
    const scoreByType = dto.rules.reduce<Record<string, number>>((scores, rule) => {
      const criterionType = rule.criterionType ?? 'GENERAL';
      scores[criterionType] = (scores[criterionType] ?? 0) + rule.maxPoints;
      return scores;
    }, {});
    if (assignment.toJSON().gradingVersion === 2) {
      const validTotals = Math.abs((scoreByType.ALGORITHM ?? 0) - 2) < 0.001
        && Math.abs((scoreByType.CLEAN_CODE ?? 0) - 1) < 0.001
        && (scoreByType.GENERAL ?? 0) === 0;
      if (!validTotals) {
        throw new ValidationError('Rubric đề mới phải gồm đúng 2 điểm ALGORITHM và 1 điểm CLEAN_CODE.');
      }
    } else if (Math.abs((scoreByType.GENERAL ?? 0) - 2) >= 0.001) {
      throw new ValidationError('Rubric của assignment cấu hình cũ phải có tổng 2 điểm GENERAL.');
    }
    return this.assignmentRepository.setRubricRules(assignmentId, dto.rules);
  }

  async getRules(assignmentId: string) {
    return this.assignmentRepository.getRubricRules(assignmentId);
  }
}
