import {
  BadgeCheck,
  LockKeyhole,
  Network,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

export default function LoginContextPanel() {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#e5eeff] p-6 shadow-sm sm:p-8 lg:col-span-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#b4c5ff]/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-emerald-200/50 blur-3xl" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-white">
            <Terminal size={16} />
          </span>
          LAB Proctoring Node #402-A
        </div>
        <div>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl">
            Hệ thống Khảo thí &amp; Chấm thi Thực hành PE
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Phân hệ đăng nhập tập trung cho giám thị, giảng viên đánh giá và thí sinh dự thi thực hành lập trình.
          </p>
        </div>

        <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Phiên thi hiện hành
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" />
              Đang trực tuyến
            </span>
          </div>
          <p className="font-semibold text-slate-900">Kỳ thi PE Fall 2024 • Block 5</p>
          <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
            <span className="flex items-center gap-1.5">
              <Network size={16} className="text-blue-700" />
              Subnet: LAB-402-VLAN12
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-700" />
              Kiosk Lock: Bật
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-[#f8f9ff]/80 p-4">
          <LockKeyhole size={20} className="mt-0.5 shrink-0 text-rose-700" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
              Quy định định danh bắt buộc
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Tài khoản được đồng bộ từ Phòng Khảo thí / Cổng thông tin FAP. Hệ thống không mở cổng tự đăng ký để bảo toàn tính toàn vẹn phòng thi.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8 border-t border-slate-400/30 pt-5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
          <span>CHỈ SỐ TOÀN VẸN MÔI TRƯỜNG</span>
          <span className="text-emerald-800">99.8% Tối ưu</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
          <div className="h-full w-[92%] rounded-full bg-emerald-600" />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <BadgeCheck size={14} className="text-emerald-700" />
            SEB Sandbox: Active
          </span>
          <span>Port 8443 Monitored</span>
        </div>
      </div>
    </section>
  );
}
