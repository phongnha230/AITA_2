'use client';

import { ExternalLink, FolderGit2, Globe, Pencil, Send, Trash2, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Team } from '../types/team.types';

interface TeamCardProps {
  team: Team;
  onAddMember: (team: Team) => void;
  onEditProject: (team: Team) => void;
  onSubmit: (team: Team) => void;
  onRemoveMember: (teamId: string, userId: string, memberName: string) => void;
}

export function TeamCard({ team, onAddMember, onEditProject, onSubmit, onRemoveMember }: TeamCardProps) {
  const members = team.members ?? [];

  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200/90 bg-white shadow-2xs">
      <header className="space-y-3 border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{team.name}</h3>
              <Badge variant="outline" className="font-mono text-xs font-bold text-slate-700">{members.length} thành viên</Badge>
            </div>
            <p className="mt-1 truncate text-xs font-semibold text-indigo-700">{team.projectTitle || 'Chưa cập nhật đề tài đồ án'}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onAddMember(team)} className="h-8 shrink-0 px-2.5 text-xs font-semibold text-indigo-700">
            <UserPlus aria-hidden="true" className="mr-1.5 size-3.5" />Thêm SV
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {team.gitRepoUrl ? <a href={team.gitRepoUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 text-slate-700 hover:bg-slate-200"><FolderGit2 aria-hidden="true" className="size-3" />Git Repository<ExternalLink aria-hidden="true" className="size-2.5" /></a> : <span className="py-2 text-slate-500">Chưa gắn Git</span>}
          {team.deployedUrl && <a href={team.deployedUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 text-emerald-800 hover:bg-emerald-100"><Globe aria-hidden="true" className="size-3" />Web Demo<ExternalLink aria-hidden="true" className="size-2.5" /></a>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => onEditProject(team)}><Pencil aria-hidden="true" className="mr-1.5 size-3.5" />Cập nhật dự án</Button>
          <Button type="button" size="sm" onClick={() => onSubmit(team)}><Send aria-hidden="true" className="mr-1.5 size-3.5" />Nộp cho assignment</Button>
        </div>
      </header>

      <section aria-label={`Thành viên nhóm ${team.name}`} className="space-y-2.5 bg-slate-50/40 p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Thành viên nhóm ({members.length})</h4>
        {members.length === 0 ? <p className="py-2 text-xs text-slate-600">Chưa có thành viên nào. Bấm “Thêm SV” để mời thành viên.</p> : (
          <ul className="space-y-2">
            {members.map((member) => {
              const memberName = member.user?.fullName || 'Sinh viên';
              const initials = memberName.trim().split(' ').filter(Boolean).slice(-2).map((word) => word[0]?.toUpperCase()).join('') || 'SV';
              const isLeader = member.role === 'LEADER' || member.userId === team.leaderId;
              return (
                <li key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar className="size-8 shrink-0 rounded-lg bg-indigo-100 text-xs font-bold text-indigo-800"><AvatarFallback className="rounded-lg bg-indigo-100 text-xs text-indigo-800">{initials}</AvatarFallback></Avatar>
                    <div className="min-w-0"><p className="flex items-center gap-1.5 truncate text-xs font-bold text-slate-900">{memberName}{isLeader && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-extrabold uppercase text-amber-900">Leader</span>}</p><p className="truncate font-mono text-xs text-slate-600">{member.user?.email || 'N/A'}</p></div>
                  </div>
                  <button type="button" aria-label={`Xóa ${memberName} khỏi nhóm`} onClick={() => onRemoveMember(team.id, member.userId, memberName)} className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"><Trash2 aria-hidden="true" className="size-4" /></button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Card>
  );
}
