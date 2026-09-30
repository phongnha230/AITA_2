import { Team } from '../entities/team.entity.js';

export interface CreateTeamData {
  courseId: string;
  name: string;
  leaderId: string;
  projectTitle?: string | null;
  gitRepoUrl?: string | null;
  deployedUrl?: string | null;
}

export interface ITeamRepository {
  create(data: CreateTeamData): Promise<Team>;
  findById(id: string): Promise<Team | null>;
  findByCourse(courseId: string): Promise<Team[]>;
  findByUserAndCourse(userId: string, courseId: string): Promise<Team | null>;
  addMember(teamId: string, userId: string, role?: string): Promise<Team>;
  removeMember(teamId: string, userId: string): Promise<void>;
  update(id: string, data: Partial<CreateTeamData>): Promise<Team>;
  delete(id: string): Promise<void>;
}
