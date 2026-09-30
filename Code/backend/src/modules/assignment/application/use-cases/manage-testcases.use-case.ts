import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { CreateTestCaseDto } from '../dtos/assignment.dto.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class ManageTestCasesUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async addTestCase(assignmentId: string, dto: CreateTestCaseDto) {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);
    }
    return this.assignmentRepository.addTestCase(assignmentId, dto);
  }

  async updateTestCase(testCaseId: string, dto: Partial<CreateTestCaseDto>) {
    return this.assignmentRepository.updateTestCase(testCaseId, dto);
  }

  async deleteTestCase(testCaseId: string) {
    return this.assignmentRepository.deleteTestCase(testCaseId);
  }

  async getTestCases(assignmentId: string, includeHidden: boolean = false) {
    return this.assignmentRepository.getTestCases(assignmentId, includeHidden);
  }
}
