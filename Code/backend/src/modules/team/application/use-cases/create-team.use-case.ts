import { ITeamRepository } from '../../domain/repositories/team.repository.interface.js';
import { ICourseRepository } from '../../../course/domain/repositories/course.repository.interface.js';
import { Team } from '../../domain/entities/team.entity.js';
import { CreateTeamInput } from '../dtos/team.dto.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';
import { validateGitHubRepositoryUrl } from '../../../submission/infrastructure/storage/github-url.validator.js';
import { validatePublicDeploymentUrl } from '../../../submission/infrastructure/storage/deployed-url.validator.js';

export class CreateTeamUseCase {
  constructor(
    private readonly teamRepository: ITeamRepository,
    private readonly courseRepository: ICourseRepository
  ) {}

  async execute(input: CreateTeamInput & { leaderId: string }): Promise<Team> {
    const course = await this.courseRepository.findById(input.courseId);
    if (!course) throw new NotFoundError('Không tìm thấy môn học.');

    const isEnrolled = await this.courseRepository.isStudentEnrolled(input.courseId, input.leaderId);
    if (!isEnrolled) throw new ForbiddenError('Bạn cần ghi danh môn học trước khi tạo nhóm.');

    const existingTeam = await this.teamRepository.findByUserAndCourse(
      input.leaderId,
      input.courseId
    );

    if (existingTeam) {
      throw new ConflictError('Bạn đã tham gia một nhóm khác trong môn học này rồi');
    }

    const gitRepoUrl = input.gitRepoUrl ? validateGitHubRepositoryUrl(input.gitRepoUrl) : null;
    const deployedUrl = input.deployedUrl
      ? await validatePublicDeploymentUrl(input.deployedUrl)
      : null;

    return this.teamRepository.create({
      courseId: input.courseId,
      name: input.name,
      leaderId: input.leaderId,
      projectTitle: input.projectTitle || null,
      gitRepoUrl,
      deployedUrl,
    });
  }
}
