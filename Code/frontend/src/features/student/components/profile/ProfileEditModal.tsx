'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { LoaderCircle, X } from 'lucide-react';
import { getStudentServiceErrorMessage } from '../../services/student.service';
import type { StudentProfile, StudentProfileUpdate } from '../../types/student.types';

interface ProfileEditModalProps {
  open: boolean;
  profile: StudentProfile;
  onClose: () => void;
  onSave: (data: StudentProfileUpdate) => Promise<StudentProfile>;
}

export function ProfileEditModal({ open, profile, onClose, onSave }: ProfileEditModalProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<'fullName' | 'avatarUrl' | null>(null);
  const [saved, setSaved] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

    document.body.style.overflow = 'hidden';
    nameInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSavingRef.current) {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    const cleanName = fullName.trim();
    if (cleanName.length < 2 || cleanName.length > 100) {
      setFieldError('fullName');
      setError('Họ và tên cần có từ 2 đến 100 ký tự.');
      return;
    }

    const cleanAvatarUrl = avatarUrl.trim();
    if (cleanAvatarUrl) {
      try {
        const parsedUrl = new URL(cleanAvatarUrl);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          setFieldError('avatarUrl');
          setError('URL ảnh đại diện phải dùng HTTP hoặc HTTPS.');
          return;
        }
      } catch {
        setFieldError('avatarUrl');
        setError('URL ảnh đại diện không hợp lệ.');
        return;
      }
    }

    setIsSaving(true);
    isSavingRef.current = true;
    setError(null);
    setFieldError(null);
    setSaved(false);
    try {
      const updated = await onSave({
        fullName: cleanName,
        avatarUrl: cleanAvatarUrl || null,
      });
      setFullName(updated.fullName);
      setAvatarUrl(updated.avatarUrl ?? '');
      setSaved(true);
    } catch (requestError: unknown) {
      setFieldError(null);
      setError(getStudentServiceErrorMessage(requestError, 'Không thể lưu thay đổi hồ sơ. Vui lòng thử lại.'));
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  };

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4"
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-edit-title"
        aria-describedby="profile-edit-description"
        className="my-auto w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="profile-edit-title" className="text-lg font-bold text-slate-900">Chỉnh sửa hồ sơ</h2>
            <p id="profile-edit-description" className="mt-1 text-sm text-slate-600">
              Cập nhật tên hiển thị và ảnh đại diện của bạn.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Đóng chỉnh sửa hồ sơ"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="profile-full-name" className="mb-1.5 block text-sm font-semibold text-slate-700">Họ và tên</label>
            <input
              ref={nameInputRef}
              id="profile-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              minLength={2}
              maxLength={100}
              required
              aria-invalid={fieldError === 'fullName'}
              aria-describedby={fieldError === 'fullName' ? 'profile-edit-error' : undefined}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 shadow-inner outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="profile-avatar-url" className="mb-1.5 block text-sm font-semibold text-slate-700">URL ảnh đại diện</label>
            <input
              id="profile-avatar-url"
              type="url"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
              aria-invalid={fieldError === 'avatarUrl'}
              aria-describedby={fieldError === 'avatarUrl' ? 'profile-edit-error' : undefined}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-xs text-slate-500">Để trống để bỏ ảnh và hiển thị chữ cái đầu từ tên.</p>
          </div>

          {error && <p id="profile-edit-error" role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{error}</p>}
          {saved && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">Hồ sơ đã được cập nhật.</p>}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={isSaving || !fullName.trim()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
            >
              {isSaving && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
