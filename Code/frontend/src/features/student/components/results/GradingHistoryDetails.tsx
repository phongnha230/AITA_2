'use client';

import type { GradingRun, GradingRunStage } from '@/features/grading/types/grading-history.types';
import Image from 'next/image';

interface GradingHistoryDetailsProps {
  runs: GradingRun[];
  onShowEvidence: (runId: string, evidenceId: string) => void;
  evidenceUrl: string | null;
}

const stageTitles: Record<string, string> = {
  TESTCASES: 'Chạy testcase',
  WEB_TESTCASES: 'Kiểm thử website',
  ANSWER_COMPARISON: 'Đối chiếu đáp án giảng viên',
  ALGORITHM: 'Đánh giá thuật toán',
  CLEAN_CODE: 'Đánh giá clean code',
  SOURCE_REVIEW: 'Nguồn GitHub và website triển khai',
};

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};

const formatScore = (value: unknown): string | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const score = Number(value);
  return Number.isFinite(score) ? score.toFixed(1) : null;
};

function TestcaseResults({ stage }: { stage: GradingRunStage }) {
  const details = stage.detailsJson ?? {};
  const results = Array.isArray(details.results) ? details.results.map(asRecord) : [];
  const passedCount = results.filter((result) => result.passed === true || result.status === 'PASSED').length;

  if (results.length === 0) {
    return <p className="mt-2 text-sm text-slate-600">{stage.errorMessage || 'Chưa lưu được chi tiết testcase cho lượt chấm này.'}</p>;
  }

  return <div className="mt-3 space-y-2">
    <p className="text-sm text-slate-600">Đạt {passedCount}/{results.length} testcase. Testcase ẩn chỉ hiện trạng thái, không hiển thị dữ liệu kiểm thử.</p>
    {results.map((result, index) => {
      const isHidden = result.isHidden === true;
      const label = isHidden ? `Testcase ẩn #${index + 1}` : String(result.label ?? result.questionNo ?? `Testcase #${index + 1}`);
      const verdict = String(result.status ?? (result.passed === true ? 'PASSED' : 'FAILED'));
      const passed = result.passed === true || verdict === 'PASSED';
      const earned = formatScore(result.earnedPoints);
      const maximum = formatScore(result.maxPoints);
      const expected = typeof result.expectedOutput === 'string' ? result.expectedOutput : null;
      const actual = typeof result.actualOutput === 'string' ? result.actualOutput : null;
      const errorMessage = typeof result.errorMessage === 'string' ? result.errorMessage : null;

      return <details key={`${stage.id}-${index}`} className="rounded-xl border border-slate-200 bg-white p-3">
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-slate-800">{label}</span>
          <span className="flex items-center gap-3 text-xs">
            <span className={passed ? 'font-bold text-emerald-700' : 'font-bold text-rose-700'}>{verdict}</span>
            {earned !== null && <span className="font-semibold text-slate-700">{earned}{maximum ? ` / ${maximum}` : ''} điểm</span>}
          </span>
        </summary>
        {!isHidden && <div className="mt-3 space-y-2 text-sm">
          {errorMessage && <p className="rounded-lg bg-rose-50 p-2 text-rose-800">Lỗi: {errorMessage}</p>}
          {expected !== null && <div><p className="text-xs font-semibold text-slate-500">Kết quả mong đợi</p><pre className="mt-1 overflow-auto rounded-lg bg-slate-50 p-2 font-mono text-xs text-slate-800">{expected || '(rỗng)'}</pre></div>}
          {actual !== null && <div><p className="text-xs font-semibold text-slate-500">Kết quả bài làm</p><pre className="mt-1 overflow-auto rounded-lg bg-slate-50 p-2 font-mono text-xs text-slate-800">{actual || '(rỗng)'}</pre></div>}
          {expected === null && actual === null && !errorMessage && <p className="text-slate-600">Lượt chấm cũ không lưu output chi tiết.</p>}
        </div>}
      </details>;
    })}
  </div>;
}

