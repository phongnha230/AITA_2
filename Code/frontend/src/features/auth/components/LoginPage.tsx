import { GraduationCap, ShieldCheck } from 'lucide-react';
import LoginContextPanel from './LoginContextPanel';
import LoginForm from './LoginForm';
import LoginSecurityNotice from './LoginSecurityNotice';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9ff] text-slate-900">
      <header className="w-full px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5" aria-label="AITA - Trang chủ">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white">
              <ShieldCheck size={20} />
            </span>
            <span className="flex flex-col">
              <span className="text-lg font-bold leading-none text-blue-800">AITA</span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                Assessment Platform
              </span>
            </span>
          </a>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
            <span className="hidden sm:inline">Kiosk Proctoring Active</span>
            <span className="sm:hidden">Kiosk Active</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full flex-1 items-center px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12 lg:gap-6">
            <LoginContextPanel />
            <section className="flex flex-col justify-center rounded-2xl bg-white p-6 shadow-sm sm:p-8 lg:col-span-7">
              <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <GraduationCap size={18} className="text-blue-700" />
                Đăng nhập hệ thống khảo thí
              </div>
              <LoginForm />
            </section>
          </div>

          <LoginSecurityNotice />
          <p className="mt-4 text-center text-xs leading-5 text-slate-500">
            Cần hỗ trợ kỹ thuật trong ca thi? Liên hệ IT Helpdesk Khảo thí:{' '}
            <a className="font-semibold text-slate-700" href="tel:02473005588">
              (024) 7300 5588
            </a>{' '}
            • Trực thi:{' '}
            <a className="font-semibold text-blue-700" href="tel:0988312445">
              0988.312.445
            </a>
          </p>
        </div>
      </main>

      <footer className="mt-6 bg-white px-4 py-4 text-xs text-slate-500 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <span>© 2024 FPT University • Hội đồng Khảo thí &amp; Đảm bảo Chất lượng</span>
          <span className="flex flex-wrap items-center justify-center gap-3">
            <a href="mailto:helpdesk@fpt.edu.vn" className="transition hover:text-blue-700">
              Hỗ trợ Khảo thí
            </a>
            <a href="#security" className="transition hover:text-blue-700">
              Điều khoản Bảo mật Kiosk
            </a>
            <a href="#security" className="transition hover:text-blue-700">
              Kiểm tra Thiết bị
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
