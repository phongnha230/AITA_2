'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  ExternalLink,
  FolderGit2,
  Globe,
  Loader2,
  Users2,
  X,
} from 'lucide-react';
import axios from 'axios';
import { teamService } from '../services/team.service';
import type { Team } from '../types/team.types';

interface CreateTeamModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (team: Team) => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  courseId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [gitRepoUrl, setGitRepoUrl] = useState('');
  const [deployedUrl, setDeployedUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Tên nhóm phải có ít nhất 2 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const created = await teamService.createTeam({
        courseId,
        name: name.trim(),
        projectTitle: projectTitle.trim() || undefined,
        gitRepoUrl: gitRepoUrl.trim() || undefined,
        deployedUrl: deployedUrl.trim() || undefined,
      });

      setName('');
      setProjectTitle('');
      setGitRepoUrl('');
      setDeployedUrl('');
      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setError(typeof msg === 'string' ? msg : 'Tạo nhóm thất bại. Vui lòng kiểm tra lại.');
      } else {
        setError('Đã có lỗi xảy ra khi tạo nhóm.');
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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-team-title"
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/90 transition-all duration-200 animate-in fade-in zoom-in-95 sm:p-7"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <h3 id="create-team-title" className="text-base font-bold text-slate-900 sm:text-lg">
                Tạo nhóm đồ án / bài tập lớn
              </h3>
              <p className="text-xs text-slate-500">
                Khởi tạo nhóm dự án mới cho các thành viên trong môn học
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Đóng"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên nhóm <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Team 01 - Smart Parking"
              disabled={loading}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên đề tài đồ án (Project Title)
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Ví dụ: Hệ thống IoT quản lý bãi đỗ xe thông minh"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FolderGit2 className="h-3.5 w-3.5 text-slate-500" />
              GitHub Repository URL
            </label>
            <input
              type="url"
              value={gitRepoUrl}
              onChange={(e) => setGitRepoUrl(e.target.value)}
              placeholder="https://github.com/org/repo-name"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-mono text-xs text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              Web Demo / Production URL
            </label>
            <input
              type="url"
              value={deployedUrl}
              onChange={(e) => setDeployedUrl(e.target.value)}
              placeholder="https://my-app.vercel.app"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-mono text-xs text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:text-sm"
            />
          </div>

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
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 sm:text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang khởi tạo...</span>
                </>
              ) : (
                <>
                  <Users2 className="h-4 w-4" />
                  <span>Xác nhận tạo nhóm</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
