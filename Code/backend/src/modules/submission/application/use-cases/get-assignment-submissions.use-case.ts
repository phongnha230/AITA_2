import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';
import { IAssignmentRepository } from '../../../assignment/domain/repositories/assignment.repository.interface.js';

export class GetAssignmentSubmissionsUseCase {
  constructor(
    private readonly submissionRepository: ISubmissionRepository,
    private readonly assignmentRepository?: IAssignmentRepository
  ) {}

  public async execute(assignmentId: string) {
    if (this.assignmentRepository) {
      await this.assignmentRepository.finalizeUnsubmittedStudents(assignmentId);
    }
    return this.submissionRepository.findByAssignmentId(assignmentId);
  }
}
