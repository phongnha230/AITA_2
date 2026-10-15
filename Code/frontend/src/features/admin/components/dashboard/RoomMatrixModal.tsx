import { cn } from '../../../../lib/cn';
import { Modal } from '../ui/Modal';

type RoomState = 'active' | 'waiting' | 'idle';

const ROOMS: { room: string; state: RoomState; seats: string }[] = Array.from({ length: 12 }, (_, i) => {
  const n = 301 + i;
  const state: RoomState = n === 302 || n === 304 ? 'active' : n === 305 ? 'waiting' : 'idle';
  const seats = n === 302 ? '38/40' : n === 304 ? '40/40' : n === 305 ? '35/36' : '0/40';
  return { room: `LAB ${n}`, state, seats };
});

const STYLE: Record<RoomState, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  waiting: 'border-amber-200 bg-amber-50 text-amber-700',
  idle: 'border-slate-200 bg-slate-50 text-slate-500',
};
const LABEL: Record<RoomState, string> = { active: 'Đang thi', waiting: 'Chờ phát đề', idle: 'Trống' };

export const RoomMatrixModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
  <Modal open={open} title="Ma trận 12 phòng máy thi" onClose={onClose}>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ROOMS.map((r) => (
        <div key={r.room} className={cn('rounded-xl border p-3', STYLE[r.state])}>
          <p className="text-sm font-bold">{r.room}</p>
          <p className="text-[11px] font-semibold">{LABEL[r.state]}</p>
          <p className="mt-1 font-mono text-[11px]">{r.seats} máy</p>
        </div>
      ))}
    </div>
  </Modal>
);
