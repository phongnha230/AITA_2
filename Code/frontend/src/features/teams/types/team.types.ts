export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'LEADER' | 'MEMBER' | string;
  joinedAt: string;
  gitAuthorEmail?: string | null;
  githubUsername?: string | null;
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

export interface TeamAssignmentOption {
  id: string;
  title: string;
  environment: string;
  submissionType: 'INDIVIDUAL' | 'GROUP';
  status: string;
  deadline: string;
}

export interface TeamSubmissionResult {
  id: string;
  attemptNo: number;
  status: string;
  gitCommitHash?: string | null;
  deployedUrl?: string | null;
}
