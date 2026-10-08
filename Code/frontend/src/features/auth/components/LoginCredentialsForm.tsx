'use client';

import { useState, type FormEventHandler } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, UserRound, X } from 'lucide-react';

interface LoginCredentialsFormProps {
  identifier: string;
  password: string;
  errorMessage: string | null;
  isSubmitting: boolean;
  isGoogleLoading: boolean;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function LoginCredentialsForm({
  identifier,
  password,
  errorMessage,
  isSubmitting,
  isGoogleLoading,
  onIdentifierChange,
  onPasswordChange,
  onSubmit,
}: LoginCredentialsFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="login-identifier" className="text-xs font-semibold text-slate-800">
            Email hoặc Mã số (MSSV / MSGV)
          </label>
        </div>
        <div className="relative">
          <UserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="login-identifier"
            autoComplete="username"
            className="w-full rounded-lg bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600"
            placeholder="VD: ten@fpt.edu.vn hoặc MSSV"
            required
            value={identifier}
            onChange={(event) => onIdentifierChange(event.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-slate-800">
          Mật khẩu khảo thí nội bộ
        </label>
        <div className="relative">
          <ShieldCheck className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="login-password"
            autoComplete="current-password"
            className="w-full rounded-lg bg-slate-50 py-2.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600"
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
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowSupport((visible) => !visible)}
          aria-expanded={showSupport}
          className="text-xs font-semibold text-blue-700 hover:underline"
        >
          Quên mật khẩu?
        </button>
      </div>

      {showSupport && <PasswordSupport onClose={() => setShowSupport(false)} />}
      {errorMessage && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isGoogleLoading}
        className="group mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Đang xác thực tài khoản...' : 'Đăng nhập hệ thống khảo thí'}
        {isSubmitting ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        )}
      </button>
    </form>
  );
}

function PasswordSupport({ onClose }: { onClose: () => void }) {
  return (
    <div className="rounded-xl border-l-4 border-blue-700 bg-blue-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-900">Cấp lại mật khẩu thi PE</p>
        <button
          type="button"
          aria-label="Đóng thông tin hỗ trợ"
          onClick={onClose}
          className="rounded p-1 text-slate-500 hover:bg-blue-100 hover:text-slate-900"
        >
          <X size={16} />
        </button>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        Thí sinh vui lòng thông báo với Giám thị phòng thi hoặc liên hệ bàn Thư ký Hội đồng thi tại Phòng 204 Beta để được hỗ trợ.
      </p>
      <a href="tel:02473005588" className="mt-2 inline-block text-xs font-semibold text-blue-800">
        Hotline: (024) 7300 5588 nhánh 1
      </a>
    </div>
  );
}
