import React from 'react';
import {
  Play,
  CheckCircle2,
  RefreshCw,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { AssignmentEnv, Course, TestCase } from '../../types/assignment.types';

interface WizardStep4ReviewProps {
  selectedCourse?: Course;
  environment: AssignmentEnv;
  testCases: TestCase[];
  totalPoints: number;
  durationMinutes: number;
  title: string;
  description: string;
  dryRunRunning: boolean;
  dryRunResult: { passed: number; total: number; latency: string } | null;
  onDryRun: () => void;
  isSubmitting: boolean;
  onSaveToDatabase: () => void;
  onBack: () => void;
}

export const WizardStep4Review: React.FC<WizardStep4ReviewProps> = ({
  selectedCourse,
  environment,
  testCases,
  totalPoints,
  durationMinutes,
  title,
  description,
  dryRunRunning,
  dryRunResult,
  onDryRun,
  isSubmitting,
  onSaveToDatabase,
  onBack,
}) => {
  const isReact = environment === 'REACT_JS';
  const environmentLabel = environment === 'C_GCC'
    ? 'C GCC 11'
    : environment === 'JAVA_JDK'
      ? 'Java JDK 21'
      : 'React + Playwright';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h2 className="font-extrabold text-sm text-slate-900">
              1. Rà Soát Tổng Thể Đề Thi Trước Khi Công Bố
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            SẴN SÀNG XUẤT BẢN
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] text-slate-400 font-semibold">Môn học</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              {selectedCourse?.code || 'Chưa chọn'}
            </div>
            <div className="text-[10px] text-slate-500 truncate">{selectedCourse?.name}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] text-slate-400 font-semibold">Môi trường chấm</div>
            <div className="text-sm font-black text-blue-700 mt-0.5">
              {environmentLabel}
            </div>
            <div className="text-[10px] text-slate-500">{isReact ? 'URL deploy công khai' : 'Docker Sandbox'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] text-slate-400 font-semibold">{isReact ? 'Luồng Playwright' : 'Số bộ Testcase'}</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              {testCases.length} {isReact ? 'luồng' : 'cases'}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold">Tổng {totalPoints} điểm</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] text-slate-400 font-semibold">Thời lượng ca thi</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              {durationMinutes} phút
            </div>
            <div className="text-[10px] text-slate-500">Đếm ngược Kiosk</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-extrabold text-blue-900">{title || '(Chưa nhập tiêu đề đề thi)'}</div>
            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-[11px] border border-indigo-200">
              {isReact
                ? '7.0đ Playwright + 2.0đ Cấu trúc React + 1.0đ Clean Code = 10.0đ'
                : '7.0đ Chức năng + 2.0đ Thuật toán + 1.0đ Clean Code = 10.0đ'}
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            {description || 'Không có mô tả chi tiết.'}
          </p>
          <div className="text-[11px] text-indigo-700 bg-white/70 p-2.5 rounded-lg border border-indigo-100 flex items-center gap-2 font-medium">
            <span className="font-bold">Chuẩn Khảo Thí:</span>
            {isReact
              ? 'Playwright chấm tối đa 7 điểm trên URL deploy; AI chỉ đọc source chọn lọc để chấm 2 điểm cấu trúc React và 1 điểm Clean Code.'
              : 'Sandbox chấm tối đa 7 điểm chức năng; AI đánh giá tối đa 2 điểm thuật toán và 1 điểm Clean Code.'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="font-extrabold text-sm text-slate-900">
              {isReact ? '2. Xác nhận kịch bản chấm FER201' : '2. Kiểm Thử Sandbox Đối Sánh (Dry Run)'}
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {isReact ? 'Không chạy giả khi chưa có URL deploy của bài nộp' : 'Chạy mã giải với các testcase'}
          </span>
        </div>

        {isReact ? (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-xs text-indigo-900">
            <p className="font-bold">Đã cấu hình {testCases.length} luồng, tổng {totalPoints.toFixed(1)} điểm chức năng.</p>
            <p className="mt-1 leading-5 text-indigo-700">
              Kịch bản thật sẽ chạy khi sinh viên nộp URL deploy. Hệ thống không mô phỏng pass và không tự suy đoán thao tác giao diện.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500">
              Hệ thống sẽ chạy thử nghiệm mã giải tham chiếu đã nạp với toàn bộ {testCases.length} testcase để đảm bảo đề thi đạt chuẩn 100% trước khi lưu trữ vào CSDL.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onDryRun}
                disabled={dryRunRunning || testCases.length === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm shadow-emerald-500/20 transition disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${dryRunRunning ? 'animate-spin' : ''}`} />
                <span>{dryRunRunning ? 'Đang chạy mô phỏng Sandbox...' : 'Bắt đầu Dry Run Kiểm thử'}</span>
              </button>
            </div>
          </>
        )}

        {!isReact && dryRunResult && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                KẾT QUẢ DRY RUN: Vượt qua {dryRunResult.passed}/{dryRunResult.total} Testcases! (Độ trễ trung bình {dryRunResult.latency})
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
              100% PASSED
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
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
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang lưu vào MySQL Database...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>LƯU ĐỀ THI VÀO CƠ SỞ DỮ LIỆU MYSQL</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
