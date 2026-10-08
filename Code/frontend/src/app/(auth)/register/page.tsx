import { ShieldCheck } from 'lucide-react';
import RegisterForm from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand & Title */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <ShieldCheck size={26} />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Đăng ký tài khoản AITA
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tạo tài khoản học tập và khảo thí sinh viên
          </p>
        </div>

        {/* Register Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs sm:p-8">
          <RegisterForm />
        </div>

        {/* Minimal Footer */}
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} AITA System • FPT University
        </p>
      </div>
    </div>
  );
}
