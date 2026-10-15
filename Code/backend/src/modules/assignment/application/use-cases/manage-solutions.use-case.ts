import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { UpsertSolutionDto } from '../dtos/assignment.dto.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';
import { RagKnowledgeFacade } from '../../../ai/infrastructure/facades/rag-knowledge.facade.js';

export class ManageSolutionsUseCase {
  private ragKnowledgeFacade = new RagKnowledgeFacade();

  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async upsert(assignmentId: string, dto: UpsertSolutionDto) {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);
    }
    const result = await this.assignmentRepository.upsertSolution(assignmentId, dto);

    // Kích hoạt RAG Vector Ingestion vào ChromaDB ngầm
    this.ragKnowledgeFacade.indexAssignmentSolution(assignmentId).catch((err) => {
      console.warn(`[ManageSolutionsUseCase] Indexing ChromaDB failed for assignment ${assignmentId}:`, err.message);
    });

    return result;
  }

  async getSolutions(assignmentId: string) {
    return this.assignmentRepository.getSolutions(assignmentId);
  }
}

