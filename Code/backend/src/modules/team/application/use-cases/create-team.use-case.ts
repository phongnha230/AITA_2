import { ITeamRepository } from '../../domain/repositories/team.repository.interface.js';
import { Team } from '../../domain/entities/team.entity.js';
import { CreateTeamInput } from '../dtos/team.dto.js';
import { ConflictError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

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

    return this.teamRepository.create({
      courseId: input.courseId,
      name: input.name,
      leaderId: input.leaderId,
      projectTitle: input.projectTitle || null,
      gitRepoUrl: input.gitRepoUrl || null,
      deployedUrl: input.deployedUrl || null,
    });
  }
}
