import { ShieldCheck } from 'lucide-react';

export default function LoginSecurityNotice() {
  return (
    <section id="security" className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-2xs md:flex-row md:items-center md:p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800"><ShieldCheck size={20} /></span>
        <div>
          <p className="text-sm font-semibold text-slate-900">Bảo vệ quyền truy cập ca thi</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">Backend kiểm tra tài khoản, ghi danh khóa học và mã đề trước khi cho xem PDF hoặc nộp bài. Hệ thống không theo dõi màn hình hay IDE trên máy cá nhân.</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 text-xs text-slate-600"><span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium shadow-2xs">Đề thi: Có phân quyền</span><span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium shadow-2xs">Sandbox: Cách ly</span></div>
    </section>
  );
}
