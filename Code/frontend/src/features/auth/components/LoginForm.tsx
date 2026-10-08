'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import LoginCredentialsForm from './LoginCredentialsForm';
import GoogleSsoButton from './GoogleSsoButton';

function getErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (!error.response) {
      return 'Không thể kết nối đến máy chủ Backend (http://localhost:5000). Hãy đảm bảo Backend đang chạy!';
    }
    return 'Email hoặc mật khẩu không chính xác.';
  }
  return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.';
}

const DEMO_ACCOUNTS = [
  { label: 'Sinh viên', email: 'student@fpt.edu.vn', role: 'STUDENT' },
  { label: 'Giảng viên', email: 'lecturer@fpt.edu.vn', role: 'LECTURER' },
  { label: 'Quản trị viên', email: 'admin@fpt.edu.vn', role: 'ADMIN' },
];

export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('student@fpt.edu.vn');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await authService.login(identifier.trim(), password);
      const role = response.user?.role;
      let destination = '/student/dashboard';

      if (role === 'STUDENT') {
        destination = '/student/dashboard';
      } else if (role === 'LECTURER') {
        destination = '/dashboard';
      } else if (role === 'ADMIN') {
        destination = response.redirectTo || '/admin/ai-keys';
      } else if (response.redirectTo?.startsWith('/') && !response.redirectTo.startsWith('//')) {
        destination = response.redirectTo;
      }

      router.replace(destination);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      const authUrl = await authService.getGoogleAuthUrl();
      window.location.assign(authUrl);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Demo Accounts */}
      <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/80">
        <p className="text-xs font-medium text-slate-500 mb-2">
          Tài khoản dùng thử (Mật khẩu: <span className="font-mono text-slate-700">password123</span>):
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((acc) => {
            const isSelected = identifier === acc.email;
            return (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setIdentifier(acc.email);
                  setPassword('password123');
                }}
                className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all text-center ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {acc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Google Login Button */}
      <GoogleSsoButton
        isLoading={isGoogleLoading}
        disabled={isSubmitting}
        onClick={handleGoogleLogin}
      />

      <div className="relative my-3 flex items-center justify-center">
        <span className="absolute inset-x-0 border-t border-slate-200" />
        <span className="relative bg-white px-2 text-xs text-slate-400">
          hoặc đăng nhập bằng tài khoản
        </span>
      </div>

      {/* Credentials Form */}
      <LoginCredentialsForm
        identifier={identifier}
        password={password}
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        onIdentifierChange={setIdentifier}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />

      {/* Register Link */}
      <div className="pt-2 text-center text-sm text-slate-600">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
