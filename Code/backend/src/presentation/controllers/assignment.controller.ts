import { Request, Response, NextFunction } from 'express';
import { createAssignmentUseCase } from '../../application/use-cases/assignments/create-assignment.use-case.js';
import { updateAssignmentUseCase } from '../../application/use-cases/assignments/update-assignment.use-case.js';
import { getAssignmentDetailUseCase } from '../../application/use-cases/assignments/get-assignment-detail.use-case.js';
import { manageTestCasesUseCase } from '../../application/use-cases/assignments/manage-testcases.use-case.js';
import { manageRubricsUseCase } from '../../application/use-cases/assignments/manage-rubrics.use-case.js';

export class AssignmentController {
  async createAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await createAssignmentUseCase.execute(req.body);
      return res.status(201).json({
        success: true,
        message: 'Tạo đề thi PE thành công',
        data: assignment,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getAssignmentDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const isStudent = req.query.role === 'STUDENT';
      const assignment = await getAssignmentDetailUseCase.execute(id, { isStudent });

      return res.status(200).json({
        success: true,
        data: assignment,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async listAssignmentsByCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const assignments = await getAssignmentDetailUseCase.listByCourse(courseId);

      return res.status(200).json({
        success: true,
        data: assignments,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await updateAssignmentUseCase.execute(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Cập nhật đề thi PE thành công',
        data: updated,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // === Test Cases Handlers ===

  async addTestCases(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { testCases } = req.body;
      const result = await manageTestCasesUseCase.addTestCases(id, testCases);

      return res.status(201).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getTestCases(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { questionNo } = req.query;
      const testCases = await manageTestCasesUseCase.getTestCases(id, questionNo as string | undefined);

      return res.status(200).json({
        success: true,
        data: testCases,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateTestCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { testCaseId } = req.params;
      const updated = await manageTestCasesUseCase.updateTestCase(testCaseId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Cập nhật testcase thành công',
        data: updated,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteTestCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { testCaseId } = req.params;
      const result = await manageTestCasesUseCase.deleteTestCase(testCaseId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // === Rubric Rules & Solutions Handlers ===

  async setRubricRules(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { rules } = req.body;
      const result = await manageRubricsUseCase.setRubricRules(id, rules);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getRubricRules(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const rules = await manageRubricsUseCase.getRubricRules(id);

      return res.status(200).json({
        success: true,
        data: rules,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async upsertSolution(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const solution = await manageRubricsUseCase.upsertSolution(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Nạp đáp án mẫu thành công',
        data: solution,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getSolutions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const solutions = await manageRubricsUseCase.getSolutions(id);

      return res.status(200).json({
        success: true,
        data: solutions,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const assignmentController = new AssignmentController();
