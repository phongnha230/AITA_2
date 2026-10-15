import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';

export class GetAssignmentSubmissionsUseCase {
  constructor(private readonly submissionRepository: ISubmissionRepository) {}

  public async execute(assignmentId: string) {
    return this.submissionRepository.findByAssignmentId(assignmentId);
  }
}
