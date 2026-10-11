'use client';

import { useState } from 'react';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { LIVE_SESSIONS, type LiveSession } from '../../mocks/ops.mock';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { ProgressBar } from '../ui/ProgressBar';
import { useToast } from '../ui/Toast';
import { RoomMatrixModal } from './RoomMatrixModal';

const WAITING = 'Chờ phát đề thi';

export const LiveSessions: React.FC = () => {
  const toast = useToast();
  const [sessions, setSessions] = useState<LiveSession[]>(LIVE_SESSIONS);
  const [detail, setDetail] = useState<LiveSession | null>(null);
  const [matrixOpen, setMatrixOpen] = useState(false);

  const activate = (s: LiveSession) => {
    setSessions((list) =>
      list.map((x) => (x.code === s.code ? { ...x, badge: 'Đang làm bài', badgeTone: 'student', progressValue: '0% nộp bài', percent: 4, barColor: 'bg-emerald-600' } : x)),
    );
    toast.success(`Đã kích hoạt phòng ${s.room} và phát đề ${s.code}.`);
  };

  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Ca thi PE đang diễn ra</h2>
          <p className="text-xs text-slate-500">Giám sát luồng thi trực tiếp tại các phòng LAB</p>
        </div>
        <Badge tone="student" dot>{sessions.length} ACTIVE</Badge>
      </div>
      <ul className="space-y-3">
        {sessions.map((s) => {
          const waiting = s.progressValue === WAITING;
          return (
            <li key={s.code} className="space-y-2 rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                    {s.code}
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">{s.subject}</span>
                  </p>
                  <p className="text-xs text-slate-500">Phòng: <strong>{s.room}</strong> • CBCT: {s.proctor}</p>
                </div>
                <Badge tone={s.badgeTone}>{s.badge}</Badge>
              </div>
              <p className="flex justify-between gap-2 text-[11px] font-semibold"><span className="text-slate-600">{s.progressLabel}</span><span className="text-blue-600">{s.progressValue}</span></p>
              <ProgressBar value={s.percent} color={s.barColor} className="h-2 bg-slate-200" />
              <p className="flex justify-end text-xs font-semibold text-blue-600">
                <button type="button" onClick={() => (waiting ? activate(s) : setDetail(s))} className="inline-flex items-center gap-1 hover:underline">
                  {waiting ? `Kích hoạt phòng ${s.room}` : `Chi tiết phòng ${s.room}`} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </p>
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={() => setMatrixOpen(true)} className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-slate-200">
        <LayoutGrid className="h-4 w-4" /> Xem ma trận tất cả 12 phòng máy thi
      </button>

      <Modal open={Boolean(detail)} title={detail ? `Chi tiết phòng ${detail.room}` : ''} onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-xs">
              <div><dt className="text-slate-500">Ca thi</dt><dd className="font-bold text-slate-900">{detail.code}</dd></div>
              <div><dt className="text-slate-500">Môn</dt><dd className="font-bold text-slate-900">{detail.subject}</dd></div>
              <div><dt className="text-slate-500">Cán bộ coi thi</dt><dd className="font-bold text-slate-900">{detail.proctor}</dd></div>
              <div><dt className="text-slate-500">Trạng thái</dt><dd className="font-bold text-slate-900">{detail.badge}</dd></div>
            </dl>
            <p className="text-slate-600">{detail.progressLabel} — <strong>{detail.progressValue}</strong></p>
            <ProgressBar value={detail.percent} color={detail.barColor} className="h-2" />
            <div className="flex justify-end"><Button onClick={() => setDetail(null)}>Đóng</Button></div>
          </div>
        )}
      </Modal>
      <RoomMatrixModal open={matrixOpen} onClose={() => setMatrixOpen(false)} />
    </Card>
  );
};
