import { BadgeCheck, LockKeyhole, ShieldCheck, Terminal } from 'lucide-react';

export default function LoginContextPanel() {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 p-6 shadow-sm sm:p-8 lg:col-span-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs"><Terminal size={15} /></span>
          AITA · Khảo thí thực hành
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">Hệ thống Khảo thí &amp; Chấm thi Thực hành PE</h1>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600">Đăng nhập để quản lý khóa học, tham gia ca thi và theo dõi kết quả bài nộp.</p>
        </div>
        <div className="space-y-3 rounded-xl border border-slate-200/70 bg-white/90 p-4 shadow-xs backdrop-blur-xs">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><ShieldCheck className="h-4 w-4 text-emerald-700" />Truy cập theo tài khoản</div>
          <p className="text-xs leading-relaxed text-slate-600">Quyền xem khóa học, mở đề và quản lý ca thi được xác thực ở backend.</p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600"><span className="rounded-lg border bg-slate-50 px-2.5 py-1.5">Mã đề do giảng viên cung cấp</span><span className="rounded-lg border bg-slate-50 px-2.5 py-1.5">IDE trên máy cá nhân</span></div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <LockKeyhole className="mt-0.5 h-[18px] w-[18px] shrink-0 text-indigo-700" />
          <p className="text-xs leading-relaxed text-slate-600">PDF đề thi và các thao tác nộp bài chỉ truy cập được khi tài khoản có quyền và ca thi đang mở.</p>
        </div>
      </div>
      <div className="relative z-10 mt-8 border-t border-slate-200/80 pt-5 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-medium text-slate-700"><BadgeCheck size={14} className="text-emerald-600" />Bài nộp được xử lý theo cấu hình chấm của đề</span>
      </div>
    </section>
  );
}
