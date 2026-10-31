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

type SubmitExamFormState = ReturnType<typeof useSubmitExamForm> & { assignment: NonNullable<ReturnType<typeof useSubmitExamForm>['assignment']> };

function GroupSubmissionFields({ form }: { form: SubmitExamFormState }) {
  const team = form.groupTeam;
  return <div className="space-y-3">
    {!form.canSubmit && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Đề này chưa cho phép nộp bằng GitHub. Hãy liên hệ giảng viên.</p>}
    {form.loadingGroupTeam ? <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 p-5 text-xs text-slate-500"><LoaderCircle className="size-4 animate-spin" />Đang tải thông tin nhóm...</div> : team ? <div className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs"><div className="flex items-center gap-2 font-semibold text-indigo-900"><Users className="size-4" />{team.name}</div><p className="break-all text-slate-600">GitHub: {team.gitRepoUrl || 'Chưa cập nhật'}</p><p className="break-all text-slate-600">Deploy: {team.deployedUrl || 'Chưa cập nhật'}</p>{(!team.gitRepoUrl || !team.deployedUrl) && <p className="font-medium text-amber-700">Leader cần cập nhật đủ GitHub và URL deploy ở trang Nhóm trước khi nộp.</p>}</div> : <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">Bạn chưa thuộc nhóm nào trong môn học này.</div>}
    <div className="space-y-1.5"><label htmlFor="group-git-commit" className="text-xs font-semibold text-slate-700">Commit SHA muốn chấm (không bắt buộc)</label><Input id="group-git-commit" placeholder="Để trống để hệ thống chụp HEAD hiện tại" value={form.gitCommitHash} onChange={(event) => form.setGitCommitHash(event.target.value)} className="h-10 rounded-lg font-mono text-xs" disabled={form.isSubmitting || form.loadingGroupTeam} /><p className="text-xs text-slate-500">Khi xác nhận, hệ thống tạo snapshot bất biến của repo, deploy URL và danh sách thành viên.</p></div>
  </div>;
}

function IndividualSubmissionFields({ form }: { form: SubmitExamFormState }) {
  return <div className="space-y-4">
    {!form.canSubmit && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Đề này chưa cấu hình cách nộp bài. Hãy liên hệ giảng viên.</p>}
    <div className="space-y-1.5"><label htmlFor="paper-code" className="text-xs font-semibold text-slate-700">Mã đề thi (Paper Code)</label><Input id="paper-code" placeholder="VD: DE01, PAPER_A (để trống nếu không có)" value={form.paperCode} onChange={(event) => form.setPaperCode(event.target.value)} className="h-10 rounded-lg text-xs uppercase" disabled={form.isSubmitting} /></div>
    {form.channel === 'ZIP_UPLOAD' && <SubmitExamZipChannel selectedFile={form.selectedFile} onClearFile={() => form.setSelectedFile(null)} fileInputRef={form.fileInputRef} onFileChange={form.handleFileChange} isDragging={form.isDragging} onDragOver={form.handleDragOver} onDragLeave={form.handleDragLeave} onDrop={form.handleDrop} disabled={form.isSubmitting} />}
    {form.channel === 'GIT_COMMIT' && <SubmitExamGitChannel gitRepoUrl={form.gitRepoUrl} setGitRepoUrl={form.setGitRepoUrl} gitCommitHash={form.gitCommitHash} setGitCommitHash={form.setGitCommitHash} disabled={form.isSubmitting} />}
  </div>;
}

function SubmissionMethodFields({ form }: { form: SubmitExamFormState }) {
  return form.assignment.submissionType === 'GROUP' ? <GroupSubmissionFields form={form} /> : <IndividualSubmissionFields form={form} />;
}

function DeploymentUrlField({ form }: { form: SubmitExamFormState }) {
  if (form.assignment.submissionType === 'GROUP' || form.assignment.environment !== 'REACT_JS') return null;
  return <div className="space-y-1.5"><label htmlFor="deployed-url" className="text-xs font-semibold text-slate-700">URL deploy công khai <span className="text-rose-500">*</span></label><div className="relative"><Globe className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" /><Input id="deployed-url" type="url" placeholder="https://your-app.vercel.app" value={form.deployedUrl} onChange={(event) => form.setDeployedUrl(event.target.value)} className="h-10 rounded-lg pl-9 font-mono text-xs" disabled={form.isSubmitting} required /></div></div>;
}

function SubmissionError({ message }: { message: string | null }) {
  return message && <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-600"><AlertCircle size={15} className="shrink-0" /><span>{message}</span></div>;
}

function SubmitFooter({ form }: { form: SubmitExamFormState }) {
  return <DialogFooter className="gap-2 pt-2 sm:gap-0"><Button type="button" variant="outline" onClick={form.handleReset} disabled={form.isSubmitting} className="h-10 rounded-lg text-xs">Hủy bỏ</Button><Button type="submit" disabled={form.isSubmitDisabled} className="h-10 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700">{form.isSubmitting ? <><LoaderCircle className="mr-1.5 size-3.5 animate-spin" /><span>Đang nộp bài...</span></> : <><Send className="mr-1.5 size-3.5" /><span>{form.assignment.submissionType === 'GROUP' ? 'Nộp bài nhóm' : 'Xác nhận Nộp bài'}</span></>}</Button></DialogFooter>;
}

function SubmissionForm({ form }: { form: SubmitExamFormState }) {
  return <form onSubmit={form.handleSubmit} className="space-y-4"><SubmissionMethodFields form={form} /><DeploymentUrlField form={form} /><SubmissionError message={form.errorMessage} /><SubmitFooter form={form} /></form>;
}

function SubmissionChannelSwitcher({ form }: { form: SubmitExamFormState }) {
  if (form.assignment.submissionType === 'GROUP' || !form.allowZip || !form.allowGit) return null;
  const setChannel = (channel: 'ZIP_UPLOAD' | 'GIT_COMMIT') => { form.setChannel(channel); form.setErrorMessage(null); };
  return <div className="flex rounded-xl bg-slate-100 p-2 text-xs">
    <button type="button" onClick={() => setChannel('ZIP_UPLOAD')} className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg font-semibold transition-all ${form.channel === 'ZIP_UPLOAD' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}><FileArchive size={14} /><span>Tệp nén .ZIP</span></button>
    <button type="button" onClick={() => setChannel('GIT_COMMIT')} className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg font-semibold transition-all ${form.channel === 'GIT_COMMIT' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}><GitBranch size={14} /><span>GitHub Repository</span></button>
  </div>;
}

function SubmissionContent({ form }: { form: SubmitExamFormState }) {
  return <div className="space-y-4"><SubmissionChannelSwitcher form={form} />{form.successSubmissionId ? <div className="space-y-3 py-6 text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 size={28} /></div><div><p className="text-base font-bold text-slate-900">Nộp bài thành công</p><p className="mt-1 text-xs text-slate-500">Bài làm của bạn đã được ghi nhận vào hệ thống.</p></div></div> : <SubmissionForm form={form} />}</div>;
}

interface SubmitExamModalProps {
  exam: StudentExamViewModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitExamModal({ exam, isOpen, onClose }: SubmitExamModalProps) {
  const form = useSubmitExamForm(exam, onClose);

  if (!exam || !form.assignment) return null;
  const activeForm: SubmitExamFormState = { ...form, assignment: form.assignment };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && form.handleReset()}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl shadow-xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
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
          <div className="flex flex-wrap items-center gap-2 text-slate-500 text-xs">
            <span>Môi trường: <strong className="text-slate-700 font-mono">{form.assignment.environment}</strong></span>
            <span>•</span>
            <span>Hình thức: <strong className="text-slate-700">{form.assignment.submissionType === 'GROUP' ? 'Nhóm' : 'Cá nhân'}</strong></span>
          </div>
        </div>

        <SubmissionContent form={activeForm} />
      </DialogContent>
    </Dialog>
  );
}
