import { GraduationCap, LibraryBig, RefreshCcwDot, ShieldCheck, Users } from 'lucide-react';
import type { UserStats } from '../../types/admin.types';
import { Card } from '../ui/Card';

const fmt = (n?: number) => (n === undefined ? '—' : n.toLocaleString('en-US'));

interface TileProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
  note?: string;
}

const Tile: React.FC<TileProps> = ({ label, value, icon, iconBg, note }) => (
  <Card interactive className="flex items-center gap-4 p-5">
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>{icon}</span>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {note && <span className="text-xs font-semibold text-emerald-600">{note}</span>}
      </p>
    </div>
  </Card>
);

export const UsersKpiRow: React.FC<{ stats: UserStats | null }> = ({ stats }) => (
  <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
    <Tile label="Tổng tài khoản" value={fmt(stats?.total)} note={stats?.newThisWeek ? `+${stats.newThisWeek} mới` : undefined} iconBg="bg-blue-50 text-blue-600" icon={<Users className="h-5 w-5" />} />
    <Tile label="Giảng viên" value={fmt(stats?.lecturers)} iconBg="bg-blue-50 text-blue-600" icon={<GraduationCap className="h-5 w-5" />} />
    <Tile label="Sinh viên" value={fmt(stats?.students)} iconBg="bg-emerald-50 text-emerald-600" icon={<LibraryBig className="h-5 w-5" />} />
    <Tile label="Quản trị viên" value={fmt(stats?.admins)} iconBg="bg-rose-50 text-rose-600" icon={<ShieldCheck className="h-5 w-5" />} />
    <Card className="flex items-center gap-4 border-blue-100 bg-blue-50/60 p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600"><RefreshCcwDot className="h-5 w-5" /></span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Phiên Active FAP</p>
        <p className="text-lg font-bold leading-tight text-blue-700">100%<br />Khớp</p>
      </div>
    </Card>
  </section>
);
