import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { NotFoundError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export class GetAssignmentDetailUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async execute(assignmentId: string, userRole?: string, _accessCode?: string) {
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

    }

    const { accessCode, pdfFilePath, starterCodePath, testCases, rubricRules, solutions, ...safeAssignment } = assignment;
    return {
      ...safeAssignment,
      testCases: (testCases || []).map((tc: any) => ({
        ...tc,
        points: Number(tc.points),
      })),
      rubricRules: (rubricRules || []).map((rr: any) => ({
        ...rr,
        maxPoints: Number(rr.maxPoints),
        weight: Number(rr.weight),
      })),
      functionalMaxScore: Number(assignment.functionalMaxScore),
      algorithmMaxScore: Number(assignment.algorithmMaxScore),
      cleanCodeMaxScore: Number(assignment.cleanCodeMaxScore),
      hasAccessCode: Boolean(assignment.accessCode),
      hasPdf: Boolean(pdfFilePath),
      hasStarterCode: Boolean(starterCodePath),
      isLocked: false,
      ...(isLecturerOrAdmin ? { accessCode, pdfFilePath, starterCodePath, solutions: solutions ?? [] } : {}),
    };
  }
}
