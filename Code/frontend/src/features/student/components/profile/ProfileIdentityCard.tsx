import { CheckCircle2, Hash, KeyRound, Mail, PencilLine, ShieldCheck, User } from 'lucide-react';
import type { StudentProfile } from '../../types/student.types';
import { StudentAvatar } from '../shared/StudentAvatar';

interface ProfileIdentityCardProps {
  profile: StudentProfile;
  onEdit: () => void;
  onChangePassword?: () => void;
}

const roleLabels: Record<StudentProfile['role'], string> = {
  ADMIN: 'Quản trị viên',
  LECTURER: 'Giảng viên',
  STUDENT: 'Sinh viên',
};

const statusLabels: Record<StudentProfile['status'], string> = {
  ACTIVE: 'Đang hoạt động',
  SUSPENDED: 'Tạm khóa',
  PENDING_ACTIVATION: 'Chờ kích hoạt',
};

export function ProfileIdentityCard({
  profile,
  onEdit,
  onChangePassword,
}: ProfileIdentityCardProps) {
  return (
    <section
      aria-label="Thông tin hồ sơ sinh viên"
      className="relative overflow-hidden rounded-2xl border border-blue-100/80 bg-gradient-to-r from-white via-white to-blue-50/40 p-6 shadow-elevated sm:p-7"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Avatar + Details */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <StudentAvatar
              fullName={profile.fullName}
              avatarUrl={profile.avatarUrl}
              size="profile"
            />
            <span
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white shadow-xs"
              title="Tài khoản đã xác thực"
            >
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                {profile.fullName || 'Tài khoản sinh viên'}
              </h2>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-2xs">
                {roleLabels[profile.role]}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 sm:text-sm">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-500">
                <Hash className="h-3.5 w-3.5 text-slate-400" />
                Mã ID: {profile.id}
              </span>
              <span className="hidden text-slate-300 sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {profile.email}
              </span>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Trạng thái: <span className="font-semibold">{statusLabels[profile.status]}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-2xs">
                <User className="h-3.5 w-3.5 text-blue-600" />
                Vai trò: <span className="font-semibold">{roleLabels[profile.role]}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap shrink-0 items-center gap-3">
          {onChangePassword && (
            <button
              type="button"
              onClick={onChangePassword}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <KeyRound className="h-4 w-4 text-indigo-600" />
              <span>Đổi mật khẩu</span>
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            <PencilLine className="h-4 w-4" />
            <span>Chỉnh sửa hồ sơ</span>
          </button>
        </div>
      </div>
    </section>
  );
}


