'use client';

import React from 'react';
import { Globe, GitCommit, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SubmitExamGitChannelProps {
  gitRepoUrl: string;
  setGitRepoUrl: (url: string) => void;
  gitCommitHash: string;
  setGitCommitHash: (hash: string) => void;
  disabled: boolean;
}

export const SubmitExamGitChannel: React.FC<SubmitExamGitChannelProps> = ({
  gitRepoUrl,
  setGitRepoUrl,
  gitCommitHash,
  setGitCommitHash,
  disabled,
}) => {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="git-repo-url" className="text-xs font-semibold text-slate-700">
          Đường dẫn GitHub Repository <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            id="git-repo-url"
            placeholder="https://github.com/username/project-repo"
            value={gitRepoUrl}
            onChange={(e) => setGitRepoUrl(e.target.value)}
            className="h-10 text-xs rounded-lg pl-9 font-mono"
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="git-commit-hash" className="text-xs font-semibold text-slate-700">
          Commit Hash (Tùy chọn)
        </label>
        <div className="relative">
          <GitCommit className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            id="git-commit-hash"
            placeholder="VD: 7f8a9b2 (Để trống để lấy commit mới nhất)"
            value={gitCommitHash}
            onChange={(e) => setGitCommitHash(e.target.value)}
            className="h-10 text-xs rounded-lg pl-9 font-mono uppercase"
            disabled={disabled}
            maxLength={40}
          />
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900 flex items-start gap-2">
        <Info size={14} className="shrink-0 text-amber-600 mt-0.5" />
        <span>
          Đảm bảo Repository đang ở chế độ <strong>Public</strong> để Sandbox có thể clone mã nguồn và chấm tự động.
        </span>
      </div>
    </div>
  );
};
