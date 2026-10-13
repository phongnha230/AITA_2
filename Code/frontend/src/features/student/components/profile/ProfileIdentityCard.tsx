'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import {
  BookOpen,
  Camera,
  CheckCircle2,
  ExternalLink,
  Github,
  GraduationCap,
  Hash,
  KeyRound,
  Loader2,
  Mail,
  PencilLine,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import type { StudentProfile } from '../../types/student.types';
import { StudentAvatar } from '../shared/StudentAvatar';
import { uploadService } from '@/lib/upload.service';

interface ProfileIdentityCardProps {
  profile: StudentProfile;
  onEdit: () => void;
  onChangePassword?: () => void;
  onAvatarUpdated?: (avatarUrl: string) => void;
}

const roleLabels: Record<StudentProfile['role'], string> = {
  ADMIN: 'Quản trị viên',
  LECTURER: 'Giảng viên',
  STUDENT: 'Sinh viên',
};

const statusLabels: Record<StudentProfile['status'], string> = {
  ACTIVE: 'Đang hoạt động',
  SUSPENDED: 'Tạm khóa',
  PENDING_ACTIVATION: 'Chờ kích hoạt',
};

export function ProfileIdentityCard({
  profile,
  onEdit,
  onChangePassword,
  onAvatarUpdated,
}: ProfileIdentityCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAvatarClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng ảnh
    if (!file.type.startsWith('image/')) {
      setUploadError('Chỉ hỗ trợ file hình ảnh (JPG, PNG, WEBP, GIF)');
      return;
    }

    // Giới hạn 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Kích thước ảnh tối đa là 10MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      const res = await uploadService.uploadAvatar(file);
      if (res?.avatarUrl && onAvatarUpdated) {
        onAvatarUpdated(res.avatarUrl);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải ảnh đại diện:', err);
      setUploadError(err.response?.data?.message || err.message || 'Không thể tải ảnh lên Cloudinary');
    } finally {
      setIsUploading(false);
      // Reset input để chọn lại cùng file nếu muốn
      if (event.target) event.target.value = '';
    }
  };

  const academicInfo = [profile.major, profile.cohort].filter(Boolean).join(' • ');

  return (
    <section
      aria-label="Thông tin hồ sơ sinh viên"
      className="relative overflow-hidden rounded-2xl border border-blue-100/80 bg-gradient-to-r from-white via-white to-blue-50/40 p-6 shadow-elevated sm:p-7"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: Avatar + Details */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {/* Avatar with Cloudinary Upload Trigger */}
          <div className="relative shrink-0 group self-start">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <button
              type="button"
              onClick={handleAvatarClick}
              className={`relative cursor-pointer transition-transform group-hover:scale-105 text-left p-0 border-0 bg-transparent ${
                isUploading ? 'opacity-80 pointer-events-none' : ''
              }`}
              title="Nhấp để thay đổi ảnh đại diện (Tải lên Cloudinary)"
              aria-label="Nhấp để thay đổi ảnh đại diện"
            >
              <StudentAvatar
                fullName={profile.fullName}
                avatarUrl={profile.avatarUrl}
                size="profile"
              />

              {/* Upload overlay hover / loading spinner */}
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <div className="flex flex-col items-center text-white">
                    <Camera className="h-5 w-5" />
                    <span className="text-[10px] font-medium mt-0.5">Đổi ảnh</span>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                  <Loader2 className="h-7 w-7 animate-spin text-white" />
                </div>
              )}
            </button>

            {/* Verified badge */}
            <span
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white shadow-xs"
              title="Tài khoản đã xác thực"
            >
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            {/* Header: Tên + MSSV + Vai trò */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                {profile.fullName || 'Tài khoản sinh viên'}
              </h2>
              {profile.studentCode && (
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-mono text-xs font-bold text-blue-700 shadow-2xs">
                  MSSV: {profile.studentCode}
                </span>
              )}
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-2xs">
                {roleLabels[profile.role]}
              </span>
            </div>

            {/* Liên hệ & Thông tin cá nhân */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 sm:text-sm">
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {profile.email}
              </span>

              {profile.phoneNumber && (
                <>
                  <span className="hidden text-slate-300 sm:inline">•</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {profile.phoneNumber}
                  </span>
                </>
              )}

              {academicInfo && (
                <>
                  <span className="hidden text-slate-300 sm:inline">•</span>
                  <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium text-xs sm:text-sm">
                    <GraduationCap className="h-4 w-4 text-indigo-500" />
                    {academicInfo}
                  </span>
                </>
              )}

              {profile.githubUrl && (
                <>
                  <span className="hidden text-slate-300 sm:inline">•</span>
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 hover:underline transition-colors"
                  >
                    <Github className="h-3.5 w-3.5 text-slate-700" />
                    GitHub
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </a>
                </>
              )}
            </div>

            {/* Bio / Mục tiêu */}
            {profile.bio && (
              <p className="mt-3 max-w-2xl rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-2 text-xs italic text-slate-600">
                “{profile.bio}”
              </p>
            )}

            {/* Trạng thái & Vai trò */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Trạng thái: <span className="font-semibold">{statusLabels[profile.status]}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-2xs">
                <User className="h-3.5 w-3.5 text-blue-600" />
                Vai trò: <span className="font-semibold">{roleLabels[profile.role]}</span>
              </span>
            </div>

            {uploadError && (
              <p className="mt-2 text-xs font-medium text-red-600 animate-fadeIn">
                ⚠️ {uploadError}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap shrink-0 items-center gap-3">
          {onChangePassword && (
            <button
              type="button"
              onClick={onChangePassword}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <KeyRound className="h-4 w-4 text-indigo-600" />
              <span>Đổi mật khẩu</span>
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            <PencilLine className="h-4 w-4" />
            <span>Chỉnh sửa hồ sơ</span>
          </button>
        </div>
      </div>
    </section>
  );
}
