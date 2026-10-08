'use client';

import { useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { getStudentServiceErrorMessage } from '../../services/student.service';
import type { StudentProfile, StudentProfileUpdate } from '../../types/student.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isSaving) {
      setError(null);
      setSaved(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border bg-card p-6 shadow-2xl sm:p-7">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-foreground">Chỉnh sửa hồ sơ</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            Cập nhật tên hiển thị và ảnh đại diện của bạn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="profile-full-name" className="mb-1.5 block text-sm font-semibold text-foreground">
              Họ và tên
            </label>
            <Input
              id="profile-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              minLength={2}
              maxLength={100}
              required
              aria-invalid={fieldError === 'fullName'}
              aria-describedby={fieldError === 'fullName' ? 'profile-edit-error' : undefined}
              className="h-11 rounded-xl bg-muted/40 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="profile-avatar-url" className="mb-1.5 block text-sm font-semibold text-foreground">
              URL ảnh đại diện
            </label>
            <Input
              id="profile-avatar-url"
              type="url"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
              aria-invalid={fieldError === 'avatarUrl'}
              aria-describedby={fieldError === 'avatarUrl' ? 'profile-edit-error' : undefined}
              className="h-11 rounded-xl bg-muted/40 focus-visible:ring-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">Để trống để bỏ ảnh và hiển thị chữ cái đầu từ tên.</p>
          </div>

          {error && (
            <p id="profile-edit-error" role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
              Hồ sơ đã được cập nhật.
            </p>
          )}

          <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl"
            >
              Đóng
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !fullName.trim()}
              className="rounded-xl shadow-sm"
            >
              {isSaving && <LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
