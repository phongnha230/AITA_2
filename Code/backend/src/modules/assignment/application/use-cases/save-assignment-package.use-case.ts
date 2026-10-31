import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { ICourseRepository } from '../../../course/domain/repositories/course.repository.interface.js';
import { SaveAssignmentPackageDto } from '../dtos/assignment.dto.js';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { parseWebTestScript } from '../../../sandbox/domain/web-test-script.js';

export class SaveAssignmentPackageUseCase {
  constructor(
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly courseRepository: ICourseRepository
  ) {}

  async execute(
    assignmentId: string,
    dto: SaveAssignmentPackageDto,
    requester: { userId: string; role: string },
    isUpdate: boolean,
    filePaths: { pdfFilePath?: string | null; starterCodePath?: string | null }
  ) {
    const existing = isUpdate ? await this.assignmentRepository.findById(assignmentId) : null;
    if (isUpdate && !existing) throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);

    if (existing) {
      const currentCourse = await this.courseRepository.findById(existing.courseId);
      if (!currentCourse) throw new NotFoundError(`Khóa học với ID: ${existing.courseId}`);
      if (requester.role !== 'ADMIN' && currentCourse.lecturerId !== requester.userId) {
        throw new ForbiddenError('Bạn không có quyền chỉnh sửa đề thi của khóa học này.');
      }
      if (await this.assignmentRepository.countSubmissions(assignmentId) > 0) {
        throw new ConflictError('Không thể sửa đề thi sau khi đã có bài nộp.');
      }
    }

    const targetCourse = await this.courseRepository.findById(dto.assignment.courseId);
    if (!targetCourse) throw new NotFoundError(`Khóa học với ID: ${dto.assignment.courseId}`);
    if (requester.role !== 'ADMIN' && targetCourse.lecturerId !== requester.userId) {
      throw new ForbiddenError('Bạn không có quyền tạo đề thi trong khóa học này.');
    }

    let functionalPoints = dto.testCases.reduce((sum, testCase) => sum + testCase.points, 0);
    const rubricPoints = dto.rubricRules.reduce((sum, rule) => sum + rule.maxPoints, 0);

    // Auto-adjust micro floating-point rounding deviations (e.g., 9.98 or 10.02)
    const pointDiff = dto.assignment.functionalMaxScore - functionalPoints;
    if (Math.abs(pointDiff) <= 0.05 && Math.abs(pointDiff) > 0.000001 && dto.testCases.length > 0) {
      const lastTc = dto.testCases[dto.testCases.length - 1];
      lastTc.points = Number((lastTc.points + pointDiff).toFixed(2));
      functionalPoints = dto.assignment.functionalMaxScore;
    }

    if (Math.abs(functionalPoints - dto.assignment.functionalMaxScore) > 0.01) {
      console.error(`[SaveAssignmentPackageUseCase] Point mismatch: functionalPoints=${functionalPoints}, expected=${dto.assignment.functionalMaxScore}`);
      throw new ValidationError(`Tổng điểm testcase phải bằng ${dto.assignment.functionalMaxScore}. Hiện tại tổng điểm các testcase là ${functionalPoints.toFixed(2)}.`);
    }
    if (dto.assignment.environment === 'REACT_JS') {
      for (const testCase of dto.testCases) {
        let steps: ReturnType<typeof parseWebTestScript>;
        try {
          steps = parseWebTestScript(testCase.stdinInput ?? '');
        } catch (error) {
          throw new ValidationError(error instanceof Error ? error.message : 'Kịch bản Playwright không hợp lệ.');
        }
        if (!steps.some((step) => step.action.startsWith('ASSERT_'))) {
          throw new ValidationError(`Luồng “${testCase.label}” cần ít nhất một bước Kiểm tra để được tính điểm.`);
        }
      }
    }
    if (Math.abs(rubricPoints - dto.assignment.algorithmMaxScore - dto.assignment.cleanCodeMaxScore) > 0.01) {
      throw new ValidationError('Tổng điểm rubric phải khớp cấu hình thuật toán và Clean Code.');
    }

    const savedAssignment = await this.assignmentRepository.saveComplete(
      assignmentId,
      {
        ...dto.assignment,
        createdBy: existing?.createdBy ?? requester.userId,
        pdfFilePath: filePaths.pdfFilePath,
        starterCodePath: filePaths.starterCodePath,
      },
      dto.testCases,
      dto.rubricRules,
      dto.solution,
      dto.removeSolution
    );
    return {
      assignment: savedAssignment,
      previousFiles: {
        pdfFilePath: existing?.pdfFilePath ?? null,
        starterCodePath: existing?.starterCodePath ?? null,
      },
    };
  }
}
