import { Request, Response, NextFunction } from 'express';
import { CreateAssignmentUseCase } from '../../application/use-cases/create-assignment.use-case.js';
import { GetAssignmentDetailUseCase } from '../../application/use-cases/get-assignment-detail.use-case.js';
import { GetAssignmentsByCourseUseCase } from '../../application/use-cases/get-assignments-by-course.use-case.js';
import { UpdateAssignmentUseCase } from '../../application/use-cases/update-assignment.use-case.js';
import { ManageTestCasesUseCase } from '../../application/use-cases/manage-testcases.use-case.js';
import { ManageRubricsUseCase } from '../../application/use-cases/manage-rubrics.use-case.js';
import { ManageSolutionsUseCase } from '../../application/use-cases/manage-solutions.use-case.js';
import { GetProctoringDataUseCase } from '../../application/use-cases/get-proctoring-data.use-case.js';
import { ControlSessionUseCase } from '../../application/use-cases/control-session.use-case.js';
import { DeleteAssignmentUseCase } from '../../application/use-cases/delete-assignment.use-case.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';
import { UnauthorizedError } from '../../../../shared/domain/exceptions/app.error.js';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { SaveAssignmentPackageSchema } from '../../application/dtos/assignment.dto.js';
import { SaveAssignmentPackageUseCase } from '../../application/use-cases/save-assignment-package.use-case.js';
import { ExamSessionUseCase } from '../../application/use-cases/exam-session.use-case.js';
import { isRemoteUrl, removeAssignmentFile, resolveAssignmentFile, storeAssignmentFiles } from '../../infrastructure/storage/assignment-file.storage.js';
import { AppError, NotFoundError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

export class AssignmentController {
  constructor(
    private readonly createAssignmentUseCase: CreateAssignmentUseCase,
    private readonly getAssignmentDetailUseCase: GetAssignmentDetailUseCase,
    private readonly getAssignmentsByCourseUseCase: GetAssignmentsByCourseUseCase,
    private readonly updateAssignmentUseCase: UpdateAssignmentUseCase,
    private readonly deleteAssignmentUseCase: DeleteAssignmentUseCase,
    private readonly manageTestCasesUseCase: ManageTestCasesUseCase,
    private readonly manageRubricsUseCase: ManageRubricsUseCase,
    private readonly manageSolutionsUseCase: ManageSolutionsUseCase,
    private readonly getProctoringDataUseCase: GetProctoringDataUseCase,
    private readonly controlSessionUseCase: ControlSessionUseCase,
    private readonly saveAssignmentPackageUseCase: SaveAssignmentPackageUseCase,
    private readonly examSessionUseCase: ExamSessionUseCase
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

  saveAssignmentPackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const pdf = files?.pdf?.[0];
    const starter = files?.starter?.[0];
    let storedFiles: { pdfFilePath?: string; starterCodePath?: string } = {};
    try {
      if (!req.user?.userId) throw new UnauthorizedError('Người dùng chưa xác thực.');
      if (pdf && pdf.size > 25 * 1024 * 1024) throw new ValidationError('PDF không được vượt quá 25 MiB.');
      const payloadText = req.body?.payload;
      if (typeof payloadText !== 'string') throw new ValidationError('Thiếu payload đề thi.');
      let payloadValue: unknown;
      try {
        payloadValue = JSON.parse(payloadText) as unknown;
      } catch {
        throw new ValidationError('Payload đề thi không phải JSON hợp lệ.');
      }
      const parsed = SaveAssignmentPackageSchema.safeParse(payloadValue);
      if (!parsed.success) {
        console.error('[AssignmentController] saveAssignmentPackage validation error:', JSON.stringify(parsed.error.format(), null, 2));
        const details = parsed.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new ValidationError('Thông tin đề thi không hợp lệ.', details);
      }

      const isUpdate = Boolean(req.params.id);
      const assignmentId = req.params.id || randomUUID();
      storedFiles = await storeAssignmentFiles(assignmentId, { pdf, starter });
      const result = await this.saveAssignmentPackageUseCase.execute(
        assignmentId,
        parsed.data,
        { userId: req.user.userId, role: req.user.role },
        isUpdate,
        {
          pdfFilePath: storedFiles.pdfFilePath ?? (parsed.data.removePdf ? null : undefined),
          starterCodePath: storedFiles.starterCodePath ?? (parsed.data.removeStarter ? null : undefined),
        }
      );

      if ((storedFiles.pdfFilePath || parsed.data.removePdf) && result.previousFiles.pdfFilePath) {
        await removeAssignmentFile(result.previousFiles.pdfFilePath).catch((error: unknown) =>
          console.error('[AssignmentController] Unable to remove replaced PDF', { error })
        );
      }
      if ((storedFiles.starterCodePath || parsed.data.removeStarter) && result.previousFiles.starterCodePath) {
        await removeAssignmentFile(result.previousFiles.starterCodePath).catch((error: unknown) =>
          console.error('[AssignmentController] Unable to remove replaced starter ZIP', { error })
        );
      }
      sendSuccess(res, result.assignment.toJSON(), isUpdate ? 'Cập nhật đề thi thành công.' : 'Tạo đề thi thành công!', isUpdate ? 200 : 201);
    } catch (error) {
      await Promise.all([
        removeAssignmentFile(storedFiles.pdfFilePath),
        removeAssignmentFile(storedFiles.starterCodePath),
      ]).catch((cleanupError: unknown) => console.error('[AssignmentController] Failed to clean staged assignment files', { cleanupError }));
      next(error);
    }
  };

  downloadAssignmentFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const kind = req.params.kind;
      if (kind !== 'pdf' && kind !== 'starter') throw new ValidationError('Loại tệp không hợp lệ.');
      const accessCode = (req.query.accessCode as string) || (req.headers['x-access-code'] as string);
      const assignment = await this.getAssignmentDetailUseCase.execute(req.params.id, 'LECTURER', accessCode);
      const targetPath = kind === 'pdf' ? assignment.pdfFilePath : assignment.starterCodePath;
      if (typeof targetPath !== 'string' || !targetPath) throw new ValidationError('Đề thi chưa có tệp này.');
      if (isRemoteUrl(targetPath)) {
        try {
          const response = await fetch(targetPath);
          if (!response.ok) {
            throw new NotFoundError(`Không thể tải tệp từ Cloudinary (mã lỗi phản hồi: ${response.status}).`);
          }
          if (kind === 'pdf') {
            res.type('application/pdf').setHeader('Content-Disposition', 'inline; filename="exam-paper.pdf"');
          } else {
            res.type('application/zip').setHeader('Content-Disposition', 'attachment; filename="starter-code.zip"');
          }
          if (response.body) {
            // @ts-ignore
            Readable.fromWeb(response.body).pipe(res);
          } else {
            const buffer = Buffer.from(await response.arrayBuffer());
            res.send(buffer);
          }
          return;
        } catch (cloudErr: any) {
          if (cloudErr instanceof AppError) throw cloudErr;
          throw new AppError(`Lỗi kết nối khi tải tệp từ máy chủ lưu trữ: ${cloudErr.message}`, 502);
        }
      }

      try {
        const absolutePath = resolveAssignmentFile(targetPath);
      await fs.access(absolutePath);
      if (kind === 'pdf') {
        res.type('application/pdf').setHeader('Content-Disposition', 'inline; filename="exam-paper.pdf"');
        res.sendFile(absolutePath, (error) => {
          if (error && !res.headersSent) next(error);
        });
      } else {
        res.download(absolutePath, 'starter-code.zip', (error) => {
          if (error && !res.headersSent) next(error);
        });
      }
      } catch (fileErr: any) {
        if (fileErr.code === 'ENOENT') {
          throw new NotFoundError(
            'Tệp đề thi không tìm thấy trên bộ nhớ cục bộ của máy chủ này (tệp được tạo ở máy khác trước khi nâng cấp Cloudinary). Vui lòng cập nhật lại đề thi.'
          );
        }
        throw fileErr;
      }
    } catch (error) {
      next(error);
    }
  };

  getAssignmentDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accessCode = (req.query.accessCode as string) || (req.headers['x-access-code'] as string);
      const assignment = await this.getAssignmentDetailUseCase.execute(
        req.params.id,
        req.user?.role,
        accessCode
      );
      sendSuccess(res, assignment, 'Lấy chi tiết đề thi thành công.');
    } catch (error) {
      next(error);
    }
  };

  getAssignmentsByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignments = await this.getAssignmentsByCourseUseCase.execute(req.params.courseId, req.user?.role);
      sendSuccess(res, assignments, 'Lấy danh sách đề thi theo khóa học thành công.');
    } catch (error) {
      next(error);
    }
  };

  unlockExam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) throw new UnauthorizedError();
      const status = await this.examSessionUseCase.unlock(
        req.params.id,
        req.user.userId,
        req.user.role,
        req.body.accessCode
      );
      sendSuccess(res, status, 'Đã mở quyền truy cập ca thi.');
    } catch (error) { next(error); }
  };

  getExamSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) throw new UnauthorizedError();
      const status = await this.examSessionUseCase.status(req.params.id, req.user.userId, req.user.role);
      sendSuccess(res, status, 'Lấy trạng thái ca thi thành công.');
    } catch (error) { next(error); }
  };

  updateAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requester = req.user ? { userId: req.user.userId, role: req.user.role } : undefined;
      const updated = await this.updateAssignmentUseCase.execute(req.params.id, req.body, requester);
      sendSuccess(res, updated, 'Cập nhật đề thi thành công.');
    } catch (error) {
      next(error);
    }
  };

  deleteAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteAssignmentUseCase.execute(req.params.id);
      sendSuccess(res, null, 'Đã xóa đề thi thành công.');
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

  // --- Live Proctoring & Session Control ---
  getProctoringRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const rooms = await this.getProctoringDataUseCase.getAllRooms(req.user);
      sendSuccess(res, rooms, 'Lấy danh sách ca thi thành công.');
    } catch (error) {
      next(error);
    }
  };

  getProctoringData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.getProctoringDataUseCase.execute(req.params.id);
      sendSuccess(res, data, 'Lấy thông tin ca thi thành công.');
    } catch (error) {
      next(error);
    }
  };

  controlSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requester = req.user ? { userId: req.user.userId, role: req.user.role } : undefined;
      const result = await this.controlSessionUseCase.execute(req.params.id, req.body, requester);
      sendSuccess(res, result, result.message || 'Cập nhật trạng thái ca thi thành công.');
    } catch (error) {
      next(error);
    }
  };
}

