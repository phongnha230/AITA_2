import { ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';
import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';

export class ExamSessionUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async unlock(assignmentId: string, studentId: string, role: string, accessCode: string) {
    if (role !== 'STUDENT') throw new ForbiddenError('Chỉ sinh viên mới có thể mở ca thi.');
    return this.assignmentRepository.unlockExam(assignmentId, studentId, accessCode);
  }

  async status(assignmentId: string, studentId: string, role: string) {
    if (role !== 'STUDENT') throw new ForbiddenError('Chỉ sinh viên mới có thể xem trạng thái truy cập ca thi.');
    return this.assignmentRepository.getExamSessionStatus(assignmentId, studentId);
  }
}
