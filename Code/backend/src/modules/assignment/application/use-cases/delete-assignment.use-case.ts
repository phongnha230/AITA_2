import { logger } from '../../../../infrastructure/logging/logger.js';
import { ISolutionVectorStore } from '../../../ai/infrastructure/vector/chroma-vector.service.js';
import { ConflictError, NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';
import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';

export class DeleteAssignmentUseCase {
  constructor(
    private readonly assignmentRepository: Pick<IAssignmentRepository, 'deleteIfNoSubmissions'>,
    private readonly solutionVectorStore: Pick<ISolutionVectorStore, 'deleteAssignment'>
  ) {}

  public async execute(assignmentId: string): Promise<void> {
    const result = await this.assignmentRepository.deleteIfNoSubmissions(assignmentId);
    if (result === 'NOT_FOUND') throw new NotFoundError('Đề thi');
    if (result === 'HAS_SUBMISSIONS') {
      throw new ConflictError(
        'Đề thi đã có bài nộp nên không thể xóa. Hãy chuyển trạng thái sang ARCHIVED.'
      );
    }

    try {
      await this.solutionVectorStore.deleteAssignment(assignmentId);
    } catch (error) {
      logger.error('assignment_vector_cleanup_failed', {
        assignmentId,
        stage: 'ASSIGNMENT_DELETE',
        error,
      });
    }
  }
}
