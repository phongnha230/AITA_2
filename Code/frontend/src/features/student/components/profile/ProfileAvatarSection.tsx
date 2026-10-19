'use client';

import React from 'react';
import { Loader2, UploadCloud, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudentAvatar } from '../shared/StudentAvatar';

interface ProfileAvatarSectionProps {
  fullName: string;
  avatarUrl: string;
  isUploadingImage: boolean;
  isSaving: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;
}

export const ProfileAvatarSection: React.FC<ProfileAvatarSectionProps> = ({
  fullName,
  avatarUrl,
  isUploadingImage,
  isSaving,
  fileInputRef,
  onSelectFile,
  onRemoveAvatar,
}) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
        Ảnh đại diện (Avatar)
      </span>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Preview Avatar */}
        <div className="relative shrink-0 self-center">
          <StudentAvatar
            fullName={fullName}
            avatarUrl={avatarUrl || null}
            size="profile"
          />
          {isUploadingImage && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 text-white">
              <Loader2 className="size-6 animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2 text-left">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={onSelectFile}
            disabled={isUploadingImage || isSaving}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage || isSaving}
              className="rounded-xl border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold"
            >
              {isUploadingImage ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Đang tải lên Cloudinary...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-1.5 size-3.5 text-blue-600" />
                  Tải ảnh từ máy tính
                </>
              )}
            </Button>

            {avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemoveAvatar}
                disabled={isUploadingImage || isSaving}
                className="rounded-xl text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="mr-1.5 size-3.5" />
                Gỡ ảnh
              </Button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Hỗ trợ JPG, PNG, WEBP tối đa 10MB. Ảnh được lưu trữ và tối ưu tự động bởi Cloudinary.
          </p>
        </div>
      </div>
    </div>
  );
};
