'use client';

import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  FileArchive,
  GitBranch,
  GitCommit,
  Globe,
  HardDriveUpload,
  Info,
  LoaderCircle,
  Paperclip,
  Send,
  X,
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
import { studentService, getStudentServiceErrorMessage } from '../../services/student.service';
import type { StudentExamViewModel } from '../../types/student.types';

interface SubmitExamModalProps {
  exam: StudentExamViewModel | null;
  isOpen: boolean;
  onClose: () => void;
}

type SubmissionChannel = 'ZIP_UPLOAD' | 'GIT_COMMIT';

export function SubmitExamModal({ exam, isOpen, onClose }: SubmitExamModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [channel, setChannel] = useState<SubmissionChannel>('ZIP_UPLOAD');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [gitRepoUrl, setGitRepoUrl] = useState('');
  const [gitCommitHash, setGitCommitHash] = useState('');
  const [paperCode, setPaperCode] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSubmissionId, setSuccessSubmissionId] = useState<string | null>(null);

  const assignment = exam?.assignment;
  const course = exam?.course;

  const allowZip = assignment ? assignment.allowZipSubmission !== false : true;
  const allowGit = assignment ? Boolean(assignment.allowGitSubmission) : true;

  // Sync default channel with assignment requirements
  useEffect(() => {
    if (!allowZip && allowGit) {
      setChannel('GIT_COMMIT');
    } else {
      setChannel('ZIP_UPLOAD');
    }
  }, [allowZip, allowGit]);

  if (!exam || !assignment) return null;

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMessage('Hệ thống yêu cầu nộp file nén định dạng .zip');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('Dung lượng file .zip vượt quá giới hạn 50MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (channel === 'ZIP_UPLOAD') {
      if (!selectedFile) {
        setErrorMessage('Vui lòng chọn file nén mã nguồn .zip trước khi nộp.');
        return;
      }
    } else {
      if (!gitRepoUrl.trim()) {
        setErrorMessage('Vui lòng nhập đường dẫn GitHub Repository.');
        return;
      }
      if (!gitRepoUrl.startsWith('http://') && !gitRepoUrl.startsWith('https://')) {
        setErrorMessage('Đường dẫn GitHub phải bắt đầu bằng https://');
        return;
      }
      if (gitCommitHash.trim() && gitCommitHash.trim().length < 7) {
        setErrorMessage('Mã Commit Hash phải có độ dài tối thiểu 7 ký tự.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('assignmentId', assignment.id);
      formData.append('submissionChannel', channel);

      if (paperCode.trim()) {
        formData.append('paperCode', paperCode.trim());
      }

      if (channel === 'ZIP_UPLOAD' && selectedFile) {
        formData.append('file', selectedFile);
      } else if (channel === 'GIT_COMMIT') {
        formData.append('gitRepoUrl', gitRepoUrl.trim());
        if (gitCommitHash.trim()) {
          formData.append('gitCommitHash', gitCommitHash.trim());
        }
      }

      const result = await studentService.submitAssignment(formData);
      setSuccessSubmissionId(result.id);

      // Chuyển hướng tới trang theo dõi tiến trình chấm bài sau 1 giây
      setTimeout(() => {
        handleReset();
        router.push(`/student/results?submissionId=${encodeURIComponent(result.id)}`);
      }, 1200);
    } catch (err) {
      setErrorMessage(getStudentServiceErrorMessage(err, 'Nộp bài thất bại. Vui lòng kiểm tra lại.'));
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setGitRepoUrl('');
    setGitCommitHash('');
    setPaperCode('');
    setErrorMessage(null);
    setSuccessSubmissionId(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReset()}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl shadow-xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <HardDriveUpload size={18} />
            </span>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Nộp bài thi thực hành PE
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            {course ? `${course.code} • ${course.name}` : 'Môn học khảo thí'}
          </DialogDescription>
        </DialogHeader>

        {/* Thông tin bài thi */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs space-y-1">
          <p className="font-semibold text-slate-800 truncate">{assignment.title}</p>
          <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[11px]">
            <span>Môi trường: <strong className="text-slate-700 font-mono">{assignment.environment}</strong></span>
            <span>•</span>
            <span>Hình thức: <strong className="text-slate-700">{assignment.submissionType === 'GROUP' ? 'Nhóm' : 'Cá nhân'}</strong></span>
          </div>
        </div>

        {/* Channel Switcher (Tab lựa chọn kênh nộp nếu đề cho phép cả hai) */}
        {allowZip && allowGit && (
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setChannel('ZIP_UPLOAD');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                channel === 'ZIP_UPLOAD'
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
                setChannel('GIT_COMMIT');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                channel === 'GIT_COMMIT'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitBranch size={14} />
              <span>GitHub Repository</span>
            </button>
          </div>
        )}

        {successSubmissionId ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Nộp bài thành công!</p>
              <p className="text-xs text-slate-500 mt-1">Đang chuyển sang màn hình theo dõi máy chủ Sandbox chấm bài...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mã đề thi */}
            <div className="space-y-1.5">
              <label htmlFor="paper-code" className="text-xs font-semibold text-slate-700">
                Mã đề thi (Paper Code)
              </label>
              <Input
                id="paper-code"
                placeholder="VD: DE01, PAPER_A (để trống nếu không có)"
                value={paperCode}
                onChange={(e) => setPaperCode(e.target.value)}
                className="h-10 text-xs rounded-lg uppercase"
                disabled={isSubmitting}
              />
            </div>

            {/* Form trường hợp nộp File ZIP */}
            {channel === 'ZIP_UPLOAD' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Tệp mã nguồn (.zip) <span className="text-rose-500">*</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,application/zip"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />

                {selectedFile ? (
                  <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/50 p-3">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileArchive size={20} className="text-indigo-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      disabled={isSubmitting}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-50/50'
                        : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/70'
                    }`}
                  >
                    <Paperclip className="h-6 w-6 text-slate-400 mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      Kéo &amp; thả file .zip bài làm vào đây
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      hoặc bấm để duyệt file từ máy tính (Tối đa 50MB)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Form trường hợp nộp GitHub Repository */}
            {channel === 'GIT_COMMIT' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="git-repo-url" className="text-xs font-semibold text-slate-700">
                    Đường dẫn GitHub Repository <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="git-repo-url"
                      placeholder="https://github.com/username/project-repo"
                      value={gitRepoUrl}
                      onChange={(e) => setGitRepoUrl(e.target.value)}
                      className="h-10 text-xs rounded-lg pl-9 font-mono"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="git-commit-hash" className="text-xs font-semibold text-slate-700">
                    Commit Hash (Tùy chọn)
                  </label>
                  <div className="relative">
                    <GitCommit className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="git-commit-hash"
                      placeholder="VD: 7f8a9b2 (Để trống để lấy commit mới nhất)"
                      value={gitCommitHash}
                      onChange={(e) => setGitCommitHash(e.target.value)}
                      className="h-10 text-xs rounded-lg pl-9 font-mono uppercase"
                      disabled={isSubmitting}
                      maxLength={40}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                  <Info size={14} className="shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Đảm bảo Repository đang ở chế độ <strong>Public</strong> để Sandbox có thể clone mã nguồn và chấm tự động.
                  </span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-600">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
                className="h-10 text-xs rounded-lg"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (channel === 'ZIP_UPLOAD' ? !selectedFile : !gitRepoUrl.trim())}
                className="h-10 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    <span>Đang gửi bài &amp; xếp hàng chấm...</span>
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    <span>Xác nhận Nộp bài</span>
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
