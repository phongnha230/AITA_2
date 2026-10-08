'use client';

import { useState, type FormEventHandler } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, LoaderCircle, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginCredentialsFormProps {
  identifier: string;
  password: string;
  errorMessage: string | null;
  isSubmitting: boolean;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function LoginCredentialsForm({
  identifier,
  password,
  errorMessage,
  isSubmitting,
  onIdentifierChange,
  onPasswordChange,
  onSubmit,
}: LoginCredentialsFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <label htmlFor="login-identifier" className="text-sm font-medium text-slate-700">
          Email hoặc Tên đăng nhập
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            id="login-identifier"
            autoComplete="username"
            className="h-11 rounded-lg bg-white pl-10 pr-3 text-sm border-slate-200 focus-visible:ring-indigo-500"
            placeholder="Nhập email hoặc tên tài khoản"
            required
            value={identifier}
            onChange={(event) => onIdentifierChange(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            id="login-password"
            autoComplete="current-password"
            className="h-11 rounded-lg bg-white pl-10 pr-11 text-sm border-slate-200 focus-visible:ring-indigo-500"
            placeholder="Nhập mật khẩu"
            required
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-11 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-all"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          <>
            <span>Đăng nhập</span>
            <ArrowRight size={16} className="ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}
