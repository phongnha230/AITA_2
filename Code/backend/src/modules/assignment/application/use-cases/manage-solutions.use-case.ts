import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { UpsertSolutionDto } from '../dtos/assignment.dto.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';
import { IRagIndexingQueue } from '../../../ai/application/services/rag-indexing-queue.interface.js';

export class ManageSolutionsUseCase {
  constructor(
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly ragIndexingQueue: IRagIndexingQueue
  ) {}

  async upsert(assignmentId: string, dto: UpsertSolutionDto) {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);
    }
    const result = await this.assignmentRepository.upsertSolution(assignmentId, dto);
    await this.ragIndexingQueue.enqueue({
      solutionId: result.id,
      contentHash: result.contentHash,
    });
    return result;
  }

  async getSolutions(assignmentId: string) {
    return this.assignmentRepository.getSolutions(assignmentId);
  }
}

