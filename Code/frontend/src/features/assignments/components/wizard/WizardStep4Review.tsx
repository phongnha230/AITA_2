import React from 'react';
import {
  Play,
  CheckCircle2,
  RefreshCw,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { AssignmentEnv, Course, DryRunExecutionSummary, TestCase } from '../../types/assignment.types';

interface WizardStep4ReviewProps {
  selectedCourse?: Course;
  environment: AssignmentEnv;
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
}

function DryRunModeDetails({ isReact, testCases, totalPoints, dryRunRunning, onDryRun }: Pick<WizardStep4ReviewProps, 'testCases' | 'totalPoints' | 'dryRunRunning' | 'onDryRun'> & { isReact: boolean }) {
  if (isReact) return <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-xs text-indigo-900"><p className="font-bold">Đã cấu hình {testCases.length} luồng, tổng {totalPoints.toFixed(1)} điểm chức năng.</p><p className="mt-1 leading-5 text-indigo-700">Kịch bản thật sẽ chạy khi sinh viên nộp URL deploy. Hệ thống không mô phỏng pass và không tự suy đoán thao tác giao diện.</p></div>;
  return <>
    <p className="text-xs text-slate-500">Chạy mã giải tham chiếu trong Docker sandbox trên toàn bộ {testCases.length} testcase. Kết quả phản ánh lần chạy thực tế; Docker chưa sẵn sàng thì hệ thống sẽ báo lỗi và không chạy trên máy chủ.</p>
    <button type="button" onClick={onDryRun} disabled={dryRunRunning || testCases.length === 0} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:opacity-50"><Play className={`size-3.5 ${dryRunRunning ? 'animate-spin' : ''}`} /><span>{dryRunRunning ? 'Đang chạy mã trong Docker...' : 'Chạy thử trong Docker'}</span></button>
  </>;
}

function DryRunOutput({ isReact, dryRunError, dryRunResult }: Pick<WizardStep4ReviewProps, 'dryRunError' | 'dryRunResult'> & { isReact: boolean }) {
  if (isReact) return null;
  return <>
    {dryRunError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{dryRunError}</div>}
    {dryRunResult && <DryRunResultCard result={dryRunResult} />}
  </>;
}

function DryRunResultCard({ result }: { result: DryRunExecutionSummary }) {
  const allTestsPassed = result.success && result.passedTests === result.totalTests;
  return <div className={`rounded-xl border p-4 text-xs animate-in fade-in ${allTestsPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-950'}`}>
    <div className="flex items-center gap-2 font-bold">{allTestsPassed ? <CheckCircle2 className="size-5 shrink-0 text-emerald-600" /> : <span className="font-black">!</span>}<span>Kết quả chạy thật: {result.passedTests}/{result.totalTests} testcase đạt • {result.totalScore}/{result.maxScore} điểm</span></div>
    {result.compileError && <pre className="mt-2 whitespace-pre-wrap">{result.compileError}</pre>}
    {result.compilerWarnings && <pre className="mt-2 whitespace-pre-wrap text-slate-600">{result.compilerWarnings}</pre>}
    <ul className="mt-2 space-y-1">{result.results.map((item) => <li key={item.testCaseId} className="font-mono">{item.passed ? 'Đạt' : item.status}: {item.testCaseId} ({item.executionTimeMs} ms){item.errorMessage ? ` — ${item.errorMessage}` : ''}</li>)}</ul>
  </div>;
}

function DryRunPanel({ environment, testCases, totalPoints, dryRunRunning, dryRunResult, dryRunError, onDryRun }: Pick<WizardStep4ReviewProps, 'environment' | 'testCases' | 'totalPoints' | 'dryRunRunning' | 'dryRunResult' | 'dryRunError' | 'onDryRun'>) {
  const isReact = environment === 'REACT_JS';
  const heading = isReact ? '2. Xác nhận kịch bản chấm FER201' : '2. Kiểm Thử Sandbox Đối Sánh (Dry Run)';
  return <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-emerald-600" /><h2 className="text-sm font-extrabold text-slate-900">{heading}</h2></div>
      <span className="text-xs font-medium text-slate-400">{isReact ? 'Không chạy giả khi chưa có URL deploy của bài nộp' : 'Chạy mã giải với các testcase'}</span>
    </div>
    <DryRunModeDetails isReact={isReact} testCases={testCases} totalPoints={totalPoints} dryRunRunning={dryRunRunning} onDryRun={onDryRun} />
    <DryRunOutput isReact={isReact} dryRunError={dryRunError} dryRunResult={dryRunResult} />
  </div>;
}

function ExamReviewOverview({ selectedCourse, environment, testCases, totalPoints, durationMinutes, title, description, gradingApprovalMode, onGradingApprovalModeChange }: Pick<WizardStep4ReviewProps, 'selectedCourse' | 'environment' | 'testCases' | 'totalPoints' | 'durationMinutes' | 'title' | 'description' | 'gradingApprovalMode' | 'onGradingApprovalModeChange'>) {
  const isReact = environment === 'REACT_JS';
  const environmentLabels: Record<AssignmentEnv, string> = { C_GCC: 'C GCC 11', JAVA_JDK: 'Java JDK 21', REACT_JS: 'React + Playwright' };
  const scoreDescription = isReact
    ? '7.0đ Playwright + 2.0đ Cấu trúc React + 1.0đ Clean Code = 10.0đ'
    : '7.0đ Chức năng + 2.0đ Thuật toán + 1.0đ Clean Code = 10.0đ';
  const gradingDescription = isReact
    ? 'Playwright chấm tối đa 7 điểm trên URL deploy; AI chỉ đọc source chọn lọc để chấm 2 điểm cấu trúc React và 1 điểm Clean Code.'
    : 'Sandbox chấm tối đa 7 điểm chức năng; AI đánh giá tối đa 2 điểm thuật toán và 1 điểm Clean Code.';
  return <>
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-blue-600" /><h2 className="text-sm font-extrabold text-slate-900">1. Rà Soát Tổng Thể Đề Thi Trước Khi Công Bố</h2></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">ĐỦ THÔNG TIN BẮT BUỘC</span></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bg-slate-50 p-3.5"><div className="text-xs font-semibold text-slate-400">Môn học</div><div className="mt-0.5 text-sm font-black text-slate-900">{selectedCourse?.code || 'Chưa chọn'}</div><div className="truncate text-xs text-slate-500">{selectedCourse?.name}</div></div>
        <div className="bg-slate-50 p-3.5"><div className="text-xs font-semibold text-slate-400">Môi trường chấm</div><div className="mt-0.5 text-sm font-black text-blue-700">{environmentLabels[environment]}</div><div className="text-xs text-slate-500">{isReact ? 'URL deploy công khai' : 'Docker Sandbox'}</div></div>
        <div className="bg-slate-50 p-3.5"><div className="text-xs font-semibold text-slate-400">{isReact ? 'Luồng Playwright' : 'Số bộ Testcase'}</div><div className="mt-0.5 text-sm font-black text-slate-900">{testCases.length} {isReact ? 'luồng' : 'cases'}</div><div className="text-xs font-bold text-emerald-600">Tổng {totalPoints} điểm</div></div>
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
  isSubmitting,
  onSaveToDatabase,
  onBack,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ExamReviewOverview selectedCourse={selectedCourse} environment={environment} testCases={testCases} totalPoints={totalPoints} durationMinutes={durationMinutes} title={title} description={description} gradingApprovalMode={gradingApprovalMode} onGradingApprovalModeChange={onGradingApprovalModeChange} />

      <DryRunPanel environment={environment} testCases={testCases} totalPoints={totalPoints} dryRunRunning={dryRunRunning} dryRunResult={dryRunResult} dryRunError={dryRunError} onDryRun={onDryRun} />

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại Bước 3</span>
        </button>

        <button
          type="button"
          onClick={onSaveToDatabase}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 flex items-center gap-2 transition disabled:opacity-50"
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
