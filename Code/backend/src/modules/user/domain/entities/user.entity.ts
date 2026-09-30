export type Role = 'ADMIN' | 'LECTURER' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_ACTIVATION';

export interface UserProps {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: Role;
  status: UserStatus;
  googleId?: string | null;
  passwordHash?: string | null;
  refreshTokenHash?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(private readonly props: UserProps) {}

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get avatarUrl(): string | null | undefined {
    return this.props.avatarUrl;
  }

  get role(): Role {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get googleId(): string | null | undefined {
    return this.props.googleId;
  }

  get passwordHash(): string | null | undefined {
    return this.props.passwordHash;
  }

  get refreshTokenHash(): string | null | undefined {
    return this.props.refreshTokenHash;
  }

  get lastLoginAt(): Date | null | undefined {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public isActive(): boolean {
    return this.props.status === 'ACTIVE';
  }

  public isSuspended(): boolean {
    return this.props.status === 'SUSPENDED';
  }

  public isAdmin(): boolean {
    return this.props.role === 'ADMIN';
  }

  public isLecturer(): boolean {
    return this.props.role === 'LECTURER';
  }

  public isStudent(): boolean {
    return this.props.role === 'STUDENT';
  }

  public toJSON() {
    return {
      id: this.props.id,
      email: this.props.email,
      fullName: this.props.fullName,
      avatarUrl: this.props.avatarUrl,
      role: this.props.role,
      status: this.props.status,
      lastLoginAt: this.props.lastLoginAt,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
