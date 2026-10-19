import { Suspense } from 'react';
import { KeyRound } from 'lucide-react';
import VerifyOtpForm from './VerifyOtpForm';

export function VerifyOtpPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand & Title */}
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <KeyRound size={26} />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Xác thực OTP
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Bước cuối cùng để hoàn tất tạo tài khoản
          </p>
        </div>

        {/* OTP Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs sm:p-8">
          <Suspense fallback={<div className="py-8 text-center text-sm text-slate-600">Đang tải biểu mẫu xác thực...</div>}>
            <VerifyOtpForm />
          </Suspense>
        </div>

        {/* Minimal Footer */}
        <p className="text-center text-xs text-slate-600">
          © {new Date().getFullYear()} AITA System • FPT University
        </p>
      </div>
    </main>
  );
}
