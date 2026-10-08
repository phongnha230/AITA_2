'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  KeyRound,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { authService } from '@/features/auth/services/auth.service';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState('student@fpt.edu.vn');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'session_expired') {
      setErrorMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    } else if (errorParam === 'invalid_callback') {
      setErrorMessage('Xác thực thất bại. Vui lòng thử lại.');
    } else if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMessage('Vui lòng nhập đầy đủ tài khoản/email và mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const authData = await authService.login(trimmedUser, trimmedPass);
      const role = authData.user?.role;

      if (role === 'STUDENT') {
        router.replace('/student/dashboard');
      } else if (role === 'ADMIN') {
        router.replace(authData.redirectTo || '/admin/ai-keys');
      } else {
        router.replace(authData.redirectTo || '/dashboard');
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin tài khoản và mật khẩu.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const url = await authService.getGoogleAuthUrl();
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 'Không thể kết nối đến máy chủ Google OAuth lúc này.',
      );
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-elevated-lg sm:p-9">
        {/* Brand header */}
        <div className="text-center">
          <div className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-md shadow-blue-600/25">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
            AITA Examination Portal
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Hệ thống Khảo thí &amp; Đánh giá Thực hành Lập trình PE
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-medium text-rose-800"
          >
            {errorMessage}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="login-username"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Tài khoản hoặc Email sinh viên
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="student@fpt.edu.vn hoặc MSSV"
                required
                autoComplete="username"
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 text-sm text-slate-900 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Mật khẩu
              </label>
              <span className="text-xs text-blue-600 hover:underline cursor-pointer">
                Quên mật khẩu?
              </span>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 text-sm text-slate-900 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                <span>Đăng nhập hệ thống</span>
              </>
            )}
          </button>
        </form>

        {/* OAuth separator */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-slate-200"></div>
          <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Dành cho Sinh viên FPT
          </span>
          <div className="w-full border-t border-slate-200"></div>
        </div>

        {/* Google OAuth button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.41l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.59l4.03 3.15c.95-2.83 3.6-4.99 6.72-4.99z"
            />
          </svg>
          <span>Đăng nhập với Google (@fpt.edu.vn)</span>
        </button>

        {/* Security badge footer */}
        <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Bảo mật JWT Bearer Token &bull; Docker Sandbox Isolation</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F6F8FC] p-4 sm:p-6">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />
            <span>Đang tải...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
