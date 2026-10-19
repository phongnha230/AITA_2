'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, RefreshCw, Users2 } from 'lucide-react';
import { teamService } from '../services/team.service';
import type { Team } from '../types/team.types';
import { CreateTeamModal } from './CreateTeamModal';
import { AddTeamMemberModal } from './AddTeamMemberModal';
import { TeamProjectModal } from './TeamProjectModal';
import { TeamSubmissionModal } from './TeamSubmissionModal';
import { TeamCard } from './TeamCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CourseTeamsTabProps {
  courseId: string;
  courseName: string;
  onShowToast: (msg: string) => void;
}

export const CourseTeamsTab: React.FC<CourseTeamsTabProps> = ({ courseId, onShowToast }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeamForAdd, setSelectedTeamForAdd] = useState<Team | null>(null);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState<Team | null>(null);
  const [selectedTeamForSubmit, setSelectedTeamForSubmit] = useState<Team | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teamService.getCourseTeams(courseId);
      setTeams(data);
    } catch (error: unknown) {
      console.error('Không tải được danh sách nhóm:', error);
      onShowToast('Không thể tải danh sách nhóm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [courseId, onShowToast]);

  useEffect(() => { void fetchTeams(); }, [fetchTeams]);

  const handleTeamCreated = (newTeam: Team) => {
    setTeams((previous) => [newTeam, ...previous]);
    onShowToast(`Đã tạo nhóm “${newTeam.name}” thành công!`);
  };

  const handleMemberAdded = (updatedTeam: Team) => {
    setTeams((previous) => previous.map((team) => team.id === updatedTeam.id ? updatedTeam : team));
    onShowToast(`Đã thêm thành viên vào nhóm “${updatedTeam.name}” thành công!`);
  };

  const handleTeamUpdated = (updatedTeam: Team) => {
    setTeams((previous) => previous.map((team) => team.id === updatedTeam.id ? updatedTeam : team));
    onShowToast(`Đã cập nhật dự án của “${updatedTeam.name}”.`);
  };

  const handleRemoveMember = async (teamId: string, userId: string, memberName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa “${memberName}” khỏi nhóm này?`)) return;
    try {
      await teamService.removeMember(teamId, userId);
      setTeams((previous) => previous.map((team) => team.id === teamId
        ? { ...team, members: team.members?.filter((member) => member.userId !== userId) }
        : team));
      onShowToast(`Đã xóa thành viên “${memberName}” khỏi nhóm.`);
    } catch (error: unknown) {
      console.error(`Không xóa được thành viên ${userId} khỏi nhóm ${teamId}:`, error);
      onShowToast('Xóa thành viên thất bại. Vui lòng thử lại.');
    }
  };

  const totalMembers = teams.reduce((sum, team) => sum + (team.members?.length ?? 0), 0);

  return (
    <div className="space-y-5">
      <Card className="flex flex-col justify-between gap-4 rounded-2xl border-slate-200/90 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">Đội nhóm học tập &amp; Bài tập lớn</h2>
            <Badge variant="outline" className="font-mono text-xs font-bold text-indigo-800">{teams.length} nhóm · {totalMembers} thành viên</Badge>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">Quản lý phân nhóm sinh viên, liên kết repository GitHub và website đồ án của môn học</p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => void fetchTeams()} disabled={loading} className="h-9 px-3 text-xs font-semibold" title="Làm mới danh sách">
            <RefreshCw aria-hidden="true" className={`mr-1.5 size-3.5 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Làm mới</span>
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="h-9 px-4 text-xs font-bold">
            <Plus aria-hidden="true" className="mr-2 size-4" />Tạo nhóm mới
          </Button>
        </div>
      </Card>

      {loading && teams.length === 0 && <div role="status" className="flex flex-col items-center justify-center py-16 text-center"><Loader2 aria-hidden="true" className="mb-3 size-8 animate-spin text-indigo-700" /><p className="text-sm font-semibold text-slate-700">Đang tải danh sách nhóm...</p></div>}

      {!loading && teams.length === 0 && (
        <Card className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
          <Users2 aria-hidden="true" className="mb-4 size-8 text-indigo-700" />
          <h3 className="text-base font-bold text-slate-900">Chưa có đội nhóm nào</h3>
          <p className="mb-6 mt-1 max-w-md text-xs leading-5 text-slate-600">Môn học này hiện chưa có nhóm đồ án nào được tạo. Bạn có thể khởi tạo nhóm đầu tiên để sinh viên tham gia.</p>
          <Button onClick={() => setIsCreateModalOpen(true)} className="h-10 px-5 text-xs font-bold"><Plus aria-hidden="true" className="mr-2 size-4" />Tạo nhóm đầu tiên</Button>
        </Card>
      )}

      {teams.length > 0 && <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">{teams.map((team) => <TeamCard key={team.id} team={team} onAddMember={setSelectedTeamForAdd} onEditProject={setSelectedTeamForEdit} onSubmit={setSelectedTeamForSubmit} onRemoveMember={handleRemoveMember} />)}</div>}

      <CreateTeamModal courseId={courseId} isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleTeamCreated} />
      {selectedTeamForAdd && <AddTeamMemberModal teamId={selectedTeamForAdd.id} teamName={selectedTeamForAdd.name} isOpen onClose={() => setSelectedTeamForAdd(null)} onSuccess={handleMemberAdded} />}
      <TeamProjectModal team={selectedTeamForEdit} onClose={() => setSelectedTeamForEdit(null)} onSuccess={handleTeamUpdated} />
      <TeamSubmissionModal team={selectedTeamForSubmit} onClose={() => setSelectedTeamForSubmit(null)} onSubmitted={onShowToast} />
    </div>
  );
};
