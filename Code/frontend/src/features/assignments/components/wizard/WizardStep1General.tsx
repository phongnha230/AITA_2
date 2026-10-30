import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AssignmentEnv, AssignmentFlowType, Course } from '../../types/assignment.types';

interface WizardStep1GeneralProps {
  courseId: string;
  flowType: AssignmentFlowType;
  courseLoadError: string | null;
  setCourseId: (val: string) => void;
  courses: Course[];
  environment: AssignmentEnv;
  setEnvironment: (val: AssignmentEnv) => void;
  submissionType: 'INDIVIDUAL' | 'GROUP';
  setSubmissionType: (value: 'INDIVIDUAL' | 'GROUP') => void;
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
  flowType,
  courseLoadError,
  setCourseId,
  courses,
  environment,
  setEnvironment,
  submissionType,
  setSubmissionType,
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
          <span className="size-2.5 rounded-full bg-blue-600"></span>
          <h2 className="font-extrabold text-sm text-slate-900">
            {flowType === 'PE_EXAM' ? 'Bước 1: Cấu hình ca thi PE' : 'Bước 1: Thông tin Assignment'}
          </h2>
        </div>
        <span className="text-xs font-semibold text-slate-600">Bước 1 trên 4</span>
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
            <option value="">Chọn khóa học</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name} ({c.semester})
              </option>
            ))}
          </select>
          {courseLoadError && <p role="alert" className="mt-1 text-xs font-semibold text-rose-700">{courseLoadError}</p>}
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
            <option value="REACT_JS">React / TypeScript + Playwright (FER201)</option>
          </select>
        </div>

        <div>
          <label htmlFor="wizard-submission-type" className="block font-bold text-slate-700 mb-1">
            Hình thức nộp
          </label>
          <select
            id="wizard-submission-type"
            value={submissionType}
            onChange={(event) => setSubmissionType(event.target.value as 'INDIVIDUAL' | 'GROUP')}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
          >
            <option value="INDIVIDUAL">Cá nhân</option>
            <option value="GROUP">Nhóm / Final Project</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="wizard-title-input" className="block font-bold text-slate-700 mb-1">
            {flowType === 'PE_EXAM' ? 'Tiêu đề Đề thi PE' : 'Tiêu đề Assignment'}
          </label>
          <input
            id="wizard-title-input"
            type="text"
            aria-label={flowType === 'PE_EXAM' ? 'Tiêu đề Đề thi PE' : 'Tiêu đề Assignment'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={flowType === 'PE_EXAM' ? 'Ví dụ: Kỳ thi Thực hành PE PRF192 - Spring 2025' : 'Ví dụ: Bài tập cấu trúc dữ liệu'}
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
            Mã đề (bắt buộc)
          </label>
          <input
            id="exam-access-code"
            type="text"
            aria-label="Mã mở đề thi / Passcode PE"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Ví dụ: PE-PRF192-2026"
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
          />
        </div>

        {/* CHUẨN KHẢO THÍ: STRICT PE (10.0đ TESTCASES + AI AUDIT PENALTY) */}
        <div className="md:col-span-2 p-3.5 bg-gradient-to-br from-indigo-50/70 via-white to-white space-y-2 rounded-xl border border-indigo-100">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              ⚖ Cơ chế Khảo thí Chuẩn: Strict PE (10.0đ Testcases + AI Audit)
            </span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-100/90 px-2.5 py-0.5 rounded-full border border-indigo-200">
              10.0đ Testcases chức năng • AI Audit trừ điểm phạt nếu vi phạm
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sandbox chấm 100% độ chính xác chức năng (tối đa 10.0đ). AI đóng vai trò giám sát, rà soát mã nguồn: không cộng điểm, chỉ trừ điểm phạt (Penalty) nếu phát hiện hardcode testcase hoặc vi phạm Clean Code.
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
        >
          <span>Tiếp tục: Tải Đề PDF &amp; Starter ZIP</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
};
