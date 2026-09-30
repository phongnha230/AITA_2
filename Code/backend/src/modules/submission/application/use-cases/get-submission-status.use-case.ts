import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class GetSubmissionStatusUseCase {
  constructor(private readonly submissionRepository: ISubmissionRepository) {}

  public async execute(id: string) {
    const submission = await this.submissionRepository.findWithJobStatus(id);

    if (!submission) {
      throw new NotFoundError(`Bài nộp với ID: ${id}`);
    }

    return submission;
  }
}
