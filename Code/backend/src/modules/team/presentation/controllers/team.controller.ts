import { Request, Response, NextFunction } from 'express';
import { CreateTeamUseCase } from '../../application/use-cases/create-team.use-case.js';
import { ManageTeamUseCase } from '../../application/use-cases/manage-team.use-case.js';
import {
  createTeamSchema,
  addTeamMemberSchema,
  updateTeamSchema,
} from '../../application/dtos/team.dto.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';
import { UnauthorizedError } from '../../../../shared/domain/exceptions/app.error.js';

export class TeamController {
  constructor(
    private readonly createTeamUseCase: CreateTeamUseCase,
    private readonly manageTeamUseCase: ManageTeamUseCase
  ) {}

  createTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError('Cần đăng nhập để thực hiện');

      const validated = createTeamSchema.parse(req.body);
      const team = await this.createTeamUseCase.execute({
        ...validated,
        leaderId: userId,
      });

      sendSuccess(res, team.toJSON(), 'Tạo nhóm thành công', 201);
    } catch (error) {
      next(error);
    }
  };

  getTeamDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const team = await this.manageTeamUseCase.getTeamDetails(req.params.id);
      sendSuccess(res, team.toJSON(), 'Lấy thông tin nhóm thành công');
    } catch (error) {
      next(error);
    }
  };

  getCourseTeams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teams = await this.manageTeamUseCase.getCourseTeams(req.params.courseId);
      sendSuccess(res, teams.map((t) => t.toJSON()), 'Lấy danh sách nhóm trong môn học thành công');
    } catch (error) {
      next(error);
    }
  };

  addMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError('Cần đăng nhập để thực hiện');

      const validated = addTeamMemberSchema.parse(req.body);
      const team = await this.manageTeamUseCase.addMemberByEmail(
        req.params.id,
        validated.studentEmail,
        userId,
        validated.role
      );

      sendSuccess(res, team.toJSON(), 'Thêm thành viên vào nhóm thành công');
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError('Cần đăng nhập để thực hiện');

      await this.manageTeamUseCase.removeMember(
        req.params.id,
        req.params.userId,
        userId
      );

      sendSuccess(res, null, 'Xóa thành viên khỏi nhóm thành công');
    } catch (error) {
      next(error);
    }
  };

  updateTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError('Cần đăng nhập để thực hiện');

      const validated = updateTeamSchema.parse(req.body);
      const team = await this.manageTeamUseCase.updateTeam(req.params.id, validated, userId);

      sendSuccess(res, team.toJSON(), 'Cập nhật thông tin nhóm thành công');
    } catch (error) {
      next(error);
    }
  };
}
