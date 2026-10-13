'use client';

import React from 'react';
import { CheckCircle2, Hourglass } from 'lucide-react';
import type { StudentExamStation } from '../../mocks/live-proctoring.mock';

interface LiveProctoringTableProps {
  stations: StudentExamStation[];
  onInspect: (station: StudentExamStation) => void;
  onForceSubmit: (studentId: string) => void;
}

export const LiveProctoringTable: React.FC<LiveProctoringTableProps> = ({
  stations,
  onInspect,
  onForceSubmit,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold text-[10px] uppercase">
            <tr>
              <th className="py-3 px-4">Số máy</th>
              <th className="py-3 px-4">Mã SV</th>
              <th className="py-3 px-4">Họ và tên thí sinh</th>
              <th className="py-3 px-4">Trạng thái bài thi</th>
              <th className="py-3 px-4">Tiến độ Testcase</th>
              <th className="py-3 px-4">Số lần chạy thử</th>
              <th className="py-3 px-4">Điểm số</th>
              <th className="py-3 px-4">Giờ nộp bài</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {stations.map((station) => {
              const isSubmitted = station.status === 'submitted';

              return (
                <tr
                  key={station.id}
                  tabIndex={0}
                  onClick={() => onInspect(station)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onInspect(station);
                  }}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {station.pcNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 font-semibold">
                    {station.studentCode}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {station.studentName}
                  </td>
                  <td className="py-3 px-4">
                    {isSubmitted ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ĐÃ NỘP BÀI
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                        <Hourglass className="w-3 h-3 text-blue-600" />
                        ĐANG LÀM BÀI
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-700">
                    {station.passedCases} / {station.totalCases} cases
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {station.testAttempts} / {station.maxAttempts}
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-sm">
                    {isSubmitted ? (
                      <span className="text-emerald-700">{station.score?.toFixed(1)} pts</span>
                    ) : (
                      <span className="text-slate-300">--</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {station.submittedAt || '--:--:--'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!isSubmitted ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onForceSubmit(station.id);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
                      >
                        Thu bài sớm
                      </button>
                    ) : (
                      <span className="text-emerald-600 text-xs font-bold">Đã nộp bài</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
