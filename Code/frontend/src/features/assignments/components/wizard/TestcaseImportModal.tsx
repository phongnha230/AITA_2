import React from 'react';
import {
  FileSpreadsheet,
  X,
  Upload,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { TestCase } from '../../types/assignment.types';

interface TestcaseImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importType: 'json' | 'excel';
  setImportType: (val: 'json' | 'excel') => void;
  importMode?: 'replace' | 'append';
  setImportMode?: (val: 'replace' | 'append') => void;
  existingCount?: number;
  jsonText: string;
  setJsonText: (val: string) => void;
  previewTestCases: TestCase[];
  importError: string | null;
  onParseJson: (text: string) => void;
  onParseCsv: (text: string) => void;
  onConfirmImport: () => void;
}

export const TestcaseImportModal: React.FC<TestcaseImportModalProps> = ({
  isOpen,
  onClose,
  importType,
  setImportType,
  importMode = 'replace',
  setImportMode,
  existingCount = 0,
  jsonText,
  setJsonText,
  previewTestCases,
  importError,
  onParseJson,
  onParseCsv,
  onConfirmImport,
}) => {
  if (!isOpen) return null;

  const handleLoadSampleJson = () => {
    const sample = JSON.stringify(
      [
        {
          question: 'Q1',
          questionTitle: 'Thao tác mảng và số nguyên tố',
          testCases: [
            { label: 'Q1_TC1_Basic', stdinInput: '1\n10', expectedStdout: '2 3 5 7\nTotal: 4', points: 1.0, isHidden: false },
            { label: 'Q1_TC2_Boundary', stdinInput: '1\n2', expectedStdout: '2\nTotal: 1', points: 1.0, isHidden: false },
            { label: 'Q1_TC3_Hidden_Large', stdinInput: '1\n50', expectedStdout: 'Total: 15', points: 1.0, isHidden: true },
          ],
        },
        {
          question: 'Q2',
          questionTitle: 'Đảo chuỗi ký tự & sắp xếp',
          testCases: [
            { label: 'Q2_TC1_Reverse', stdinInput: 'hello world', expectedStdout: 'dlrow olleh', points: 1.5, isHidden: false },
            { label: 'Q2_TC2_Hidden_Special', stdinInput: 'FPT@2026', expectedStdout: '6202@TPF', points: 1.5, isHidden: true },
          ],
        },
        {
          question: 'Q3',
          questionTitle: 'Quản lý sinh viên & OOP/Struct',
          testCases: [
            { label: 'Q3_TC1_FindMax', stdinInput: '3\nAn 8\nBinh 9\nCuong 7', expectedStdout: 'Binh 9.0', points: 2.0, isHidden: false },
            { label: 'Q3_TC2_Hidden_Tie', stdinInput: '2\nLan 9\nNam 9', expectedStdout: 'Lan 9.0', points: 2.0, isHidden: true },
          ],
        },
      ],
      null,
      2
    );
    setJsonText(sample);
    onParseJson(sample);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-4 text-blue-600" />
            <span className="font-extrabold text-sm text-slate-900">
              Import Testcase Hàng Loạt & Xem Trước Dữ Liệu
            </span>
          </div>
          <button
            type="button"
            aria-label="Đóng cửa sổ import testcase"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex border-b border-slate-200 pb-2 gap-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setImportType('json');
              }}
              className={`pb-1 ${importType === 'json' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
            >
              Import file JSON
            </button>
            <button
              type="button"
              onClick={() => {
                setImportType('excel');
              }}
              className={`pb-1 ${importType === 'excel' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
            >
              Import file Excel / CSV
            </button>
          </div>

          {/* Lựa chọn Ghi đè hay Nối thêm khi đã có testcase */}
          {existingCount > 0 && setImportMode && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 shrink-0">Tùy chọn nạp:</span>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-blue-800">
                  <input
                    type="radio"
                    name="modalImportMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="accent-blue-600 size-3.5"
                  />
                  <span>Ghi đè (Thay thế {existingCount} testcases cũ - Khuyên dùng)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-600">
                  <input
                    type="radio"
                    name="modalImportMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="accent-blue-600 size-3.5"
                  />
                  <span>Nối thêm vào sau</span>
                </label>
              </div>
            </div>
          )}

          {importType === 'json' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="font-bold text-slate-700">Tải file hoặc dán JSON testcases:</span>
                <div className="flex items-center gap-2">
                  <label className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer inline-flex items-center gap-1 border border-blue-200">
                    <Upload className="size-3" />
                    <span>Chọn file .json</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const content = evt.target?.result as string;
                          setJsonText(content);
                          onParseJson(content);
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSampleJson}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    ⚡ Nạp JSON mẫu theo Câu hỏi (Chuẩn 10.0đ)
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  onParseJson(e.target.value);
                }}
                placeholder='[ { "label": "TC1", "stdinInput": "...", "expectedStdout": "...", "points": 2.0, "isHidden": false } ]'
                aria-label="Nội dung JSON testcase hàng loạt"
                className="w-full p-2.5 font-mono text-base rounded-xl border border-slate-200 bg-slate-900 text-slate-100 focus:outline-none"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-600">
                Chọn file định dạng <strong>.csv</strong> hoặc bảng tính chứa các cột:{' '}
                <code>label, stdinInput, expectedStdout, points, isHidden</code>
              </div>
              <label className="cursor-pointer block p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-center bg-slate-50 transition">
                <Upload className="size-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-700">Bấm để chọn file .csv từ máy tính</span>
                <input
                  type="file"
                  accept=".csv"
                  aria-label="Chọn file CSV testcase"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      const content = evt.target?.result as string;
                      onParseCsv(content);
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
            </div>
          )}

          {importError && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {previewTestCases.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  Tìm thấy {previewTestCases.length} testcases hợp lệ:
                </span>
                <span className="text-slate-500 font-normal text-xs">
                  Tổng điểm: <strong>{previewTestCases.reduce((s, c) => s + (Number(c.points) || 0), 0)} pts</strong>
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase sticky top-0">
                    <tr>
                      <th className="py-2 px-2.5">#</th>
                      <th className="py-2 px-2.5">Tên Test</th>
                      <th className="py-2 px-2.5">Chế độ</th>
                      <th className="py-2 px-2.5">Điểm</th>
                      <th className="py-2 px-2.5">Input (Stdin)</th>
                      <th className="py-2 px-2.5">Kết quả (Stdout)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {previewTestCases.map((tc, idx) => (
                      <tr key={tc.id ?? `${tc.label}_${tc.orderIndex}`} className="hover:bg-slate-50">
                        <td className="py-1.5 px-2.5 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-1.5 px-2.5 font-semibold text-slate-800 truncate max-w-[140px]">
                          {tc.label}
                        </td>
                        <td className="py-1.5 px-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              tc.isHidden ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {tc.isHidden ? 'Ẩn' : 'Hiện'}
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 font-bold text-blue-700">{tc.points} pts</td>
                        <td className="py-1.5 px-2.5 font-mono text-xs text-slate-600 truncate max-w-[120px]">
                          {tc.stdinInput?.replace(/\n/g, ' ↵ ')}
                        </td>
                        <td className="py-1.5 px-2.5 font-mono text-xs text-slate-600 truncate max-w-[120px]">
                          {tc.expectedStdout?.replace(/\n/g, ' ↵ ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirmImport}
            disabled={previewTestCases.length === 0}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            {existingCount > 0 && importMode === 'replace'
              ? `Xác nhận thay thế toàn bộ bằng ${previewTestCases.length} cases mới`
              : `Xác nhận nạp ${previewTestCases.length > 0 ? `(${previewTestCases.length} cases)` : ''} vào đề`}
          </button>
        </div>
      </div>
    </div>
  );
};
