import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  RefreshCw,
  Save,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Sparkles,
} from 'lucide-react';
import { AssignmentEnv, Course, DryRunExecutionSummary, TestCase } from '../../types/assignment.types';

interface WizardStep4ReviewProps {
  selectedCourse?: Course;
  environment: AssignmentEnv;
  solutionFiles?: Array<{ path: string }>;
  testCases: TestCase[];
  totalPoints: number;
  durationMinutes: number;
  title: string;
  description: string;
  gradingApprovalMode: 'LECTURER_REVIEW' | 'AUTO_PUBLISH';
  onGradingApprovalModeChange: (mode: 'LECTURER_REVIEW' | 'AUTO_PUBLISH') => void;
  dryRunRunning: boolean;
  dryRunResult: DryRunExecutionSummary | null;
  dryRunError: string | null;
  onDryRun: () => void | Promise<void>;
  isSubmitting: boolean;
  onSaveToDatabase: () => void;
  onBack: () => void;
  previewDeploymentUrl?: string;
  onPreviewDeploymentUrlChange?: (url: string) => void;
  referenceRepositoryUrl?: string;
  onReferenceRepositoryUrlChange?: (url: string) => void;
}

function DryRunModeDetails({
  isReact,
  testCases,
  totalPoints,
  dryRunRunning,
  onDryRun,
  solutionFiles,
  environment,
  previewDeploymentUrl,
  onPreviewDeploymentUrlChange,
  referenceRepositoryUrl,
  onReferenceRepositoryUrlChange,
}: Pick<WizardStep4ReviewProps, 'testCases' | 'totalPoints' | 'dryRunRunning' | 'onDryRun' | 'solutionFiles' | 'environment' | 'previewDeploymentUrl' | 'onPreviewDeploymentUrlChange' | 'referenceRepositoryUrl' | 'onReferenceRepositoryUrlChange'> & { isReact: boolean }) {
  if (isReact) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-4 text-xs text-indigo-900">
          <div className="flex items-center gap-2 font-bold text-indigo-800">
            <Sparkles className="size-4 shrink-0 text-indigo-600" />
            <span>Chạy thử kịch bản Playwright thật trên URL Preview</span>
          </div>
          <p className="mt-1 leading-5 text-indigo-700">
            Hệ thống sẽ khởi chạy Chromium trong Docker sandbox để thực thi tuần tự {testCases.length} luồng kiểm thử giao diện (tổng {totalPoints.toFixed(1)}đ) trên URL deploy mẫu của giảng viên.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="preview-deployment-url" className="block text-xs font-bold text-slate-700">
              URL Deploy mẫu (Vercel / Netlify / Render) <span className="text-rose-500">*</span>
            </label>
            <input
              id="preview-deployment-url"
              type="url"
              value={previewDeploymentUrl || ''}
              onChange={(e) => onPreviewDeploymentUrlChange?.(e.target.value)}
              placeholder="https://my-shopping-cart-sample.vercel.app"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500">
              Dùng để chạy thử 7.0 điểm kịch bản giao diện Playwright trong Docker.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reference-repository-url" className="block text-xs font-bold text-slate-700">
              Link GitHub Repository mẫu (Reference Solution)
            </label>
            <input
              id="reference-repository-url"
              type="url"
              value={referenceRepositoryUrl || ''}
              onChange={(e) => onReferenceRepositoryUrlChange?.(e.target.value)}
              placeholder="https://github.com/lecturer/fer201-shopping-cart"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500">
              Lưu vào đề thi làm đáp án chuẩn để AI đối chiếu cấu trúc và clean code.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onDryRun}
            disabled={dryRunRunning || !previewDeploymentUrl?.trim() || testCases.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-500/20 transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <Play className={`size-3.5 ${dryRunRunning ? 'animate-spin' : ''}`} />
            <span>{dryRunRunning ? 'Playwright đang chạy trong Docker...' : 'Chạy thử kịch bản Playwright (7.0đ)'}</span>
          </button>
          {!previewDeploymentUrl?.trim() && (
            <span className="text-[11px] text-amber-600 font-medium">
              * Nhập URL Deploy mẫu ở trên để bật nút chạy thử.
            </span>
          )}
        </div>

        {dryRunRunning && (
          <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-2.5 text-[11px] text-indigo-900 animate-pulse">
            <span>⏳ Playwright đang khởi tạo Chromium trong Docker, tải trang web và thực thi các thao tác UI. Quá trình có thể mất 15–30 giây...</span>
          </div>
        )}
      </div>
    );
  }

  const isJavaMissingMain = environment === 'JAVA_JDK'
    && (solutionFiles?.length ?? 0) > 0
    && !solutionFiles?.some((f) => f.path.endsWith('Main.class') || f.path.endsWith('Main.java'));

  const hasJavaClassFiles = environment === 'JAVA_JDK'
    && (solutionFiles?.length ?? 0) > 0
    && solutionFiles?.some((f) => f.path.endsWith('.class'));

  return <>
    <p className="text-xs text-slate-500">Chạy mã giải tham chiếu trong Docker sandbox trên toàn bộ {testCases.length} testcase. Kết quả phản ánh lần chạy thực tế; Docker chưa sẵn sàng thì hệ thống sẽ báo lỗi và không chạy trên máy chủ.</p>
    {isJavaMissingMain && (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-bold text-amber-800">
          <AlertTriangle className="size-4 shrink-0 text-amber-600" />
          <span>Bản lưu nháp chưa có bytecode Main.class</span>
        </div>
        <p>
          Danh sách file đáp án đang nạp từ bản nháp cũ của trình duyệt chưa có file bytecode <code>Main.class</code>. Vui lòng bấm <strong>&quot;Quay lại Bước 3&quot;</strong> và tải lại file <strong>submission_10of10.zip</strong> để cập nhật đầy đủ 26 file mã nguồn và bytecode.
        </p>
      </div>
    )}
    {!isJavaMissingMain && hasJavaClassFiles && (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[11px] font-semibold text-emerald-800">
        <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
        <span>Đã nạp đầy đủ {solutionFiles?.length} file đáp án (bao gồm Main.class và các bytecode interfaces)</span>
      </div>
    )}
    <button type="button" onClick={onDryRun} disabled={dryRunRunning || testCases.length === 0} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:opacity-50"><Play className={`size-3.5 ${dryRunRunning ? 'animate-spin' : ''}`} /><span>{dryRunRunning ? 'Đang chạy mã trong Docker...' : 'Chạy thử trong Docker'}</span></button>
    {dryRunRunning && (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900 animate-pulse">
        <span>⏳ Đang chạy đối sánh {testCases.length} testcase trong môi trường Docker Sandbox an toàn. Quá trình kiểm thử thực tế có thể mất khoảng 30–50 giây, vui lòng chờ trong giây lát...</span>
      </div>
    )}
  </>;
}

