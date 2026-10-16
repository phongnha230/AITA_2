'use client';

import {
  AlertCircle,
  CheckCircle2,
  FileArchive,
  GitBranch,
  HardDriveUpload,
  LoaderCircle,
  Send,
  Globe,
  Users,
} from 'lucide-react';
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
import type { StudentExamViewModel } from '../../types/student.types';
import { SubmitExamZipChannel } from './SubmitExamZipChannel';
import { SubmitExamGitChannel } from './SubmitExamGitChannel';
import { useSubmitExamForm } from '../../hooks/useSubmitExamForm';

interface SubmitExamModalProps {
  exam: StudentExamViewModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitExamModal({ exam, isOpen, onClose }: SubmitExamModalProps) {
  const form = useSubmitExamForm(exam, onClose);

  if (!exam || !form.assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && form.handleReset()}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl shadow-xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <HardDriveUpload size={18} />
            </span>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {form.assignment.submissionType === 'GROUP'
                ? 'Nộp Final Project nhóm'
                : 'Nộp bài'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            {form.course ? `${form.course.code} • ${form.course.name}` : 'Bài tập và bài thi'}
          </DialogDescription>
        </DialogHeader>

        {/* Thông tin bài thi */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs space-y-1">
          <p className="font-semibold text-slate-800 truncate">{form.assignment.title}</p>
          <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[11px]">
            <span>Môi trường: <strong className="text-slate-700 font-mono">{form.assignment.environment}</strong></span>
            <span>•</span>
            <span>Hình thức: <strong className="text-slate-700">{form.assignment.submissionType === 'GROUP' ? 'Nhóm' : 'Cá nhân'}</strong></span>
          </div>
        </div>

        {/* Channel Switcher */}
        {form.assignment.submissionType !== 'GROUP' && form.allowZip && form.allowGit && (
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                form.setChannel('ZIP_UPLOAD');
                form.setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                form.channel === 'ZIP_UPLOAD'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileArchive size={14} />
              <span>Tệp nén .ZIP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                form.setChannel('GIT_COMMIT');
                form.setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                form.channel === 'GIT_COMMIT'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitBranch size={14} />
              <span>GitHub Repository</span>
            </button>
          </div>
        )}

        {form.successSubmissionId ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Bài đã được xếp hàng chấm</p>
              <p className="text-xs text-slate-500 mt-1">Đang chuyển sang màn hình theo dõi tiến trình chấm bài...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit} className="space-y-4">
            {form.assignment.submissionType === 'GROUP' ? (
              <div className="space-y-3">
                {!form.canSubmit && (
                  <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    Đề này chưa cho phép nộp bằng GitHub. Hãy liên hệ giảng viên.
                  </p>
                )}
                {form.loadingGroupTeam ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 p-5 text-xs text-slate-500">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Đang tải thông tin nhóm...
                  </div>
                ) : form.groupTeam ? (
                  <div className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-indigo-900">
                      <Users className="h-4 w-4" />
                      {form.groupTeam.name}
                    </div>
                    <p className="break-all text-slate-600">
                      GitHub: {form.groupTeam.gitRepoUrl || 'Chưa cập nhật'}
                    </p>
                    <p className="break-all text-slate-600">
                      Deploy: {form.groupTeam.deployedUrl || 'Chưa cập nhật'}
                    </p>
                    {(!form.groupTeam.gitRepoUrl || !form.groupTeam.deployedUrl) && (
                      <p className="font-medium text-amber-700">
                        Leader cần cập nhật đủ GitHub và URL deploy ở trang Nhóm trước khi nộp.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                    Bạn chưa thuộc nhóm nào trong môn học này.
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="group-git-commit" className="text-xs font-semibold text-slate-700">
                    Commit SHA muốn chấm (không bắt buộc)
                  </label>
                  <Input
                    id="group-git-commit"
                    placeholder="Để trống để hệ thống chụp HEAD hiện tại"
                    value={form.gitCommitHash}
                    onChange={(event) => form.setGitCommitHash(event.target.value)}
                    className="h-10 rounded-lg font-mono text-xs"
                    disabled={form.isSubmitting || form.loadingGroupTeam}
                  />
                  <p className="text-[11px] text-slate-500">
                    Khi xác nhận, hệ thống tạo snapshot bất biến của repo, deploy URL và danh sách thành viên.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {!form.canSubmit && (
                  <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    Đề này chưa cấu hình cách nộp bài. Hãy liên hệ giảng viên.
                  </p>
                )}
                <div className="space-y-1.5">
                  <label htmlFor="paper-code" className="text-xs font-semibold text-slate-700">
                    Mã đề thi (Paper Code)
                  </label>
                  <Input
                    id="paper-code"
                    placeholder="VD: DE01, PAPER_A (để trống nếu không có)"
                    value={form.paperCode}
                    onChange={(event) => form.setPaperCode(event.target.value)}
                    className="h-10 text-xs rounded-lg uppercase"
                    disabled={form.isSubmitting}
                  />
                </div>

                {form.channel === 'ZIP_UPLOAD' && (
                  <SubmitExamZipChannel
                    selectedFile={form.selectedFile}
                    onClearFile={() => form.setSelectedFile(null)}
                    fileInputRef={form.fileInputRef}
                    onFileChange={form.handleFileChange}
                    isDragging={form.isDragging}
                    onDragOver={form.handleDragOver}
                    onDragLeave={form.handleDragLeave}
                    onDrop={form.handleDrop}
                    disabled={form.isSubmitting}
                  />
                )}

                {form.channel === 'GIT_COMMIT' && (
                  <SubmitExamGitChannel
                    gitRepoUrl={form.gitRepoUrl}
                    setGitRepoUrl={form.setGitRepoUrl}
                    gitCommitHash={form.gitCommitHash}
                    setGitCommitHash={form.setGitCommitHash}
                    disabled={form.isSubmitting}
                  />
                )}
              </>
            )}

            {form.assignment.submissionType !== 'GROUP' && form.assignment.environment === 'REACT_JS' && (
              <div className="space-y-1.5">
                <label htmlFor="deployed-url" className="text-xs font-semibold text-slate-700">
                  URL deploy công khai <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="deployed-url"
                    type="url"
                    placeholder="https://your-app.vercel.app"
                    value={form.deployedUrl}
                    onChange={(event) => form.setDeployedUrl(event.target.value)}
                    className="h-10 rounded-lg pl-9 font-mono text-xs"
                    disabled={form.isSubmitting}
                    required
                  />
                </div>
              </div>
            )}

            {form.errorMessage && (
              <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-600">
                <AlertCircle size={15} className="shrink-0" />
                <span>{form.errorMessage}</span>
              </div>
            )}

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={form.handleReset}
                disabled={form.isSubmitting}
                className="h-10 text-xs rounded-lg"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={form.isSubmitDisabled}
                className="h-10 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {form.isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    <span>Đang gửi bài &amp; xếp hàng chấm...</span>
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    <span>{form.assignment.submissionType === 'GROUP' ? 'Nộp bài nhóm' : 'Xác nhận Nộp bài'}</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
