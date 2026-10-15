export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'LEADER' | 'MEMBER' | string;
  joinedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export interface Team {
  id: string;
  courseId: string;
  name: string;
  leaderId: string;
  projectTitle?: string | null;
  gitRepoUrl?: string | null;
  deployedUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  leader?: {
    id: string;
    fullName: string;
    email: string;
  };
  members?: TeamMember[];
}

export interface CreateTeamPayload {
  courseId: string;
  name: string;
  projectTitle?: string;
  gitRepoUrl?: string;
  deployedUrl?: string;
}

export interface UpdateTeamPayload {
  name?: string;
  projectTitle?: string;
  gitRepoUrl?: string;
  deployedUrl?: string;
}

export interface AddTeamMemberPayload {
  studentEmail: string;
  role?: 'LEADER' | 'MEMBER';
}
