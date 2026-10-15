import { ITeamRepository } from '../../domain/repositories/team.repository.interface.js';
import { Team } from '../../domain/entities/team.entity.js';
import { CreateTeamInput } from '../dtos/team.dto.js';
import { ConflictError } from '../../../../shared/domain/exceptions/app.error.js';
import { validateGitHubRepositoryUrl } from '../../../submission/infrastructure/storage/github-url.validator.js';
import { validatePublicDeploymentUrl } from '../../../submission/infrastructure/storage/deployed-url.validator.js';

export class CreateTeamUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(input: CreateTeamInput & { leaderId: string }): Promise<Team> {
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
