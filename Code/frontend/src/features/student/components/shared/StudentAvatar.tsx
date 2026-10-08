'use client';

import Image from 'next/image';
import { useState } from 'react';

interface StudentAvatarProps {
  fullName: string | null | undefined;
  avatarUrl?: string | null;
  size?: 'header' | 'profile';
}

function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join('')
    .toLocaleUpperCase('vi-VN');
}

export function StudentAvatar({ fullName, avatarUrl, size = 'header' }: StudentAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const dimension = size === 'profile'
    ? 'h-20 w-20 text-2xl font-bold rounded-2xl bg-blue-600 text-white shadow-sm ring-4 ring-blue-50/80'
    : 'h-9 w-9 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100';
  const name = fullName?.trim() ?? '';

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden ${dimension}`}
      role={name ? 'img' : undefined}
      aria-label={name ? `Ảnh đại diện ${name}` : undefined}
    >
      {avatarUrl && !imageFailed ? (
        <Image
          src={avatarUrl}
          alt={name ? `Ảnh đại diện ${name}` : 'Ảnh đại diện'}
          fill
          sizes={size === 'profile' ? '80px' : '36px'}
          unoptimized
          onError={() => setImageFailed(true)}
          className="object-cover"
        />
      ) : name ? (
        getInitials(name)
      ) : (
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-slate-400" />
      )}
    </span>
  );
}
