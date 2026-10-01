import { Request, Response, NextFunction } from 'express';
import { CreateAssignmentUseCase } from '../../application/use-cases/create-assignment.use-case.js';
import { GetAssignmentDetailUseCase } from '../../application/use-cases/get-assignment-detail.use-case.js';
import { GetAssignmentsByCourseUseCase } from '../../application/use-cases/get-assignments-by-course.use-case.js';
import { UpdateAssignmentUseCase } from '../../application/use-cases/update-assignment.use-case.js';
import { ManageTestCasesUseCase } from '../../application/use-cases/manage-testcases.use-case.js';
import { ManageRubricsUseCase } from '../../application/use-cases/manage-rubrics.use-case.js';
import { ManageSolutionsUseCase } from '../../application/use-cases/manage-solutions.use-case.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';
import { UnauthorizedError } from '../../../../shared/domain/exceptions/app.error.js';

export class AssignmentController {
  constructor(
    private readonly createAssignmentUseCase: CreateAssignmentUseCase,
    private readonly getAssignmentDetailUseCase: GetAssignmentDetailUseCase,
    private readonly getAssignmentsByCourseUseCase: GetAssignmentsByCourseUseCase,
    private readonly updateAssignmentUseCase: UpdateAssignmentUseCase,
    private readonly manageTestCasesUseCase: ManageTestCasesUseCase,
    private readonly manageRubricsUseCase: ManageRubricsUseCase,
    private readonly manageSolutionsUseCase: ManageSolutionsUseCase
  ) {}

  createAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Người dùng chưa xác thực.');
      }
      const assignment = await this.createAssignmentUseCase.execute(req.body, req.user.userId);
      sendSuccess(res, assignment, 'Tạo đề thi thành công!', 201);
    } catch (error) {
      next(error);
    }
  };

  getAssignmentDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignment = await this.getAssignmentDetailUseCase.execute(req.params.id, req.user?.role);
      sendSuccess(res, assignment, 'Lấy chi tiết đề thi thành công.');
    } catch (error) {
      next(error);
    }
  };

  getAssignmentsByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignments = await this.getAssignmentsByCourseUseCase.execute(req.params.courseId);
      sendSuccess(res, assignments, 'Lấy danh sách đề thi theo khóa học thành công.');
    } catch (error) {
      next(error);
    }
  };

  updateAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.updateAssignmentUseCase.execute(req.params.id, req.body);
      sendSuccess(res, updated, 'Cập nhật đề thi thành công.');
    } catch (error) {
      next(error);
    }
  };

  // --- Test Cases ---
  addTestCase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const testCase = await this.manageTestCasesUseCase.addTestCase(req.params.id, req.body);
      sendSuccess(res, testCase, 'Thêm test case thành công!', 201);
    } catch (error) {
      next(error);
    }
  };

  updateTestCase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.manageTestCasesUseCase.updateTestCase(req.params.testCaseId, req.body);
      sendSuccess(res, updated, 'Cập nhật test case thành công.');
    } catch (error) {
      next(error);
    }
  };

  deleteTestCase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.manageTestCasesUseCase.deleteTestCase(req.params.testCaseId);
      sendSuccess(res, null, 'Đã xóa test case thành công.');
    } catch (error) {
      next(error);
    }
  };

  getTestCases = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isLecturerOrAdmin = req.user?.role === 'LECTURER' || req.user?.role === 'ADMIN';
      const testCases = await this.manageTestCasesUseCase.getTestCases(req.params.id, isLecturerOrAdmin);
      sendSuccess(res, testCases, 'Lấy danh sách test cases thành công.');
    } catch (error) {
      next(error);
    }
  };

  // --- Rubrics ---
  setRubricRules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rules = await this.manageRubricsUseCase.setRules(req.params.id, req.body);
      sendSuccess(res, rules, 'Thiết lập tiêu chí Rubric thành công!');
    } catch (error) {
      next(error);
    }
  };

  getRubricRules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rules = await this.manageRubricsUseCase.getRules(req.params.id);
      sendSuccess(res, rules, 'Lấy danh sách tiêu chí Rubric thành công.');
    } catch (error) {
      next(error);
    }
  };

  // --- Solutions ---
  upsertSolution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const solution = await this.manageSolutionsUseCase.upsert(req.params.id, req.body);
      sendSuccess(res, solution, 'Lưu đáp án mẫu thành công!', 201);
    } catch (error) {
      next(error);
    }
  };

  getSolutions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const solutions = await this.manageSolutionsUseCase.getSolutions(req.params.id);
      sendSuccess(res, solutions, 'Lấy danh sách đáp án mẫu thành công.');
    } catch (error) {
      next(error);
    }
  };
}
