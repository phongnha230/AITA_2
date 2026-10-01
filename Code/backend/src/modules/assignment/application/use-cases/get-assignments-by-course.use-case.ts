import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';

export class GetAssignmentsByCourseUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async execute(courseId: string) {
    return this.assignmentRepository.findByCourseId(courseId);
  }
}
