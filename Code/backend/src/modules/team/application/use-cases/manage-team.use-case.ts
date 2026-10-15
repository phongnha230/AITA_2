import { ITeamRepository } from '../../domain/repositories/team.repository.interface.js';
import { IUserRepository } from '../../../user/domain/repositories/user.repository.interface.js';
import { ICourseRepository } from '../../../course/domain/repositories/course.repository.interface.js';
import { Team } from '../../domain/entities/team.entity.js';
import { UpdateTeamInput } from '../dtos/team.dto.js';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../../../../shared/domain/exceptions/app.error.js';

export class ManageTeamUseCase {
  constructor(
    private readonly teamRepository: ITeamRepository,
    private readonly userRepository: IUserRepository,
    private readonly courseRepository: ICourseRepository
  ) {}

  async getTeamDetails(teamId: string): Promise<Team> {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new NotFoundError(`Không tìm thấy nhóm với ID: ${teamId}`);
    }
    return team;
  }

  async getCourseTeams(courseId: string): Promise<Team[]> {
    return this.teamRepository.findByCourse(courseId);
  }

  async addMemberByEmail(
    teamId: string,
    studentEmail: string,
    requesterUserId: string,
    role: string = 'MEMBER'
  ): Promise<Team> {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new NotFoundError('Không tìm thấy nhóm');
    }

    if (team.leaderId !== requesterUserId) {
      throw new ForbiddenError('Chỉ có Trưởng nhóm mới có quyền mời/thêm thành viên');
    }

    const trimmedEmail = studentEmail.toLowerCase().trim();
    const studentUser = (await this.userRepository.findByEmail(trimmedEmail)) ||
      (await this.userRepository.findByUsernameOrEmail(trimmedEmail));

    if (!studentUser) {
      throw new NotFoundError(`Không tìm thấy tài khoản sinh viên với email: ${studentEmail}`);
    }

    // Kiểm tra xem sinh viên đã có trong lớp chưa
    const isEnrolled = await this.courseRepository.isStudentEnrolled(team.courseId, studentUser.id);

    if (!isEnrolled) {
      throw new ConflictError('Sinh viên này chưa tham gia vào môn học');
    }

    // Kiểm tra xem sinh viên đã ở trong nhóm nào khác chưa
    const existingInAnotherTeam = await this.teamRepository.findByUserAndCourse(
      studentUser.id,
      team.courseId
    );

    if (existingInAnotherTeam) {
      throw new ConflictError('Sinh viên này đã thuộc về một nhóm khác trong lớp');
    }

    return this.teamRepository.addMember(teamId, studentUser.id, role);
  }

  async removeMember(teamId: string, memberUserId: string, requesterUserId: string): Promise<void> {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new NotFoundError('Không tìm thấy nhóm');
    }

    // Leader can kick members, member can self-leave (if not leader)
    if (team.leaderId !== requesterUserId && memberUserId !== requesterUserId) {
      throw new ForbiddenError('Bạn không có quyền xóa thành viên này khỏi nhóm');
    }

    if (team.leaderId === memberUserId) {
      throw new ConflictError('Trưởng nhóm không thể tự rời nhóm. Hãy chuyển quyền Trưởng nhóm trước');
    }

    await this.teamRepository.removeMember(teamId, memberUserId);
  }

  async updateTeam(
    teamId: string,
    data: UpdateTeamInput,
    requesterUserId: string
  ): Promise<Team> {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new NotFoundError('Không tìm thấy nhóm');
    }

    if (team.leaderId !== requesterUserId) {
      throw new ForbiddenError('Chỉ có Trưởng nhóm mới có quyền cập nhật thông tin nhóm');
    }

    return this.teamRepository.update(teamId, data);
  }
}
