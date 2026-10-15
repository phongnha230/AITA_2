'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { teamService } from '../services/team.service';
import type { Team, TeamAssignmentOption } from '../types/team.types';

interface TeamSubmissionModalProps {
  team: Team | null;
  onClose: () => void;
  onSubmitted: (message: string) => void;
}

export function TeamSubmissionModal({ team, onClose, onSubmitted }: TeamSubmissionModalProps) {
  const [assignments, setAssignments] = useState<TeamAssignmentOption[]>([]);
  const [assignmentId, setAssignmentId] = useState('');
  const [gitCommitHash, setGitCommitHash] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!team) return;
    let active = true;
    teamService.getGroupAssignments(team.courseId)
      .then((items) => {
        if (!active) return;
        setAssignments(items);
        setAssignmentId(items[0]?.id ?? '');
      })
      .catch((requestError) => active && setError(requestError instanceof Error ? requestError.message : 'Không thể tải assignment.'));
    return () => { active = false; };
  }, [team]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!team || !assignmentId) return;
    try {
      setSubmitting(true);
      setError(null);
      const result = await teamService.submitForAssignment(assignmentId, {
        teamId: team.id,
        gitCommitHash: gitCommitHash.trim() || undefined,
      });
      onSubmitted(`Đã nộp attempt #${result.attemptNo}; bài đang ở trạng thái ${result.status}.`);
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Nộp bài nhóm thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(team)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Nộp cho assignment — {team?.name}</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <p><strong>GitHub snapshot:</strong> {team?.gitRepoUrl || 'Chưa cập nhật'}</p>
            <p><strong>Deploy snapshot:</strong> {team?.deployedUrl || 'Chưa cập nhật'}</p>
          </div>
          <select value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" required>
            <option value="">Chọn assignment nhóm FER201</option>
            {assignments.map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.title}</option>)}
          </select>
          <Input value={gitCommitHash} onChange={(event) => setGitCommitHash(event.target.value)} placeholder="Commit SHA tùy chọn (để trống lấy HEAD)" pattern="[a-fA-F0-9]{7,40}" />
          <p className="text-xs text-slate-500">Chỉ Leader được nộp. Mỗi lần xác nhận tạo một snapshot bất biến và một attempt mới.</p>
          {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Hủy</Button><Button disabled={submitting || !assignmentId || !team?.gitRepoUrl || !team?.deployedUrl}>{submitting ? 'Đang nộp…' : 'Xác nhận nộp'}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
