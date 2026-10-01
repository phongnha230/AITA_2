export interface TeamMemberProps {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  joinedAt: Date;
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export interface TeamProps {
  id: string;
  courseId: string;
  name: string;
  leaderId: string;
  projectTitle?: string | null;
  gitRepoUrl?: string | null;
  deployedUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  leader?: {
    id: string;
    fullName: string;
    email: string;
  };
  members?: TeamMemberProps[];
}

export class Team {
  constructor(private readonly props: TeamProps) {}

  get id(): string {
    return this.props.id;
  }

  get courseId(): string {
    return this.props.courseId;
  }

  get name(): string {
    return this.props.name;
  }

  get leaderId(): string {
    return this.props.leaderId;
  }

  get projectTitle(): string | null | undefined {
    return this.props.projectTitle;
  }

  get gitRepoUrl(): string | null | undefined {
    return this.props.gitRepoUrl;
  }

  get deployedUrl(): string | null | undefined {
    return this.props.deployedUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get leader(): { id: string; fullName: string; email: string } | undefined {
    return this.props.leader;
  }

  get members(): TeamMemberProps[] | undefined {
    return this.props.members;
  }

  public toJSON() {
    return {
      id: this.props.id,
      courseId: this.props.courseId,
      name: this.props.name,
      leaderId: this.props.leaderId,
      projectTitle: this.props.projectTitle,
      gitRepoUrl: this.props.gitRepoUrl,
      deployedUrl: this.props.deployedUrl,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      leader: this.props.leader,
      members: this.props.members,
    };
  }
}
