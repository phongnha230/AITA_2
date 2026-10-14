'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { CheckCircle2, LoaderCircle, Sparkles } from 'lucide-react';
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
import { uploadService } from '@/lib/upload.service';
import { ProfileAvatarSection } from './ProfileAvatarSection';
import { ProfileFormFields } from './ProfileFormFields';

interface ProfileEditModalProps {
  open: boolean;
  profile: StudentProfile;
  onClose: () => void;
  onSave: (data: StudentProfileUpdate) => Promise<StudentProfile>;
}

export function ProfileEditModal({ open, profile, onClose, onSave }: ProfileEditModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(profile.fullName);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '');
  const [studentCode, setStudentCode] = useState(profile.studentCode ?? '');
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber ?? '');
  const [major, setMajor] = useState(profile.major ?? '');
  const [cohort, setCohort] = useState(profile.cohort ?? '');
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<'fullName' | 'avatarUrl' | 'githubUrl' | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSelectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP, GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước ảnh tối đa là 10MB');
      return;
    }

    try {
      setIsUploadingImage(true);
      setError(null);
      const result = await uploadService.uploadAvatar(file);
      setAvatarUrl(result.avatarUrl);
    } catch (err: any) {
      console.error('Lỗi upload avatar lên Cloudinary:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải ảnh lên Cloudinary. Vui lòng thử lại.');
    } finally {
      setIsUploadingImage(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldError(null);

    const cleanName = fullName.trim();
    if (!cleanName) {
      setFieldError('fullName');
      setError('Họ và tên không được để trống.');
      return;
    }

    const cleanGithubUrl = githubUrl.trim();
    if (cleanGithubUrl && !cleanGithubUrl.startsWith('http')) {
      setFieldError('githubUrl');
      setError('Đường dẫn GitHub phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    const cleanAvatarUrl = avatarUrl.trim();
    setIsSaving(true);

    try {
      const updated = await onSave({
        fullName: cleanName,
        avatarUrl: cleanAvatarUrl || null,
        studentCode: studentCode.trim() || null,
        phoneNumber: phoneNumber.trim() || null,
        major: major.trim() || null,
        cohort: cohort.trim() || null,
        githubUrl: cleanGithubUrl || null,
        bio: bio.trim() || null,
      });

      setFullName(updated.fullName);
      setAvatarUrl(updated.avatarUrl ?? '');
      setStudentCode(updated.studentCode ?? '');
      setPhoneNumber(updated.phoneNumber ?? '');
      setMajor(updated.major ?? '');
      setCohort(updated.cohort ?? '');
      setGithubUrl(updated.githubUrl ?? '');
      setBio(updated.bio ?? '');
      setSaved(true);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (requestError: unknown) {
      setFieldError(null);
      setError(getStudentServiceErrorMessage(requestError, 'Không thể lưu thay đổi hồ sơ. Vui lòng thử lại.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isSaving && !isUploadingImage) {
      setError(null);
      setSaved(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card p-6 shadow-2xl sm:p-7">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold text-foreground">Chỉnh sửa hồ sơ cá nhân</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            Cập nhật thông tin sinh viên, học vấn và các liên kết tài khoản của bạn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <ProfileAvatarSection
            fullName={fullName}
            avatarUrl={avatarUrl}
            isUploadingImage={isUploadingImage}
            isSaving={isSaving}
            fileInputRef={fileInputRef}
            onSelectFile={handleSelectFile}
            onRemoveAvatar={handleRemoveAvatar}
          />

          <ProfileFormFields
            fullName={fullName}
            setFullName={setFullName}
            studentCode={studentCode}
            setStudentCode={setStudentCode}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            major={major}
            setMajor={setMajor}
            cohort={cohort}
            setCohort={setCohort}
            githubUrl={githubUrl}
            setGithubUrl={setGithubUrl}
            bio={bio}
            setBio={setBio}
            fieldError={fieldError}
          />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              {error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>Hồ sơ đã được cập nhật thành công!</span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving || isUploadingImage}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isUploadingImage}
              className="rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
