'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ExternalLink,
  FolderGit2,
  Globe,
  Loader2,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users2,
} from 'lucide-react';
import { teamService } from '../services/team.service';
import type { Team } from '../types/team.types';
import { CreateTeamModal } from './CreateTeamModal';
import { AddTeamMemberModal } from './AddTeamMemberModal';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CourseTeamsTabProps {
  courseId: string;
  courseName: string;
  onShowToast: (msg: string) => void;
}

export const CourseTeamsTab: React.FC<CourseTeamsTabProps> = ({
  courseId,
  courseName,
  onShowToast,
}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeamForAdd, setSelectedTeamForAdd] = useState<Team | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teamService.getCourseTeams(courseId);
      setTeams(data);
    } catch {
      onShowToast('Không thể tải danh sách nhóm.');
    } finally {
      setLoading(false);
    }
  }, [courseId, onShowToast]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleTeamCreated = (newTeam: Team) => {
    setTeams((prev) => [newTeam, ...prev]);
    onShowToast(`Đã tạo nhóm "${newTeam.name}" thành công!`);
  };

  const handleMemberAdded = (updatedTeam: Team) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t))
    );
    onShowToast(`Đã thêm thành viên vào nhóm "${updatedTeam.name}" thành công!`);
  };

  const handleRemoveMember = async (teamId: string, userId: string, memberName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${memberName}" khỏi nhóm này?`)) {
      return;
    }

    try {
      await teamService.removeMember(teamId, userId);
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id === teamId) {
            return {
              ...t,
              members: t.members?.filter((m) => m.userId !== userId),
            };
          }
          return t;
        })
      );
      onShowToast(`Đã xóa thành viên "${memberName}" khỏi nhóm.`);
    } catch {
      onShowToast('Xóa thành viên thất bại. Vui lòng thử lại.');
    }
  };

  const totalMembers = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);

  return (
    <div className="space-y-5">
      {/* Action and Summary Bar */}
      <Card className="bg-white p-5 rounded-2xl border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Đội nhóm học tập &amp; Bài tập lớn
            </h2>
            <Badge variant="outline" className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border-indigo-200">
              {teams.length} nhóm • {totalMembers} thành viên
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý phân nhóm sinh viên, liên kết repository GitHub và website đồ án của môn học
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTeams}
            disabled={loading}
            className="h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo nhóm mới</span>
          </Button>
        </div>
      </Card>

      {/* Loading state */}
      {loading && teams.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-semibold text-slate-700">Đang tải danh sách nhóm...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && teams.length === 0 && (
        <Card className="bg-white p-12 rounded-2xl border-dashed border-2 border-slate-200 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Users2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Chưa có đội nhóm nào</h3>
          <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
            Môn học này hiện chưa có nhóm đồ án nào được tạo. Bạn có thể khởi tạo nhóm đầu tiên để sinh viên tham gia.
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo nhóm đầu tiên</span>
          </Button>
        </Card>
      )}

      {/* Teams Grid */}
      {teams.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {teams.map((team) => {
            const memberCount = team.members?.length || 0;
            return (
              <Card
                key={team.id}
                className="bg-white rounded-2xl border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                {/* Team Card Header */}
                <div className="p-5 border-b border-slate-100 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{team.name}</h3>
                        <Badge
                          variant="outline"
                          className="font-mono text-[11px] font-bold bg-slate-50 text-slate-700 border-slate-200"
                        >
                          {memberCount} thành viên
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-indigo-600 mt-1">
                        {team.projectTitle || 'Chưa cập nhật đề tài đồ án'}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedTeamForAdd(team)}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 inline-flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Thêm SV</span>
                    </Button>
                  </div>

                  {/* Team External Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {team.gitRepoUrl ? (
                      <a
                        href={team.gitRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition"
                      >
                        <FolderGit2 className="w-3 h-3 text-slate-600" />
                        <span>Git Repository</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Chưa gắn Git</span>
                    )}

                    {team.deployedUrl && (
                      <a
                        href={team.deployedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-mono text-[11px] transition"
                      >
                        <Globe className="w-3 h-3 text-emerald-600" />
                        <span>Web Demo</span>
                        <ExternalLink className="w-2.5 h-2.5 text-emerald-400" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Team Members List */}
                <div className="p-5 flex-1 space-y-2.5 bg-slate-50/40">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Thành viên nhóm ({memberCount})
                  </p>

                  {memberCount === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      Chưa có thành viên nào. Bấm &quot;Thêm SV&quot; để mời thành viên.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {team.members?.map((member) => {
                        const isLeader = member.role === 'LEADER' || member.userId === team.leaderId;
                        const memberName = member.user?.fullName || 'Sinh viên';
                        const initials = memberName
                          .trim()
                          .split(' ')
                          .filter(Boolean)
                          .slice(-2)
                          .map((w) => w[0]?.toUpperCase())
                          .join('') || 'SV';

                        return (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Avatar className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-[10px] shrink-0">
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 rounded-lg text-[10px]">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                                  <span>{memberName}</span>
                                  {isLeader && (
                                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                      Leader
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono truncate">
                                  {member.user?.email || 'N/A'}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveMember(team.id, member.userId, memberName)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                              title="Xóa thành viên khỏi nhóm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Tạo Nhóm */}
      <CreateTeamModal
        courseId={courseId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTeamCreated}
      />

      {/* Modal Thêm Thành Viên */}
      {selectedTeamForAdd && (
        <AddTeamMemberModal
          teamId={selectedTeamForAdd.id}
          teamName={selectedTeamForAdd.name}
          isOpen={Boolean(selectedTeamForAdd)}
          onClose={() => setSelectedTeamForAdd(null)}
          onSuccess={handleMemberAdded}
        />
      )}
    </div>
  );
};
