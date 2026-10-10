import { PrismaClient } from '@prisma/client';
import {
  ITeamRepository,
  CreateTeamData,
} from '../../domain/repositories/team.repository.interface.js';
import { Team } from '../../domain/entities/team.entity.js';

export class PrismaTeamRepository implements ITeamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: any): Team {
    return new Team({
      id: raw.id,
      courseId: raw.courseId,
      name: raw.name,
      leaderId: raw.leaderId,
      projectTitle: raw.projectTitle,
      gitRepoUrl: raw.gitRepoUrl,
      deployedUrl: raw.deployedUrl,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      leader: raw.leader
        ? {
            id: raw.leader.id,
            fullName: raw.leader.fullName,
            email: raw.leader.email,
          }
        : undefined,
      members: raw.members
        ? raw.members.map((m: any) => ({
            id: m.id,
            teamId: m.teamId,
            userId: m.userId,
            role: m.role,
            joinedAt: m.joinedAt,
            user: m.user
              ? {
                  id: m.user.id,
                  fullName: m.user.fullName,
                  email: m.user.email,
                  avatarUrl: m.user.avatarUrl,
                }
              : undefined,
          }))
        : undefined,
    });
  }

  async create(data: CreateTeamData): Promise<Team> {
    const raw = await this.prisma.team.create({
      data: {
        courseId: data.courseId,
        name: data.name,
        leaderId: data.leaderId,
        projectTitle: data.projectTitle ?? null,
        gitRepoUrl: data.gitRepoUrl ?? null,
        deployedUrl: data.deployedUrl ?? null,
        members: {
          create: {
            userId: data.leaderId,
            role: 'LEADER',
          },
        },
      },
      include: {
        leader: { select: { id: true, fullName: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          },
        },
      },
    });

    return this.toDomain(raw);
  }

  async findById(id: string): Promise<Team | null> {
    const raw = await this.prisma.team.findUnique({
      where: { id },
      include: {
        leader: { select: { id: true, fullName: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          },
        },
      },
    });

    return raw ? this.toDomain(raw) : null;
  }

  async findByCourse(courseId: string): Promise<Team[]> {
    const rawList = await this.prisma.team.findMany({
      where: { courseId },
      include: {
        leader: { select: { id: true, fullName: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rawList.map((r: any) => this.toDomain(r));
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Team | null> {
    const membership = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        team: { courseId },
      },
      include: {
        team: {
          include: {
            leader: { select: { id: true, fullName: true, email: true } },
            members: {
              include: {
                user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    return membership?.team ? this.toDomain(membership.team) : null;
  }

  async addMember(teamId: string, userId: string, role: string = 'MEMBER'): Promise<Team> {
    await this.prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role,
      },
    });

    const updated = await this.findById(teamId);
    return updated!;
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    await this.prisma.teamMember.delete({
      where: {
        uk_team_member: {
          teamId,
          userId,
        },
      },
    });
  }

  async update(id: string, data: Partial<CreateTeamData>): Promise<Team> {
    const raw = await this.prisma.team.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.projectTitle !== undefined ? { projectTitle: data.projectTitle } : {}),
        ...(data.gitRepoUrl !== undefined ? { gitRepoUrl: data.gitRepoUrl } : {}),
        ...(data.deployedUrl !== undefined ? { deployedUrl: data.deployedUrl } : {}),
      },
      include: {
        leader: { select: { id: true, fullName: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          },
        },
      },
    });

    return this.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.team.delete({ where: { id } });
  }
}
