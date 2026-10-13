'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { StudentExamStation } from '../../mocks/live-proctoring.mock';

interface LiveInspectModalProps {
  station: StudentExamStation | null;
  onClose: () => void;
  onForceSubmit: (studentId: string) => void;
}

export const LiveInspectModal: React.FC<LiveInspectModalProps> = ({
  station,
  onClose,
  onForceSubmit,
}) => {
  if (!station) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white">
              {station.pcNumber}
            </span>
            <span className="font-extrabold text-sm text-slate-900">
              Thông Tin Bài Thi Thí Sinh
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thông tin thí sinh"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <div className="font-extrabold text-sm text-slate-900">
                {station.studentName}
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                MSSV: {station.studentCode}
              </div>
            </div>
            <div>
              {station.status === 'submitted' ? (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ĐÃ NỘP BÀI
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  ĐANG LÀM BÀI
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-400">Giờ vào phòng thi</div>
              <div className="font-mono font-bold text-slate-800 mt-0.5">
                {station.startTime}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-400">Giờ nộp bài chính thức</div>
              <div className="font-mono font-bold text-slate-800 mt-0.5">
                {station.submittedAt || 'Chưa nộp bài'}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-400">Kết quả Testcase Sandbox</div>
              <div className="font-bold text-blue-700 mt-0.5">
                Đạt {station.passedCases} / {station.totalCases} testcases
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-400">Điểm số đạt được</div>
              <div className="font-mono font-black text-base text-emerald-700 mt-0.5">
                {station.score !== undefined ? `${station.score.toFixed(1)} / 10.0` : '--'}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
            <strong>Ghi chú giám sát:</strong> Bài thi thực hành PRF192 môn C, sinh viên đã thực hiện {station.testAttempts} lần nộp thử nghiệm qua Docker Sandbox.
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Đóng
          </button>

          {station.status === 'working' && (
            <button
              type="button"
              onClick={() => onForceSubmit(station.id)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
            >
              Xác nhận thu bài trước hạn
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
