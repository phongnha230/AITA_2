import api from '@/lib/api';
import type {
  Team,
  CreateTeamPayload,
  UpdateTeamPayload,
  AddTeamMemberPayload,
  TeamAssignmentOption,
  TeamSubmissionResult,
} from '../types/team.types';

export const teamService = {
  /**
   * Lấy danh sách đội nhóm trong một khóa học
   */
  async getCourseTeams(courseId: string): Promise<Team[]> {
    try {
      const response = await api.get(`/teams/courses/${encodeURIComponent(courseId)}`);
      return response.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Lấy thông tin chi tiết một đội nhóm
   */
  async getTeamDetails(id: string): Promise<Team | null> {
    const response = await api.get(`/teams/${encodeURIComponent(id)}`);
    return response.data?.data || null;
  },

  /**
   * Tạo đội nhóm mới trong môn học
   */
  async createTeam(payload: CreateTeamPayload): Promise<Team> {
    const response = await api.post('/teams', payload);
    return response.data?.data;
  },

  /**
   * Cập nhật thông tin nhóm (Tên, Đề tài, Git, Link Demo)
   */
  async updateTeam(id: string, payload: UpdateTeamPayload): Promise<Team> {
    const response = await api.patch(`/teams/${encodeURIComponent(id)}`, payload);
    return response.data?.data;
  },

  /**
   * Thêm thành viên vào nhóm qua Email sinh viên
   */
  async addMember(teamId: string, payload: AddTeamMemberPayload): Promise<Team> {
    const response = await api.post(`/teams/${encodeURIComponent(teamId)}/members`, payload);
    return response.data?.data;
  },

  /**
   * Xóa thành viên khỏi nhóm
   */
  async removeMember(teamId: string, userId: string): Promise<void> {
    await api.delete(`/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(userId)}`);
  },

  async updateMyGitIdentity(
    teamId: string,
    payload: { gitAuthorEmail: string | null; githubUsername: string | null }
  ): Promise<Team> {
    const response = await api.patch(`/teams/${encodeURIComponent(teamId)}/members/me/git-identity`, payload);
    return response.data?.data;
  },

  async getGroupAssignments(courseId: string): Promise<TeamAssignmentOption[]> {
    const response = await api.get(`/assignments/course/${encodeURIComponent(courseId)}`);
    const assignments = Array.isArray(response.data?.data) ? response.data.data : [];
    return assignments.filter((assignment: TeamAssignmentOption) =>
      assignment.environment === 'REACT_JS'
      && assignment.submissionType === 'GROUP'
      && assignment.status === 'PUBLISHED'
    );
  },

  async submitForAssignment(
    assignmentId: string,
    payload: { teamId: string; gitCommitHash?: string }
  ): Promise<TeamSubmissionResult> {
    const response = await api.post(
      `/assignments/${encodeURIComponent(assignmentId)}/team-submissions`,
      payload
    );
    return response.data?.data;
  },
};
