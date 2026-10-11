import { Request, Response, NextFunction } from 'express';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case.js';
import { GetStudentPortfolioUseCase } from '../../application/use-cases/get-student-portfolio.use-case.js';
import { GetLecturerDashboardUseCase } from '../../application/use-cases/get-lecturer-dashboard.use-case.js';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case.js';
import { GetUsersUseCase } from '../../application/use-cases/get-users.use-case.js';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case.js';
import { AdminCreateUserUseCase } from '../../application/use-cases/admin-create-user.use-case.js';
import { AdminCreateBatchUsersUseCase } from '../../application/use-cases/admin-create-batch-users.use-case.js';
import { AdminUpdateUserUseCase } from '../../application/use-cases/admin-update-user.use-case.js';
import { AdminResetPasswordUseCase } from '../../application/use-cases/admin-reset-password.use-case.js';
import { GetAdminDashboardUseCase } from '../../application/use-cases/get-admin-dashboard.use-case.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';
import { UnauthorizedError } from '../../../../shared/domain/exceptions/app.error.js';

export class UserController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly getStudentPortfolioUseCase: GetStudentPortfolioUseCase,
    private readonly getLecturerDashboardUseCase: GetLecturerDashboardUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly adminCreateUserUseCase: AdminCreateUserUseCase,
    private readonly adminCreateBatchUsersUseCase: AdminCreateBatchUsersUseCase,
    private readonly adminUpdateUserUseCase: AdminUpdateUserUseCase,
    private readonly adminResetPasswordUseCase: AdminResetPasswordUseCase,
    private readonly getAdminDashboardUseCase?: GetAdminDashboardUseCase
  ) {}

  getAdminDashboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.getAdminDashboardUseCase) {
        throw new Error('GetAdminDashboardUseCase chưa được khởi tạo.');
      }
      const data = await this.getAdminDashboardUseCase.execute();
      sendSuccess(res, data, 'Lấy bảng điều khiển tổng quan quản trị viên thành công.');
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Người dùng chưa xác thực.');
      }
      const profile = await this.getProfileUseCase.execute(req.user.userId);
      sendSuccess(res, profile, 'Lấy thông tin cá nhân thành công.');
    } catch (error) {
      next(error);
    }
  };

  getStudentPortfolio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Người dùng chưa xác thực.');
      }
      const portfolio = await this.getStudentPortfolioUseCase.execute(req.user.userId);
      sendSuccess(res, portfolio, 'Lấy hồ sơ học tập và bảng điều khiển sinh viên thành công.');
    } catch (error) {
      next(error);
    }
  };

  getLecturerDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Người dùng chưa xác thực.');
      }
      const dashboard = await this.getLecturerDashboardUseCase.execute(req.user.userId);
      sendSuccess(res, dashboard, 'Lấy bảng điều khiển tổng quan giảng viên thành công.');
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Người dùng chưa xác thực.');
      }
      const updated = await this.updateProfileUseCase.execute(req.user.userId, req.body);
      sendSuccess(res, updated, 'Cập nhật thông tin cá nhân thành công.');
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getUsersUseCase.execute(req.query as any);
      sendSuccess(res, result.users, 'Lấy danh sách người dùng thành công.', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.getUserByIdUseCase.execute(req.params.id);
      sendSuccess(res, user, 'Lấy chi tiết người dùng thành công.');
    } catch (error) {
      next(error);
    }
  };

  adminCreateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.adminCreateUserUseCase.execute(req.body);
      sendSuccess(res, user, 'Tạo tài khoản người dùng thành công!', 201);
    } catch (error) {
      next(error);
    }
  };

  adminCreateBatchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminCreateBatchUsersUseCase.execute(req.body.users);
      sendSuccess(res, result, 'Xử lý import danh sách tài khoản thành công!', 201);
    } catch (error) {
      next(error);
    }
  };

  adminUpdateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.adminUpdateUserUseCase.execute(req.params.id, req.body);
      sendSuccess(res, updated, 'Cập nhật thông tin tài khoản thành công.');
    } catch (error) {
      next(error);
    }
  };

  adminResetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetUserId = req.params.id;
      const { newPassword } = req.body || {};
      const result = await this.adminResetPasswordUseCase.execute(targetUserId, newPassword);
      sendSuccess(res, result, 'Đặt lại mật khẩu cho người dùng thành công.');
    } catch (error) {
      next(error);
    }
  };
}
