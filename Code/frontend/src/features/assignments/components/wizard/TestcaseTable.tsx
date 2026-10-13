import React from 'react';
import { Terminal, Upload, Trash2 } from 'lucide-react';
import { RationaleTag, TestCase } from '../../types/assignment.types';

interface TestcaseTableProps {
  testCases: TestCase[];
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>;
  onAddBlankTestCase: () => void;
  onOpenImportModal: () => void;
  onDeleteTestCase: (idx: number) => void;
}

export const TestcaseTable: React.FC<TestcaseTableProps> = ({
  testCases,
  setTestCases,
  onAddBlankTestCase,
  onOpenImportModal,
  onDeleteTestCase,
}) => {
  if (testCases.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <Terminal className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <div className="text-xs font-bold text-slate-700">Chưa có testcase nào trong đề thi</div>
        <p className="text-[11px] text-slate-400 mt-1 mb-4">
          Bấm <strong>Import Testcase (JSON/CSV)</strong> để nạp từ file có sẵn, hoặc bấm <strong>⚡ Nạp dữ liệu mẫu PRF192</strong> ở đầu trang.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onAddBlankTestCase}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"
          >
            Thêm thủ công
          </button>
          <button
            type="button"
            onClick={onOpenImportModal}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-sm flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import từ file JSON / CSV</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
          <tr>
            <th className="py-2.5 px-3">#</th>
            <th className="py-2.5 px-3">Câu hỏi (Q)</th>
            <th className="py-2.5 px-3">Tên Testcase</th>
            <th className="py-2.5 px-3">Phân loại</th>
            <th className="py-2.5 px-3">Chế độ</th>
            <th className="py-2.5 px-3">Điểm</th>
            <th className="py-2.5 px-3">Giới hạn</th>
            <th className="py-2.5 px-3">Đầu vào (Stdin)</th>
            <th className="py-2.5 px-3">Kết quả mong đợi</th>
            <th className="py-2.5 px-3 text-right">Xóa</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-sans">
          {testCases.map((tc, idx) => (
            <tr key={tc.id ?? `${tc.label}_${tc.orderIndex}`} className="hover:bg-slate-50/80 transition">
              <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
              <td className="py-2.5 px-3">
                <input
                  type="text"
                  aria-label="Mã câu hỏi (Q1, Q2...)"
                  value={tc.questionNumber || `Q1`}
                  onChange={(e) => {
                    const copy = [...testCases];
                    copy[idx].questionNumber = e.target.value.toUpperCase();
                    setTestCases(copy);
                  }}
                  placeholder="Q1, Q2..."
                  className="w-14 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-bold text-indigo-700 text-center uppercase focus:border-indigo-500 focus:outline-none"
                />
              </td>
              <td className="py-2.5 px-3 font-semibold text-slate-800">
                <input
                  type="text"
                  aria-label="Tên testcase"
                  value={tc.label}
                  onChange={(e) => {
                    const copy = [...testCases];
                    copy[idx].label = e.target.value;
                    setTestCases(copy);
                  }}
                  className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-44"
                />
              </td>
              <td className="py-2.5 px-3">
                <select
                  aria-label="Phân loại testcase"
                  value={tc.rationaleTag}
                  onChange={(e) => {
                    const copy = [...testCases];
                    copy[idx].rationaleTag = e.target.value as RationaleTag;
                    setTestCases(copy);
                  }}
                  className="bg-transparent text-[11px] font-semibold text-slate-600"
                >
                  <option value="FUNCTIONAL">Functional</option>
                  <option value="BOUNDARY">Boundary</option>
                  <option value="EDGE">Edge Case</option>
                  <option value="PERFORMANCE">Performance</option>
                  <option value="SECURITY">Security</option>
                </select>
              </td>
              <td className="py-2.5 px-3">
                <button
                  type="button"
                  onClick={() => {
                    const copy = [...testCases];
                    copy[idx].isHidden = !copy[idx].isHidden;
                    setTestCases(copy);
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    tc.isHidden
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {tc.isHidden ? 'Ẩn (Chấm thật)' : 'Công khai'}
                </button>
              </td>
              <td className="py-2.5 px-3">
                <input
                  type="number"
                  step="0.5"
                  aria-label="Điểm số testcase"
                  value={tc.points}
                  onChange={(e) => {
                    const copy = [...testCases];
                    copy[idx].points = Math.max(0, Number(e.target.value) || 0);
                    setTestCases(copy);
                  }}
                  className="w-12 bg-transparent text-center font-bold text-blue-700 focus:outline-none border-b border-slate-200"
                />
              </td>
              <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                {tc.timeLimitMs}ms
              </td>
              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                <input
                  type="text"
                  aria-label="Dữ liệu đầu vào (Stdin)"
                  value={tc.stdinInput ?? ''}
                  onChange={(e) => {
                    const copy = [...testCases];
                    copy[idx].stdinInput = e.target.value;
                    setTestCases(copy);
                  }}
                  className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-36 truncate"
                />
              </td>
              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                <input
                  type="text"
                  aria-label="Kết quả mong đợi (Stdout)"
                  value={tc.expectedStdout ?? ''}
                  onChange={(e) => {
                    const copy = [...testCases];
                    copy[idx].expectedStdout = e.target.value;
                    setTestCases(copy);
                  }}
                  className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-36 truncate"
                />
              </td>
              <td className="py-2.5 px-3 text-right">
                <button
                  type="button"
                  aria-label="Xóa testcase"
                  onClick={() => onDeleteTestCase(idx)}
                  className="p-1 text-slate-300 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
