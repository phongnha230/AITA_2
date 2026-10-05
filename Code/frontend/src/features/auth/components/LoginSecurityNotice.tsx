import { ShieldCheck } from 'lucide-react';

export default function LoginSecurityNotice() {
  return (
    <section id="security" className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl bg-[#eff4ff] p-4 shadow-sm md:flex-row md:items-center md:p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <ShieldCheck size={22} />
        </span>
        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
            Hệ thống bảo vệ Kiosk thi PE chủ động
            <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-semibold text-white">
              Proctor AI v4.2
            </span>
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Mọi hành động đăng nhập từ mạng nội bộ phòng máy LAB sẽ được ghi nhận IP máy trạm, MAC address và ảnh chụp định kỳ phục vụ hậu kiểm.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-lg bg-white px-3 py-2">Kiosk: Sẵn sàng</span>
        <span className="rounded-lg bg-white px-3 py-2">Sandbox: An toàn</span>
      </div>
    </section>
  );
}