function RubricBreakdown({ value }: { value: unknown }) {
  const items = Array.isArray(value) ? value.map(asRecord) : [];
  if (items.length === 0) return null;
  return <div className="mt-3 space-y-2">
    {items.map((item) => <div key={String(item.id ?? item.rubricId ?? item.criterionId ?? item.title ?? item.criterionName ?? JSON.stringify(item))} className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong className="text-sm text-slate-800">{String(item.title ?? item.criterionName ?? 'Tiêu chí rubric')}</strong>
        <span className="text-sm font-bold text-indigo-700">{formatScore(item.earnedPoints) ?? '—'} / {formatScore(item.maxPoints) ?? '—'}</span>
      </div>
      {typeof item.feedback === 'string' && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{item.feedback}</p>}
    </div>)}
  </div>;
}

function AlgorithmStageDetails({ details, feedback }: { details: Record<string, unknown>; feedback: string | null }) {
  const hasComplexity = typeof details.detectedTimeComplexity === 'string' || typeof details.detectedSpaceComplexity === 'string';
  const hasRubrics = Array.isArray(details.rubricBreakdown) && details.rubricBreakdown.length > 0;
  return <div className="mt-3 space-y-2">
    {hasComplexity && <p className="text-sm text-slate-700">Độ phức tạp hệ thống nhận định: thời gian <code>{String(details.detectedTimeComplexity ?? 'chưa xác định')}</code>, bộ nhớ <code>{String(details.detectedSpaceComplexity ?? 'chưa xác định')}</code>.</p>}
    <RubricBreakdown value={details.rubricBreakdown} />
    {!hasRubrics && feedback && <p className="whitespace-pre-wrap text-sm text-slate-700">{feedback}</p>}
  </div>;
}

function StageFeedback({ stage, details, feedback }: { stage: GradingRunStage; details: Record<string, unknown>; feedback: string | null }) {
  switch (stage.stageKey) {
    case 'TESTCASES':
    case 'WEB_TESTCASES':
      return <TestcaseResults stage={stage} />;
    case 'ANSWER_COMPARISON':
      return feedback && <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-950"><p className="font-semibold">Nhận xét khi đối chiếu đáp án</p><p className="mt-1 whitespace-pre-wrap">{feedback}</p><p className="mt-2 text-xs text-blue-800">Đây là nhận xét tham khảo về cách tiếp cận; bài làm hợp lệ không cần viết giống đáp án mẫu.</p></div>;
    case 'ALGORITHM':
      return <AlgorithmStageDetails details={details} feedback={feedback} />;
    case 'CLEAN_CODE':
      return <div className="mt-3">{feedback && <p className="whitespace-pre-wrap text-sm text-slate-700">{feedback}</p>}<RubricBreakdown value={details.rubricBreakdown} /></div>;
    case 'SOURCE_REVIEW':
      return <div className="mt-3 space-y-1 text-sm text-slate-700">
        {typeof details.repositoryUrl === 'string' && <p>GitHub: <a className="font-medium text-indigo-700 underline" href={details.repositoryUrl} target="_blank" rel="noreferrer">{details.repositoryUrl}</a></p>}
        {typeof details.commitHash === 'string' && <p>Commit được chấm: <code>{details.commitHash}</code></p>}
        {typeof details.deployedUrl === 'string' && <p>URL deploy: <a className="font-medium text-indigo-700 underline" href={details.deployedUrl} target="_blank" rel="noreferrer">{details.deployedUrl}</a></p>}
        {feedback && <p className="pt-1 text-slate-600">{feedback}</p>}
      </div>;
    default:
      return null;
  }
}

