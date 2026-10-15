import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { UpdateAssignmentDto } from '../dtos/assignment.dto.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { parseWebTestScript } from '../../../sandbox/domain/web-test-script.js';

export class UpdateAssignmentUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async execute(
    assignmentId: string,
    dto: UpdateAssignmentDto,
    requester?: { userId: string; role: string }
  ) {
    const existing = await this.assignmentRepository.findById(assignmentId);
    if (!existing) {
      throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);
    }

    if (requester && requester.role !== 'ADMIN' && existing.createdBy !== requester.userId) {
      throw new ForbiddenError('Bạn không có quyền chỉnh sửa đề thi của giảng viên khác.');
    }

    if (dto.status === 'PUBLISHED' && existing.toJSON().gradingVersion === 2) {
      const [testCases, rubricRules, solutions] = await Promise.all([
        this.assignmentRepository.getTestCases(assignmentId, true),
        this.assignmentRepository.getRubricRules(assignmentId),
        this.assignmentRepository.getSolutions(assignmentId),
      ]);
      const testcasePoints = testCases.reduce((sum, testCase) => sum + Number(testCase.points), 0);
      const algorithmPoints = rubricRules
        .filter((rule) => rule.criterionType === 'ALGORITHM')
        .reduce((sum, rule) => sum + Number(rule.maxPoints), 0);
      const cleanCodePoints = rubricRules
        .filter((rule) => rule.criterionType === 'CLEAN_CODE')
        .reduce((sum, rule) => sum + Number(rule.maxPoints), 0);
      const hasLegacyCriteria = rubricRules.some((rule) => rule.criterionType === 'GENERAL');

      if (Math.abs(testcasePoints - 7) >= 0.01) {
        throw new ValidationError('Không thể công bố đề: tổng điểm test case phải bằng 7.');
      }
      if (existing.environment === 'REACT_JS') {
        try {
          testCases.forEach((testCase) => parseWebTestScript(testCase.stdinInput ?? ''));
        } catch (error) {
          throw new ValidationError(
            `Không thể công bố đề: ${error instanceof Error ? error.message : 'kịch bản Playwright không hợp lệ.'}`
          );
        }
      }
      if (Math.abs(algorithmPoints - 2) >= 0.001 || Math.abs(cleanCodePoints - 1) >= 0.001 || hasLegacyCriteria) {
        throw new ValidationError(
          existing.environment === 'REACT_JS'
            ? 'Không thể công bố đề: rubric React cần 2 điểm cấu trúc và 1 điểm Clean Code.'
            : 'Không thể công bố đề: rubric cần 2 điểm thuật toán và 1 điểm Clean Code.'
        );
      }
      if (existing.environment !== 'REACT_JS') {
        const activeSolution = solutions.find((solution) => solution.isActive);
        if (!activeSolution?.expectedTimeComplexity?.trim()) {
          throw new ValidationError('Không thể công bố đề: cần lời giải tham chiếu và Big-O thời gian kỳ vọng.');
        }
      }
    }

    const updated = await this.assignmentRepository.update(assignmentId, {
      ...(dto.title && { title: dto.title.trim() }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.environment && { environment: dto.environment }),
      ...(dto.submissionType && { submissionType: dto.submissionType }),
      ...(dto.startTime && { startTime: new Date(dto.startTime) }),
      ...(dto.deadline && { deadline: new Date(dto.deadline) }),
      ...(dto.allowGitSubmission !== undefined && { allowGitSubmission: dto.allowGitSubmission }),
      ...(dto.allowZipSubmission !== undefined && { allowZipSubmission: dto.allowZipSubmission }),
      ...(dto.status && { status: dto.status }),
    });

    return updated.toJSON();
  }
}