function DryRunOutput({ dryRunError, dryRunResult, testCases }: Pick<WizardStep4ReviewProps, 'dryRunError' | 'dryRunResult' | 'testCases'>) {
  return <>
    {dryRunError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{dryRunError}</div>}
    {dryRunResult && <DryRunResultCard result={dryRunResult} testCases={testCases} />}
  </>;
}

function DryRunResultCard({ result, testCases }: { result: DryRunExecutionSummary; testCases: TestCase[] }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'FAILED' | 'PASSED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const allTestsPassed = result.success && result.passedTests === result.totalTests;
  const failedCount = result.totalTests - result.passedTests;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(result.results.map((r) => r.testCaseId)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const filteredResults = result.results.filter((item, idx) => {
    if (filterStatus === 'FAILED' && item.passed) return false;
    if (filterStatus === 'PASSED' && !item.passed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const tc = testCases[idx];
      const matchId = item.testCaseId.toLowerCase().includes(q);
      const matchLabel = tc?.label?.toLowerCase().includes(q);
      const matchQuestion = String(tc?.questionNumber ?? '').toLowerCase().includes(q);
      return matchId || matchLabel || matchQuestion;
    }
    return true;
  });

  return (
    <div className={`rounded-2xl border p-5 text-xs animate-in fade-in transition space-y-4 ${
      allTestsPassed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-amber-50/50 border-amber-200 text-amber-950'
    }`}>
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3 border-emerald-200/60">
        <div className="flex items-center gap-2.5 font-extrabold text-sm">
          {allTestsPassed ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="size-5 shrink-0 text-amber-600" />
          )}
          <span>
            Kết quả chạy thật: {result.passedTests}/{result.totalTests} testcase đạt • {result.totalScore}/{result.maxScore} điểm
          </span>
        </div>

        {/* Nút thao tác nhanh mở/đóng tất cả */}
        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer"
          >
            Mở rộng tất cả
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer"
          >
            Thu gọn
          </button>
        </div>
      </div>

      {result.compileError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-mono text-xs whitespace-pre-wrap">
          <p className="font-bold text-rose-700 mb-1">Lỗi biên dịch (Compile Error):</p>
          {result.compileError}
        </div>
      )}

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white/80 p-1 rounded-xl border border-slate-200 text-xs w-fit">
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({result.totalTests})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('FAILED')}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterStatus === 'FAILED'
                ? 'bg-rose-600 text-white shadow-xs'
                : failedCount > 0 ? 'text-rose-600 hover:bg-rose-50 font-black' : 'text-slate-400'
            }`}
          >
            Chỉ xem lỗi ({failedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('PASSED')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              filterStatus === 'PASSED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đạt ({result.passedTests})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Q1, Q2, tên testcase..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* 3. Accordion List of Testcases */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {filteredResults.map((item) => {
          const isExpanded = expandedIds.has(item.testCaseId);
          const tcIndex = testCases.findIndex(
            (t, idx) => t.id === item.testCaseId || `dry-run-${idx + 1}` === item.testCaseId
          );
          const tc = tcIndex >= 0 ? testCases[tcIndex] : undefined;

          // Input content & title
          const inputContent = tc?.inputFileContent || tc?.stdinInput || tc?.inputFileName || '(Không có dữ liệu input)';
          const inputTitle = tc?.inputFileContent ? `File nạp: ${tc.inputFileName || 'data.txt'}` : 'Dữ liệu stdin / Menu choice';

          // Expected content & title
          const expectedContent = item.expectedOutput || tc?.expectedFileContent || tc?.expectedStdout || '(Trống)';
          const expectedTitle = tc?.expectedFileName ? `File kỳ vọng: ${tc.expectedFileName}` : 'Kết quả kỳ vọng (stdout)';

          // Actual content
          const actualContent = item.actualOutput || (item.passed ? expectedContent : '(Chưa sinh kết quả)');

          return (
            <div
              key={item.testCaseId}
              className={`rounded-xl border transition overflow-hidden bg-white ${
                item.passed ? 'border-slate-200 hover:border-emerald-300' : 'border-rose-300 shadow-xs'
              }`}
            >
              {/* Accordion Row Header */}
              <button
                type="button"
                onClick={() => toggleExpand(item.testCaseId)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      item.passed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.passed ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                    {item.passed ? 'ĐẠT' : item.status || 'SAI'}
                  </span>
                  <span className="font-bold text-slate-800">
                    {tc?.questionNumber ? `[${tc.questionNumber}] ` : ''}{tc?.label || item.testCaseId}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">({item.testCaseId})</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="size-3 text-slate-400" />
                    {item.executionTimeMs} ms
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="size-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="size-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Accordion Expanded Detail (Input vs Expected vs Actual) */}
              {isExpanded && (
                <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 space-y-3 animate-in fade-in duration-150">
                  {item.errorMessage && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-mono text-[11px]">
                      <span className="font-bold">Chi tiết lỗi: </span>{item.errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Cột 1: Input */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                        <span>📥 {inputTitle}</span>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-700 max-h-48 overflow-auto whitespace-pre-wrap">
                        {inputContent}
                      </pre>
                    </div>

                    {/* Cột 2: Expected Output */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-indigo-700 flex items-center justify-between">
                        <span>🎯 {expectedTitle}</span>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-indigo-50/40 border border-indigo-200 font-mono text-[11px] text-indigo-950 max-h-48 overflow-auto whitespace-pre-wrap">
                        {expectedContent}
                      </pre>
                    </div>

                    {/* Cột 3: Actual Output từ Docker Sandbox */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold flex items-center justify-between">
                        <span className={item.passed ? 'text-emerald-700' : 'text-rose-700'}>
                          ⚡ Thực tế ({item.passed ? 'Khớp 100%' : 'Sai lệch'})
                        </span>
                      </div>
                      <pre className={`p-2.5 rounded-lg font-mono text-[11px] max-h-48 overflow-auto whitespace-pre-wrap border ${
                        item.passed
                          ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50/40 border-rose-200 text-rose-950'
                      }`}>
                        {actualContent}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DryRunPanel({
  environment,
  solutionFiles,
  testCases,
  totalPoints,
  dryRunRunning,
  dryRunResult,
  dryRunError,
  onDryRun,
  previewDeploymentUrl,
  onPreviewDeploymentUrlChange,
  referenceRepositoryUrl,
  onReferenceRepositoryUrlChange,
}: Pick<WizardStep4ReviewProps, 'environment' | 'solutionFiles' | 'testCases' | 'totalPoints' | 'dryRunRunning' | 'dryRunResult' | 'dryRunError' | 'onDryRun' | 'previewDeploymentUrl' | 'onPreviewDeploymentUrlChange' | 'referenceRepositoryUrl' | 'onReferenceRepositoryUrlChange'>) {
  const isReact = environment === 'REACT_JS';
  const heading = isReact ? '2. Kiểm Thử Giao Diện Playwright (Live Dry Run)' : '2. Kiểm Thử Sandbox Đối Sánh (Dry Run)';
  return <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-emerald-600" /><h2 className="text-sm font-extrabold text-slate-900">{heading}</h2></div>
      <span className="text-xs font-medium text-slate-400">{isReact ? 'Chạy thử kịch bản với URL deploy mẫu của giảng viên' : 'Chạy mã giải với các testcase'}</span>
    </div>
    <DryRunModeDetails
      isReact={isReact}
      environment={environment}
      solutionFiles={solutionFiles}
      testCases={testCases}
      totalPoints={totalPoints}
      dryRunRunning={dryRunRunning}
      onDryRun={onDryRun}
      previewDeploymentUrl={previewDeploymentUrl}
      onPreviewDeploymentUrlChange={onPreviewDeploymentUrlChange}
      referenceRepositoryUrl={referenceRepositoryUrl}
      onReferenceRepositoryUrlChange={onReferenceRepositoryUrlChange}
    />
    <DryRunOutput dryRunError={dryRunError} dryRunResult={dryRunResult} testCases={testCases} />
  </div>;
}

function ExamReviewOverview({ selectedCourse, environment, testCases, totalPoints, durationMinutes, title, description, gradingApprovalMode, onGradingApprovalModeChange }: Pick<WizardStep4ReviewProps, 'selectedCourse' | 'environment' | 'testCases' | 'totalPoints' | 'durationMinutes' | 'title' | 'description' | 'gradingApprovalMode' | 'onGradingApprovalModeChange'>) {
  const isReact = environment === 'REACT_JS';
  const environmentLabels: Record<AssignmentEnv, string> = { C_GCC: 'C GCC 11', JAVA_JDK: 'Java JDK 21', REACT_JS: 'React + Playwright' };
  const scoreDescription = isReact
    ? '7.0đ Playwright + 2.0đ Cấu trúc React + 1.0đ Clean Code = 10.0đ'
    : '10.0đ Chức năng (AI Giám sát & Trừ phạt)';
  const gradingDescription = isReact
    ? 'Playwright chấm tối đa 7 điểm trên URL deploy; AI chỉ đọc source chọn lọc để chấm 2 điểm cấu trúc React và 1 điểm Clean Code.'
    : 'Sandbox chấm 100% độ chính xác testcases chức năng (tối đa 10.0đ); AI chỉ đối sánh mã nguồn để trừ phạt nếu phát hiện gian lận hoặc hardcode.';
  return <>
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-blue-600" /><h2 className="text-sm font-extrabold text-slate-900">1. Rà Soát Tổng Thể Đề Thi Trước Khi Công Bố</h2></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">ĐỦ THÔNG TIN BẮT BUỘC</span></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bg-slate-50 p-3.5"><div className="text-xs font-semibold text-slate-400">Môn học</div><div className="mt-0.5 text-sm font-black text-slate-900">{selectedCourse?.code || 'Chưa chọn'}</div><div className="truncate text-xs text-slate-500">{selectedCourse?.name}</div></div>
        <div className="bg-slate-50 p-3.5"><div className="text-xs font-semibold text-slate-400">Môi trường chấm</div><div className="mt-0.5 text-sm font-black text-blue-700">{environmentLabels[environment]}</div><div className="text-xs text-slate-500">{isReact ? 'URL deploy công khai' : 'Docker Sandbox'}</div></div>
        <div className="bg-slate-50 p-3.5"><div className="text-xs font-semibold text-slate-400">{isReact ? 'Luồng Playwright' : 'Số bộ Testcase'}</div><div className="mt-0.5 text-sm font-black text-slate-900">{testCases.length} {isReact ? 'luồng' : 'cases'}</div><div className="text-xs font-bold text-emerald-600">Tổng {Number(totalPoints).toFixed(1)} điểm</div></div>
        <div className="bg-slate-50 p-3.5"><div className="text-xs font-semibold text-slate-400">Thời lượng ca thi</div><div className="mt-0.5 text-sm font-black text-slate-900">{durationMinutes} phút</div><div className="text-xs text-slate-500">Tính từ giờ mở ca</div></div>
      </div>
      <div className="space-y-2 bg-blue-50/50 p-4 text-xs"><div className="flex items-center justify-between"><div className="font-extrabold text-blue-900">{title || '(Chưa nhập tiêu đề đề thi)'}</div><span className="rounded-lg border border-indigo-200 bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800">{scoreDescription}</span></div><p className="text-xs leading-relaxed text-slate-600">{description || 'Không có mô tả chi tiết.'}</p><div className="flex items-center gap-2 p-2.5 text-xs font-medium text-indigo-700"><span className="font-bold">Chuẩn Khảo Thí:</span>{gradingDescription}</div></div>
    </div>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-sm font-extrabold text-slate-900">Công bố điểm sau khi chấm</h3><p className="mt-1 text-xs text-slate-500">Chấm lại luôn tạo lịch sử mới; ảnh chụp và kết quả testcase được lưu theo từng lượt.</p><div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="flex cursor-pointer gap-3 rounded-xl border p-3 text-sm"><input type="radio" name="gradingApprovalMode" checked={gradingApprovalMode === 'LECTURER_REVIEW'} onChange={() => onGradingApprovalModeChange('LECTURER_REVIEW')} /><span><strong>Giảng viên duyệt</strong><span className="mt-1 block text-xs text-slate-500">Điểm chờ xác nhận trước khi sinh viên xem.</span></span></label>
      <label className="flex cursor-pointer gap-3 rounded-xl border p-3 text-sm"><input type="radio" name="gradingApprovalMode" checked={gradingApprovalMode === 'AUTO_PUBLISH'} onChange={() => onGradingApprovalModeChange('AUTO_PUBLISH')} /><span><strong>Tự công bố</strong><span className="mt-1 block text-xs text-slate-500">Tự công bố sau khi toàn bộ bước chấm hoàn tất.</span></span></label>
    </div></section>
  </>;
}

export const WizardStep4Review: React.FC<WizardStep4ReviewProps> = ({
  selectedCourse,
  environment,
  solutionFiles,
  testCases,
  totalPoints,
  durationMinutes,
  title,
  description,
  gradingApprovalMode,
  onGradingApprovalModeChange,
  dryRunRunning,
  dryRunResult,
  dryRunError,
  onDryRun,
  previewDeploymentUrl,
  onPreviewDeploymentUrlChange,
  referenceRepositoryUrl,
  onReferenceRepositoryUrlChange,
  isSubmitting,
  onSaveToDatabase,
  onBack,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ExamReviewOverview selectedCourse={selectedCourse} environment={environment} testCases={testCases} totalPoints={totalPoints} durationMinutes={durationMinutes} title={title} description={description} gradingApprovalMode={gradingApprovalMode} onGradingApprovalModeChange={onGradingApprovalModeChange} />

      <DryRunPanel
        environment={environment}
        solutionFiles={solutionFiles}
        testCases={testCases}
        totalPoints={totalPoints}
        dryRunRunning={dryRunRunning}
        dryRunResult={dryRunResult}
        dryRunError={dryRunError}
        onDryRun={onDryRun}
        previewDeploymentUrl={previewDeploymentUrl}
        onPreviewDeploymentUrlChange={onPreviewDeploymentUrlChange}
        referenceRepositoryUrl={referenceRepositoryUrl}
        onReferenceRepositoryUrlChange={onReferenceRepositoryUrlChange}
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại Bước 3</span>
        </button>

        <button
          type="button"
          onClick={onSaveToDatabase}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="size-4 animate-spin" />
              <span>Đang lưu vào MySQL Database...</span>
            </>
          ) : (
            <>
              <Save className="size-4" />
              <span>LƯU ĐỀ THI VÀO CƠ SỞ DỮ LIỆU MYSQL</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
