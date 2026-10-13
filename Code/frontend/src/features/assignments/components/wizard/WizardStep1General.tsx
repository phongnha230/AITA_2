import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AssignmentEnv, Course } from '../../types/assignment.types';

interface WizardStep1GeneralProps {
  courseId: string;
  setCourseId: (val: string) => void;
  courses: Course[];
  environment: AssignmentEnv;
  setEnvironment: (val: AssignmentEnv) => void;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  durationMinutes: number;
  setDurationMinutes: (val: number) => void;
  onNext: () => void;
}

export const WizardStep1General: React.FC<WizardStep1GeneralProps> = ({
  courseId,
  setCourseId,
  courses,
  environment,
  setEnvironment,
  title,
  setTitle,
  description,
  setDescription,
  durationMinutes,
  setDurationMinutes,
  onNext,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h2 className="font-extrabold text-sm text-slate-900">
            Bước 1: Thông tin chung & Cấu hình Ca thi PE
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">Bước 1 trên 4</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label htmlFor="wizard-course-select" className="block font-bold text-slate-700 mb-1">
            Môn học (Course)
          </label>
          <select
            id="wizard-course-select"
            aria-label="Môn học (Course)"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name} ({c.semester})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="wizard-env-select" className="block font-bold text-slate-700 mb-1">
            Môi trường Docker Sandbox
          </label>
          <select
            id="wizard-env-select"
            aria-label="Môi trường Docker Sandbox"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as AssignmentEnv)}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          >
            <option value="C_GCC">C/C++ GCC 11 Compiler (Mặc định cho PRF192)</option>
            <option value="JAVA_JDK">Java OpenJDK 21 LTS (Maven & JUnit cho PRO192/CSD201)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="wizard-title-input" className="block font-bold text-slate-700 mb-1">
            Tiêu đề Đề thi PE
          </label>
          <input
            id="wizard-title-input"
            type="text"
            aria-label="Tiêu đề Đề thi PE"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Kỳ thi Thực hành PE PRF192 - Spring 2025"
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="wizard-description-input" className="block font-bold text-slate-700 mb-1">
            Mô tả / Yêu cầu chung của đề bài
          </label>
          <textarea
            id="wizard-description-input"
            rows={3}
            aria-label="Mô tả / Yêu cầu chung của đề bài"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ghi chú thêm về quy chế thi, cấu trúc bài toán hoặc lưu ý cho sinh viên..."
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="exam-duration" className="block font-bold text-slate-700 mb-1">
            Thời lượng làm bài (phút)
          </label>
          <input
            id="exam-duration"
            type="number"
            aria-label="Thời lượng làm bài (phút)"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value) || 0))}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="sandbox-limit" className="block font-bold text-slate-700 mb-1">
            Giới hạn số lần nộp Docker Sandbox
          </label>
          <input
            id="sandbox-limit"
            type="number"
            aria-label="Giới hạn số lần nộp Docker Sandbox"
            defaultValue={10}
            disabled
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            Tối đa 10 lần nộp để tránh nghẽn hàng đợi chấm.
          </span>
        </div>

        {/* CHUẨN KHẢO THÍ: STRICT PE HYBRID GRADING (8.0đ TESTCASES + 2.0đ AI CLEAN CODE = 10.0đ) */}
        <div className="md:col-span-2 p-4 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold">
                ⚖
              </span>
              <span className="font-extrabold text-xs text-slate-900">
                Cơ chế Khảo thí Chuẩn: Strict PE (Hybrid Grading Standard)
              </span>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/90 px-2.5 py-1 rounded-full border border-indigo-200 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Báo chuẩn: 8.0đ Testcases + 2.0đ AI Clean Code = 10.0đ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/30">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  1. Docker Sandbox Testcases
                </span>
                <span className="font-mono font-black text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  8.0 điểm
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed">
                Kiểm thử hộp đen tự động (Black-box testing) trên môi trường cô lập Docker. Đảm bảo tính chính xác, khách quan và công bằng tuyệt đối của kỳ thi PE.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-indigo-200/80 bg-indigo-50/30">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  2. AI Clean Code & Semantic
                </span>
                <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  2.0 điểm
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed">
                <strong>Trị dứt điểm tình trạng sinh viên hardcode kết quả</strong> để qua mặt testcase. Đánh giá quy chuẩn đặt tên biến, tách hàm OOP và phân tích độ phức tạp Big-O.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (!title.trim()) {
              alert('Vui lòng nhập Tiêu đề Đề thi PE trước khi tiếp tục!');
              return;
            }
            onNext();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
        >
          <span>Tiếp tục: Tải Đề PDF & Starter ZIP</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
