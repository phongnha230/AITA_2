import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { NotFoundError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export class GetAssignmentDetailUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async execute(assignmentId: string, userRole?: string, accessCode?: string) {
    const isLecturerOrAdmin = userRole === 'LECTURER' || userRole === 'ADMIN';
    const assignment = await this.assignmentRepository.findDetailedById(assignmentId, isLecturerOrAdmin);

    if (!assignment) {
      throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);
    }

    if (!isLecturerOrAdmin) {
      // 1. Kiểm tra trạng thái DRAFT
      if (assignment.status === 'DRAFT') {
        throw new ForbiddenError('Đề thi này chưa được công bố (DRAFT).');
      }

      // 2. Kiểm tra Passcode mở đề
      if (assignment.accessCode) {
        const isUnlocked = accessCode && accessCode.trim() === assignment.accessCode.trim();
        if (!isUnlocked) {
          return {
            id: assignment.id,
            courseId: assignment.courseId,
            title: assignment.title,
            environment: assignment.environment,
            startTime: assignment.startTime,
            deadline: assignment.deadline,
            durationMinutes: assignment.durationMinutes,
            status: assignment.status,
            hasAccessCode: true,
            isLocked: true,
            message: 'Đề thi yêu cầu mã mở đề (Passcode). Vui lòng nhập mã để xem nội dung đề thi.',
            course: assignment.course,
          };
        }
      }
    }

    return {
      ...assignment,
      hasAccessCode: Boolean(assignment.accessCode),
      isLocked: false,
      accessCode: isLecturerOrAdmin ? assignment.accessCode : undefined,
    };
  }
}
