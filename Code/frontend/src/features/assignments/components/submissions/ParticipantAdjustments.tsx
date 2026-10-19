import { Button } from '@/components/ui/button';
import type { LecturerSubmission } from '../../types/assignment.types';

interface ParticipantAdjustmentsProps {
  participants: NonNullable<LecturerSubmission['participants']>;
  scoreDrafts: Record<string, string>;
  reasonDrafts: Record<string, string>;
  error: string | null;
  onScoreChange: (userId: string, value: string) => void;
  onReasonChange: (userId: string, value: string) => void;
  onSave: (userId: string) => void;
}

export function ParticipantAdjustments({ participants, scoreDrafts, reasonDrafts, error, onScoreChange, onReasonChange, onSave }: ParticipantAdjustmentsProps) {
  if (!participants.length) return null;
  return <section aria-label="Điều chỉnh điểm cá nhân" className="space-y-2">
    <h3 className="text-xs font-bold text-slate-800">Điều chỉnh điểm cá nhân</h3>
    <ul className="space-y-2">{participants.map((participant) => {
      const name = participant.user?.fullName ?? participant.userId;
      return <li key={participant.userId} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-[1fr_100px_1.5fr_auto] md:items-center">
        <span className="text-xs font-semibold text-slate-900">{name}<br /><small className="text-slate-600">Điểm hiệu lực: {participant.effectiveScore ?? '-'}</small></span>
        <label className="sr-only" htmlFor={`score-${participant.userId}`}>Điểm điều chỉnh của {name}</label>
        <input id={`score-${participant.userId}`} type="number" min="0" max="10" step="0.1" value={scoreDrafts[participant.userId] ?? ''} onChange={(event) => onScoreChange(participant.userId, event.target.value)} placeholder="0–10" className="min-h-10 rounded-lg border border-slate-300 px-2 text-base text-slate-900" />
        <label className="sr-only" htmlFor={`reason-${participant.userId}`}>Lý do điều chỉnh điểm của {name}</label>
        <input id={`reason-${participant.userId}`} value={reasonDrafts[participant.userId] ?? ''} onChange={(event) => onReasonChange(participant.userId, event.target.value)} placeholder="Lý do bắt buộc (ít nhất 5 ký tự)" className="min-h-10 rounded-lg border border-slate-300 px-2 text-base text-slate-900" />
        <Button type="button" size="sm" onClick={() => onSave(participant.userId)}>Lưu</Button>
      </li>;
    })}</ul>
    {error && <p role="alert" className="text-xs text-rose-800">{error}</p>}
  </section>;
}