function StageDetails({ stage, runId, onShowEvidence }: {
  stage: GradingRunStage;
  runId: string;
  onShowEvidence: (runId: string, evidenceId: string) => void;
}) {
  const details = stage.detailsJson ?? {};
  const title = stageTitles[stage.stageKey] ?? stage.stageKey;
  const score = formatScore(stage.score);
  const maxScore = formatScore(stage.maxScore);
  const feedback = typeof details.feedback === 'string' ? details.feedback : null;

  return <section className="rounded-xl border border-slate-200 p-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h4 className="font-bold text-slate-900">{title}</h4>
        <p className="mt-0.5 text-xs text-slate-500">{stage.status === 'COMPLETED' ? 'Đã hoàn tất' : stage.status}</p>
      </div>
      {score !== null && <p className="text-sm font-bold text-indigo-700">{score}{maxScore ? ` / ${maxScore}` : ''} điểm</p>}
    </div>

    {stage.errorMessage && <p className="mt-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">Chưa chấm được bước này: {stage.errorMessage}</p>}
    <StageFeedback stage={stage} details={details} feedback={feedback} />

    {stage.evidence?.length ? <div className="mt-3 flex flex-wrap gap-2">{stage.evidence.map((evidence, index) => <button key={evidence.id} type="button" onClick={() => onShowEvidence(runId, evidence.id)} className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50">Ảnh testcase {index + 1}</button>)}</div> : null}
  </section>;
}

function GradingRunCard({ run, onShowEvidence }: {
  run: GradingRun;
  onShowEvidence: GradingHistoryDetailsProps['onShowEvidence'];
}) {
  const summary = run.summaryJson ?? {};
  const publishedScore = formatScore(summary.publishedFinalScore);
  const pending = run.status !== 'PUBLISHED';
  const failed = run.status === 'FAILED';
  const statusLabel = run.status === 'PUBLISHED'
    ? 'Đã công bố'
    : run.status === 'REVIEW_PENDING'
      ? 'Đang chờ giảng viên duyệt'
      : run.status;

  return <article className="rounded-xl border border-slate-200 p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-semibold text-slate-900">Lượt chấm #{run.runNo}</h3>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{statusLabel}</span>
    </div>
    {pending ? <div className={`mt-3 rounded-lg p-3 text-sm ${failed ? 'bg-rose-50 text-rose-900' : 'bg-amber-50 text-amber-900'}`}>
      {failed ? <><p className="font-semibold">Lượt này không thể chấm hoàn tất; hệ thống không tính 0 điểm.</p><ul className="mt-2 list-disc space-y-1 pl-5">{run.stages.filter((stage) => stage.errorMessage).map((stage) => <li key={stage.id}>{stageTitles[stage.stageKey] ?? stage.stageKey}: {stage.errorMessage}</li>)}</ul></> : 'Lượt chấm đang chạy hoặc điểm chưa được giảng viên duyệt. Chi tiết nội bộ và điểm đề xuất chưa được công bố.'}
    </div> : <>
      <div className="mt-3 rounded-xl bg-indigo-50 p-4">
        <p className="text-sm text-indigo-900">Điểm tổng kết đã công bố</p>
        <p className="mt-1 text-3xl font-black tabular-nums text-indigo-950">{publishedScore ?? '—'}<span className="ml-1 text-sm font-semibold">/ 10</span></p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-indigo-950 sm:grid-cols-4">
          {([['Testcase', summary.sandboxScore], ['Rubric', summary.aiScore], ['Thuật toán', summary.algorithmScore], ['Clean code', summary.cleanCodeScore]] as const).map(([label, value]) => <p key={label}>{label}: <strong>{formatScore(value) ?? '—'}</strong></p>)}
        </div>
      </div>
      {run.stages.map((stage) => <div key={stage.id} className="mt-3"><StageDetails stage={stage} runId={run.id} onShowEvidence={onShowEvidence} /></div>)}
      {run.reviewNote && <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950"><strong>Ghi chú của giảng viên:</strong> {run.reviewNote}</p>}
    </>}
  </article>;
}

export function GradingHistoryDetails({ runs, onShowEvidence, evidenceUrl }: GradingHistoryDetailsProps) {
  if (runs.length === 0) return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated-sm">
    <h2 className="text-base font-bold text-slate-900">Giải thích kết quả chấm</h2>
    <p className="mt-2 text-sm text-slate-600">Chưa có lượt chấm được công bố. Khi có kết quả, tại đây sẽ hiển thị điểm từng bước, testcase được phép xem và nhận xét của giảng viên.</p>
  </section>;

  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated-sm">
    <div>
      <h2 className="text-base font-bold text-slate-900">Giải thích kết quả chấm</h2>
      <p className="mt-1 text-sm text-slate-500">Mỗi lượt chấm giữ bằng chứng và nhận xét theo đúng phiên bản đề đã sử dụng.</p>
    </div>
    {runs.map((run) => <GradingRunCard key={run.id} run={run} onShowEvidence={onShowEvidence} />)}
    {evidenceUrl && <div className="bg-slate-50 p-3"><Image src={evidenceUrl} alt="Ảnh chụp bằng chứng chạy testcase" width={960} height={640} unoptimized className="max-h-[70vh] w-auto rounded-lg" /></div>}
  </section>;
}
