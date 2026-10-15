'use client';

import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  X,
} from 'lucide-react';
import axios from 'axios';
import { authService } from '../services/auth.service';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled: boolean;
  minLength?: number;
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  minLength,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label} <span className="text-rose-500">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          disabled={disabled}
          required
          minLength={minLength}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 pr-10 text-xs text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:text-sm"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          tabIndex={-1}
          aria-label={show ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function validatePasswords(current: string, next: string, confirm: string): string | null {
  if (!current) return 'Vui lòng nhập mật khẩu hiện tại.';
  if (next.length < 6) return 'Mật khẩu mới phải có ít nhất 6 ký tự.';
  if (next !== confirm) return 'Mật khẩu xác nhận không khớp với mật khẩu mới.';
  if (current === next) return 'Mật khẩu mới không được trùng với mật khẩu hiện tại.';
  return null;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validatePasswords(currentPassword, newPassword, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setSuccess(res?.message || 'Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1600);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setError(typeof msg === 'string' ? msg : 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.');
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <dialog
        open
        aria-labelledby="change-password-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/90 transition-colors duration-200 animate-in fade-in zoom-in-95 sm:p-7 block m-0 text-slate-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 id="change-password-title" className="text-base font-bold text-slate-900 sm:text-lg">
                Đổi mật khẩu tài khoản
              </h3>
              <p className="text-xs text-slate-500">
                Cập nhật mật khẩu định kỳ để bảo vệ tài khoản
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Đóng cửa sổ"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <PasswordInput
            id="current-password-input"
            label="Mật khẩu hiện tại"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Nhập mật khẩu đang sử dụng"
            disabled={loading}
          />

          <PasswordInput
            id="new-password-input"
            label="Mật khẩu mới"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Tối thiểu 6 ký tự"
            disabled={loading}
            minLength={6}
          />

          <PasswordInput
            id="confirm-password-input"
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Nhập lại mật khẩu mới"
            disabled={loading}
          />

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition sm:text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || Boolean(success)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 sm:text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Lưu mật khẩu mới</span>
                </>
              )}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
