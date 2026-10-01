import { PrismaClient, User as PrismaUserModel } from '@prisma/client';
import { IUserRepository, FindUsersFilter } from '../../domain/repositories/user.repository.interface.js';
import { User, Role, UserStatus } from '../../domain/entities/user.entity.js';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: PrismaUserModel): User {
    return new User({
      id: raw.id,
      email: raw.email,
      fullName: raw.fullName,
      avatarUrl: raw.avatarUrl,
      role: raw.role as Role,
      status: raw.status as UserStatus,
      googleId: raw.googleId,
      passwordHash: raw.passwordHash,
      refreshTokenHash: raw.refreshTokenHash,
      lastLoginAt: raw.lastLoginAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    return raw ? this.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? this.toDomain(raw) : null;
  }

  async findByUsernameOrEmail(identifier: string): Promise<User | null> {
    const raw = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { email: `${identifier.toLowerCase()}@fpt.edu.vn` },
        ],
      },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { googleId } });
    return raw ? this.toDomain(raw) : null;
  }

  async create(user: {
    email: string;
    fullName: string;
    passwordHash?: string | null;
    role?: Role;
    status?: UserStatus;
    avatarUrl?: string | null;
    googleId?: string | null;
  }): Promise<User> {
    const raw = await this.prisma.user.create({
      data: {
        email: user.email,
        fullName: user.fullName,
        passwordHash: user.passwordHash ?? null,
        role: user.role ?? 'STUDENT',
        status: user.status ?? 'ACTIVE',
        avatarUrl: user.avatarUrl ?? null,
        googleId: user.googleId ?? null,
      },
    });
    return this.toDomain(raw);
  }

  async update(
    id: string,
    data: Partial<{
      fullName: string;
      avatarUrl: string | null;
      status: UserStatus;
      role: Role;
      passwordHash: string;
      refreshTokenHash: string | null;
    }>
  ): Promise<User> {
    const raw = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.toDomain(raw);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async findAll(filter?: FindUsersFilter): Promise<{ users: User[]; total: number }> {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const limit = filter?.limit && filter.limit > 0 ? filter.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filter?.role) where.role = filter.role;
    if (filter?.status) where.status = filter.status;
    if (filter?.search) {
      where.OR = [
        { email: { contains: filter.search } },
        { fullName: { contains: filter.search } },
      ];
    }

    const [rawUsers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: rawUsers.map((u) => this.toDomain(u)),
      total,
    };
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }
}
