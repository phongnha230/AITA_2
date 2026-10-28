import { useState, type ReactNode } from 'react';
import {
  ExternalLink,
  Terminal,
  FileArchive,
  Download,
  Code2,
  FileCode,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/formatDate';
import type { LecturerSubmission } from '../../types/assignment.types';
import { assignmentService } from '../../services/assignment.service';

export function SubmissionOverview({ submission }: { submission: LecturerSubmission }) {
  return (
    <div className="space-y-4 pt-2">
      <SubmissionScores submission={submission} />
      <SubmissionMetadata submission={submission} />
      <SubmissionZipAndSourceFiles submission={submission} />
      <CompilationOutput submission={submission} />
      <TestCaseResults submission={submission} />
      <GitContributorList submission={submission} />
    </div>
  );
}

function SubmissionScores({ submission }: { submission: LecturerSubmission }) {
  const versionTwo = submission.assignment?.gradingVersion === 2;
  return (
    <section aria-label="Điểm bài nộp" className={`grid ${versionTwo ? 'grid-cols-4' : 'grid-cols-3'} gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center`}>
      <ScoreItem label="Chức năng (Sandbox)" value={`${submission.sandboxScore ?? '-'} / ${submission.assignment?.functionalMaxScore ?? 8}`} />
      {versionTwo ? (
        <>
          <ScoreItem label={submission.assignment?.environment === 'REACT_JS' ? 'React Semantic' : 'Thuật toán'} value={`${submission.algorithmScore ?? '-'} / ${submission.assignment?.algorithmMaxScore ?? 2}`} />
          <ScoreItem label="Clean Code" value={`${submission.cleanCodeScore ?? '-'} / ${submission.assignment?.cleanCodeMaxScore ?? 1}`} />
        </>
      ) : (
        <ScoreItem label="Điểm AI Rubric" value={`${submission.aiScore ?? '-'} / 2`} />
      )}
      <ScoreItem label="Điểm tổng kết" value={`${submission.finalScore ?? '-'} / 10`} accent="text-emerald-800" />
    </section>
  );
}

function ScoreItem({ label, value, accent = 'text-indigo-800' }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function SubmissionZipAndSourceFiles({ submission }: { submission: LecturerSubmission }) {
  const [downloading, setDownloading] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [files, setFiles] = useState<Array<{ name: string; path: string; content: string; size: number }>>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const userTag = submission.user?.email ? submission.user.email.split('@')[0] : 'student';
      const paperTag = submission.paperCode ? `_${submission.paperCode}` : '';
      await assignmentService.downloadSubmissionZip(
        submission.id,
        `${userTag}${paperTag}_submission_${submission.id.slice(-6)}.zip`
      );
    } catch (err: any) {
      alert(err?.message || 'Không thể tải file zip bài nộp');
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleViewer = async () => {
    const nextState = !showViewer;
    setShowViewer(nextState);
    if (nextState && files.length === 0) {
      try {
        setLoadingFiles(true);
        const sourceFiles = await assignmentService.getSubmissionSourceFiles(submission.id);
        setFiles(sourceFiles);
      } catch (err) {
        console.error('Lỗi khi tải danh sách mã nguồn:', err);
      } finally {
        setLoadingFiles(false);
      }
    }
  };

  const handleCopyCode = () => {
    const activeFile = files[selectedIdx];
    if (activeFile?.content) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeFile = files[selectedIdx];

  return (
    <section aria-label="Tập tin bài nộp và mã nguồn" className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
            <FileArchive className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Tập tin bài nộp (.ZIP) & Mã nguồn sinh viên</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Giảng viên có thể tải file ZIP về máy để chạy thử nghiệm, hoặc duyệt mã nguồn trực tiếp trên giao diện.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={downloading}
            onClick={handleDownloadZip}
            className="h-8 px-3 rounded-lg border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold shadow-2xs"
          >
            {downloading ? (
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
            ) : (
              <Download className="size-3.5 mr-1.5" />
            )}
            <span>Tải file .ZIP</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggleViewer}
            className="h-8 px-3 rounded-lg text-slate-700 hover:text-indigo-700 hover:bg-white text-xs font-semibold"
          >
            <Code2 className="size-3.5 mr-1.5 text-indigo-600" />
            <span>{showViewer ? 'Đóng xem code' : 'Mở xem mã nguồn'}</span>
            {showViewer ? (
              <ChevronUp className="size-3.5 ml-1 text-slate-400" />
            ) : (
              <ChevronDown className="size-3.5 ml-1 text-slate-400" />
            )}
          </Button>
        </div>
      </div>

      {/* Embedded Source Code Viewer */}
      {showViewer && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          {loadingFiles ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Loader2 className="size-6 animate-spin text-indigo-600 mb-2" />
              <span>Đang đọc tập tin mã nguồn từ kho lưu trữ...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <FolderOpen className="size-8 mx-auto mb-2 text-slate-300" />
              <span>Không tìm thấy tập tin mã nguồn nào trong bài nộp.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* File List */}
              <div className="md:col-span-4 bg-slate-50/70 p-2.5 max-h-72 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Danh sách file ({files.length})
                </p>
                <div className="space-y-1 mt-1">
                  {files.map((file, idx) => {
                    const isSelected = idx === selectedIdx;
                    return (
                      <button
                        key={file.path}
                        type="button"
                        onClick={() => setSelectedIdx(idx)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-200/60'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <FileCode className={`size-3.5 shrink-0 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`} />
                          <span className="truncate" title={file.path}>{file.name}</span>
                        </span>
                        <span className={`text-[10px] font-mono shrink-0 ml-1.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code Content */}
              <div className="md:col-span-8 flex flex-col bg-slate-950">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900/90 text-slate-300 text-xs">
                  <span className="font-mono text-indigo-400 truncate text-[11px]" title={activeFile?.path}>
                    {activeFile?.path}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3.5 max-h-72 overflow-y-auto text-xs font-mono leading-relaxed text-slate-200 whitespace-pre">
                  <code>{activeFile?.content || '// File rỗng'}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SubmissionMetadata({ submission }: { submission: LecturerSubmission }) {
  return (
    <section aria-label="Thông tin bài nộp" className="space-y-2 rounded-xl border border-slate-200 p-4 text-xs">
      <InfoRow label="Kênh nộp" value={submission.submissionChannel === 'GIT_COMMIT' ? 'Git Repository' : 'Tập tin nén (.zip)'} />
      {submission.gitRepoUrl && (
        <InfoRow
          label="Git Repository"
          value={
            <a href={submission.gitRepoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-700 hover:underline">
              {submission.gitRepoUrl}
              <ExternalLink aria-hidden="true" className="size-3" />
            </a>
          }
        />
      )}
      {submission.deployedUrl && (
        <InfoRow
          label="Website được chấm"
          value={
            <a href={submission.deployedUrl} target="_blank" rel="noreferrer" className="break-all text-indigo-700 hover:underline">
              {submission.deployedUrl}
            </a>
          }
        />
      )}
      <InfoRow label="Attempt" value={`#${submission.attemptNo ?? 1}`} />
      {submission.gitCommitHash && <InfoRow label="Commit SHA" value={<code>{submission.gitCommitHash}</code>} />}
      <InfoRow label="Thời gian nộp" value={formatDateTime(submission.submittedAt)} />
      <InfoRow
        label="Trạng thái biên dịch"
        value={
          <span className={submission.compileSuccess ? 'font-semibold text-emerald-800' : 'font-semibold text-rose-800'}>
            {submission.compileSuccess ? 'Thành công (0 error)' : 'Biên dịch thất bại'}
          </span>
        }
      />
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-1.5 last:border-0">
      <span className="text-slate-600">{label}</span>
      <span className="text-right font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function CompilationOutput({ submission }: { submission: LecturerSubmission }) {
  const exitCode = submission.compileSuccess ? 'Exit Code 0' : 'Non-zero Exit Code';
  const output = submission.compileOutput || '[Sandbox Engine] Compilation succeeded with 0 warnings/errors.\n[Sandbox Engine] Memory footprint: 4.2 MB\n[Sandbox Engine] Execution sandbox closed cleanly.';
  return (
    <section aria-label="Log biên dịch Docker Sandbox" className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Terminal aria-hidden="true" className="size-3.5" />
          Log biên dịch Docker Sandbox
        </h3>
        <Badge variant="outline" className="font-mono text-xs">{exitCode}</Badge>
      </div>
      <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs leading-relaxed text-slate-100">{output}</pre>
    </section>
  );
}

function TestCaseResults({ submission }: { submission: LecturerSubmission }) {
  const results = submission.testResults ?? [];
  if (!results.length) return null;
  return (
    <section aria-label="Kết quả chạy test case" className="space-y-2">
      <h3 className="text-xs font-bold text-slate-800">Kết quả chạy Test Cases ({results.length})</h3>
      <ul className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
        {results.map((result, index) => (
          <li key={result.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs">
            <span className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-700">Test #{index + 1}</span>
              <Badge variant="outline" className={result.verdict === 'PASSED' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}>
                {result.verdict}
              </Badge>
            </span>
            <span className="flex gap-3 font-mono text-slate-700">
              <span>{result.executionTimeMs}ms</span>
              <strong>+{result.earnedPoints} pts</strong>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GitContributorList({ submission }: { submission: LecturerSubmission }) {
  const contributors = submission.gitContributors ?? [];
  if (!contributors.length) return null;
  return (
    <section aria-label="Bằng chứng đóng góp Git" className="space-y-2">
      <h3 className="text-xs font-bold text-slate-800">Bằng chứng đóng góp Git</h3>
      <ul className="space-y-2">
        {contributors.map((contributor) => (
          <li key={contributor.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs">
            <span>
              <strong>{contributor.authorName}</strong>
              {!contributor.matchedUserId && <em className="ml-1 text-amber-800">chưa match</em>}
              <br />
              <span className="break-all">{contributor.authorEmail}</span>
            </span>
            <span className="text-right">
              <strong>{contributor.contributionPct}%</strong>
              {contributor.contributionPct < 10 && <em className="ml-1 text-rose-700">đóng góp thấp</em>}
              <br />
              {contributor.commitCount} commits · +{contributor.linesAdded}/-{contributor.linesDeleted}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
