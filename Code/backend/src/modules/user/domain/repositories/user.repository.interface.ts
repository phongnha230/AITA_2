import { User, Role, UserStatus } from '../entities/user.entity.js';

export interface FindUsersFilter {
  role?: Role;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsernameOrEmail(identifier: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  create(user: {
    email: string;
    fullName: string;
    passwordHash?: string | null;
    role?: Role;
    status?: UserStatus;
    avatarUrl?: string | null;
    googleId?: string | null;
  }): Promise<User>;
  update(id: string, data: Partial<{
    fullName: string;
    avatarUrl: string | null;
    status: UserStatus;
    role: Role;
    passwordHash: string;
    refreshTokenHash: string | null;
  }>): Promise<User>;
  updateLastLogin(id: string): Promise<void>;
  findAll(filter?: FindUsersFilter): Promise<{ users: User[]; total: number }>;
  count(): Promise<number>;
}
