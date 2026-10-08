import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';

export class GetAllSubmissionsUseCase {
  constructor(private readonly submissionRepository: ISubmissionRepository) {}

  public async execute(query?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    assignmentId?: string;
  }) {
    return this.submissionRepository.findAll(query);
  }
}
