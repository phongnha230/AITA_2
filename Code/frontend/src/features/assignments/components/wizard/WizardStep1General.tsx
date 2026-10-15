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
  startTime: string;
  setStartTime: (val: string) => void;
  durationMinutes: number;
  setDurationMinutes: (val: number) => void;
  accessCode: string;
  setAccessCode: (val: string) => void;
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
  startTime,
  setStartTime,
  durationMinutes,
  setDurationMinutes,
  accessCode,
  setAccessCode,
  onNext,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h2 className="font-extrabold text-sm text-slate-900">
            Bước 1: Thông tin chung &amp; Cấu hình Ca thi PE
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
            <option value="JAVA_JDK">Java OpenJDK 21 LTS (Maven &amp; JUnit cho PRO192/CSD201)</option>
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
            rows={2}
            aria-label="Mô tả / Yêu cầu chung của đề bài"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ghi chú thêm về quy chế thi, cấu trúc bài toán hoặc lưu ý cho sinh viên..."
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Cụm cấu hình Thời gian ca thi & Passcode */}
        <div>
          <label htmlFor="exam-start-time" className="block font-bold text-slate-700 mb-1">
            Thời gian bắt đầu ca thi
          </label>
          <input
            id="exam-start-time"
            type="datetime-local"
            aria-label="Thời gian bắt đầu ca thi"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
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
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="exam-access-code" className="block font-bold text-slate-700 mb-1">
            Mã mở đề thi / Passcode PE (Tùy chọn)
          </label>
          <input
            id="exam-access-code"
            type="text"
            aria-label="Mã mở đề thi / Passcode PE"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Ví dụ: PE-PRF192-2026 (Để trống nếu không đặt mật khẩu mở đề)"
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
          />
        </div>

        {/* CHUẨN KHẢO THÍ: STRICT PE HYBRID GRADING (8.0đ + 2.0đ) */}
        <div className="md:col-span-2 p-3.5 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-white space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              ⚖ Cơ chế Khảo thí Chuẩn: Strict PE (Hybrid Grading)
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/90 px-2.5 py-0.5 rounded-full border border-indigo-200">
              8.0đ Testcases Sandbox + 2.0đ AI Clean Code = 10.0đ
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Hệ thống chấm tự động cô lập qua Docker Sandbox và phân tích AI Rubric để chống hardcode kết quả.
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex justify-end">
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
          <span>Tiếp tục: Tải Đề PDF &amp; Starter ZIP</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
