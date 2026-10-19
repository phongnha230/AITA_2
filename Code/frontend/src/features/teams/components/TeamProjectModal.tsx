'use client';

import { type FormEvent, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { teamService } from '../services/team.service';
import type { Team } from '../types/team.types';

interface TeamProjectModalProps {
  team: Team | null;
  onClose: () => void;
  onSuccess: (team: Team) => void;
}

export function TeamProjectModal({ team, onClose, onSuccess }: TeamProjectModalProps) {
  return (
    <Dialog open={Boolean(team)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {team ? <TeamProjectForm key={team.id} team={team} onClose={onClose} onSuccess={onSuccess} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function TeamProjectForm({ team, onClose, onSuccess }: Omit<TeamProjectModalProps, 'team'> & { team: Team }) {
  const [projectTitle, setProjectTitle] = useState(() => team.projectTitle ?? '');
  const [gitRepoUrl, setGitRepoUrl] = useState(() => team.gitRepoUrl ?? '');
  const [deployedUrl, setDeployedUrl] = useState(() => team.deployedUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const updated = await teamService.updateTeam(team.id, {
        projectTitle: projectTitle.trim(),
        gitRepoUrl: gitRepoUrl.trim(),
        deployedUrl: deployedUrl.trim(),
      });
      onSuccess(updated);
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể cập nhật dự án.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogHeader><DialogTitle>Cập nhật dự án — {team.name}</DialogTitle></DialogHeader>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} placeholder="Tên đề tài" />
        <Input type="url" value={gitRepoUrl} onChange={(event) => setGitRepoUrl(event.target.value)} placeholder="https://github.com/org/repo" required />
        <Input type="url" value={deployedUrl} onChange={(event) => setDeployedUrl(event.target.value)} placeholder="https://project.vercel.app" required />
        <p className="text-xs text-slate-500">Lưu link không tự tạo bài nộp. Dùng nút “Nộp cho assignment” sau khi kiểm tra xong.</p>
        {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Hủy</Button><Button disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu dự án'}</Button></div>
      </form>
    </>
  );
}
