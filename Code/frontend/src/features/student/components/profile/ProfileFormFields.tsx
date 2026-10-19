'use client';

import React from 'react';
import { User, Hash, Phone, BookOpen, GraduationCap, Github, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProfileFormFieldsProps {
  fullName: string;
  setFullName: (val: string) => void;
  studentCode: string;
  setStudentCode: (val: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  major: string;
  setMajor: (val: string) => void;
  cohort: string;
  setCohort: (val: string) => void;
  githubUrl: string;
  setGithubUrl: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  fieldError: 'fullName' | 'avatarUrl' | 'githubUrl' | null;
}

export const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({
  fullName,
  setFullName,
  studentCode,
  setStudentCode,
  phoneNumber,
  setPhoneNumber,
  major,
  setMajor,
  cohort,
  setCohort,
  githubUrl,
  setGithubUrl,
  bio,
  setBio,
  fieldError,
}) => {
  return (
    <>
      {/* 2. Grid thông tin cơ bản: Họ tên & MSSV */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-full-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Họ và tên sinh viên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
            <Input
              id="profile-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              minLength={2}
              maxLength={100}
              required
              placeholder="Nhập họ và tên đầy đủ..."
              aria-invalid={fieldError === 'fullName'}
              className="h-11 rounded-xl bg-white pl-10 focus-visible:ring-blue-600"
            />
          </div>
        </div>

        <div>
          <label htmlFor="profile-student-code" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Mã số sinh viên (MSSV)
          </label>
          <div className="relative">
            <Hash className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
            <Input
              id="profile-student-code"
              value={studentCode}
              onChange={(event) => setStudentCode(event.target.value)}
              maxLength={20}
              placeholder="VD: SE170123"
              className="h-11 rounded-xl bg-white pl-10 uppercase font-mono focus-visible:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* 3. Grid thông tin liên lạc: SĐT & Ngành học */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-phone-number" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Số điện thoại liên hệ
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
            <Input
              id="profile-phone-number"
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              maxLength={15}
              placeholder="VD: 0912345678"
              className="h-11 rounded-xl bg-white pl-10 focus-visible:ring-blue-600"
            />
          </div>
        </div>

        <div>
          <label htmlFor="profile-major" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Chuyên ngành đào tạo
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
            <Input
              id="profile-major"
              value={major}
              onChange={(event) => setMajor(event.target.value)}
              maxLength={100}
              placeholder="VD: Kỹ thuật phần mềm (SE)"
              className="h-11 rounded-xl bg-white pl-10 focus-visible:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* 4. Khóa học (K18, K19...) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-cohort" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Khóa sinh viên
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
            <Input
              id="profile-cohort"
              value={cohort}
              onChange={(event) => setCohort(event.target.value)}
              maxLength={20}
              placeholder="VD: K18, K19..."
              className="h-11 rounded-xl bg-white pl-10 focus-visible:ring-blue-600"
            />
          </div>
        </div>

        <div>
          <label htmlFor="profile-github-url" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Liên kết GitHub cá nhân
          </label>
          <div className="relative">
            <Github className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
            <Input
              id="profile-github-url"
              type="url"
              value={githubUrl}
              onChange={(event) => setGithubUrl(event.target.value)}
              maxLength={200}
              placeholder="https://github.com/username"
              aria-invalid={fieldError === 'githubUrl'}
              className="h-11 rounded-xl bg-white pl-10 font-mono text-xs focus-visible:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* 5. Tiểu sử / Giới thiệu bản thân */}
      <div>
        <label htmlFor="profile-bio" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
          Tiểu sử &amp; Mục tiêu học tập (Bio)
        </label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Chia sẻ ngắn về định hướng nghề nghiệp, sở thích lập trình..."
            className="w-full rounded-xl border border-input bg-white p-3 pl-10 text-base text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>Tối đa 500 ký tự</span>
          <span>{bio.length}/500</span>
        </div>
      </div>
    </>
  );
};
