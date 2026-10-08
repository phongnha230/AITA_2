'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import LoginCredentialsForm from './LoginCredentialsForm';
import GoogleSsoButton from './GoogleSsoButton';

function getErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || 'Thông tin đăng nhập không chính xác hoặc hệ thống đang gặp sự cố.';
  }
  return 'Không thể đăng nhập lúc này. Vui lòng thử lại sau.';
}

export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await authService.login(identifier.trim(), password);
      const destination =
        response.redirectTo?.startsWith('/') && !response.redirectTo.startsWith('//')
          ? response.redirectTo
          : '/dashboard';
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
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <GoogleSsoButton
        isLoading={isGoogleLoading}
        disabled={isSubmitting}
        onClick={handleGoogleLogin}
      />
      <div className="relative my-6 flex items-center justify-center">
        <span className="absolute inset-x-0 border-t border-slate-200" />
        <span className="relative bg-white px-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Hoặc đăng nhập với tài khoản nội bộ
        </span>
      </div>
      <LoginCredentialsForm
        identifier={identifier}
        password={password}
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        isGoogleLoading={isGoogleLoading}
        onIdentifierChange={setIdentifier}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    </>
  );
}
