import { Upload, FileSpreadsheet, Plus } from 'lucide-react';
import { TestCase } from '../../types/assignment.types';
import { TestcaseTable } from './TestcaseTable';
import { WizardNavFooter } from './WizardNavFooter';

interface WizardStep3SolutionProps {
  solutionTitle: string;
  setSolutionTitle: (val: string) => void;
  solutionCode: string;
  setSolutionCode: (val: string) => void;
  expectedComplexity: string;
  setExpectedComplexity: (val: string) => void;
  expectedSpaceComplexity: string;
  setExpectedSpaceComplexity: (val: string) => void;
  acceptedStrategiesText: string;
  setAcceptedStrategiesText: (val: string) => void;
  algorithmNotes: string;
  setAlgorithmNotes: (val: string) => void;
  handleSolutionFileUpload: (file: File) => void;
  testCases: TestCase[];
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>;
  onAddBlankTestCase: () => void;
  onOpenImportModal: () => void;
  onDeleteTestCase: (idx: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export const WizardStep3Solution: React.FC<WizardStep3SolutionProps> = ({
  solutionTitle,
  setSolutionTitle,
  solutionCode,
  setSolutionCode,
  expectedComplexity,
  setExpectedComplexity,
  expectedSpaceComplexity,
  setExpectedSpaceComplexity,
  acceptedStrategiesText,
  setAcceptedStrategiesText,
  algorithmNotes,
  setAlgorithmNotes,
  handleSolutionFileUpload,
  testCases,
  setTestCases,
  onAddBlankTestCase,
  onOpenImportModal,
  onDeleteTestCase,
  onBack,
  onNext,
}) => {
  const targetTestcaseMax = 7.0;
  const totalCalculatedPoints = testCases.reduce((acc, cur) => acc + (Number(cur.points) || 0), 0);
  const isExactTarget = Math.abs(totalCalculatedPoints - targetTestcaseMax) < 0.01;
  const uniqueQuestions = Array.from(new Set(testCases.map((tc) => tc.questionNumber || 'Q1')));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h2 className="font-extrabold text-sm text-slate-900">
              1. Bài Giải Code Sẵn (Reference Solution)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="wizard-accepted-strategies" className="block font-bold text-slate-700 mb-1">
                Các hướng giải được chấp nhận
              </label>
              <textarea
                id="wizard-accepted-strategies"
                value={acceptedStrategiesText}
                onChange={(e) => setAcceptedStrategiesText(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Merge sort, Heap sort"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
              <p className="mt-1 text-[10px] text-slate-500">Ngăn cách bằng dấu phẩy hoặc xuống dòng.</p>
            </div>
            <div>
              <label htmlFor="wizard-algorithm-notes" className="block font-bold text-slate-700 mb-1">
                Ghi chú chấm thuật toán
              </label>
              <textarea
                id="wizard-algorithm-notes"
                value={algorithmNotes}
                onChange={(e) => setAlgorithmNotes(e.target.value)}
                rows={3}
                maxLength={4_000}
                placeholder="Tiêu chí thuật toán, giới hạn hoặc cách giải tương đương"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer flex items-center gap-1.5 transition shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>Tải file mã nguồn (.c, .java, .txt)</span>
              <input
                type="file"
                accept=".c,.cpp,.java,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleSolutionFileUpload(f);
                }}
              />
            </label>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-bold border border-emerald-200">
              Chuẩn đối sánh Sandbox
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="wizard-solution-title" className="block font-bold text-slate-700 mb-1">
                Tiêu đề bài giải tham chiếu
              </label>
              <input
                id="wizard-solution-title"
                type="text"
                aria-label="Tiêu đề bài giải tham chiếu"
                value={solutionTitle}
                onChange={(e) => setSolutionTitle(e.target.value)}
                placeholder="Ví dụ: Bài giải chuẩn PRF192 / PRO192 Reference Solution"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="wizard-expected-space-complexity" className="block font-bold text-slate-700 mb-1">
                Độ phức tạp bộ nhớ kỳ vọng (Big-O)
              </label>
              <input
                id="wizard-expected-space-complexity"
                type="text"
                aria-label="Độ phức tạp bộ nhớ kỳ vọng (Big-O)"
                value={expectedSpaceComplexity}
                onChange={(e) => setExpectedSpaceComplexity(e.target.value)}
                placeholder="VD: O(n), O(1)..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-mono font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="wizard-expected-complexity" className="block font-bold text-slate-700 mb-1">
                Độ phức tạp thuật toán kỳ vọng (Big-O)
              </label>
              <input
                id="wizard-expected-complexity"
                type="text"
                aria-label="Độ phức tạp thuật toán kỳ vọng (Big-O)"
                value={expectedComplexity}
                onChange={(e) => setExpectedComplexity(e.target.value)}
                placeholder="VD: O(n log n), O(n), O(1)..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-mono font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="wizard-solution-code" className="block font-bold text-slate-700 mb-1">
              Mã nguồn bài giải (Solution Code)
            </label>
            <textarea
              id="wizard-solution-code"
              rows={8}
              aria-label="Mã nguồn bài giải (Solution Code)"
              value={solutionCode}
              onChange={(e) => setSolutionCode(e.target.value)}
              placeholder="// Dán hoặc tải file mã nguồn bài giải chuẩn tại đây..."
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-800 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h2 className="font-extrabold text-sm text-slate-900">
              2. Quản Lý & Import Bộ Testcase ({testCases.length} cases)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenImportModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 shadow-sm transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              <span>Import Testcase (JSON / CSV)</span>
            </button>

            <button
              type="button"
              onClick={onAddBlankTestCase}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm thủ công</span>
            </button>
          </div>
        </div>

        {/* Standard: Strict PE Total Points Monitor & Question Breakdown */}
        {testCases.length > 0 && (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
              isExactTarget
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isExactTarget ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                />
                <span>
                  Điểm chức năng: {totalCalculatedPoints.toFixed(1)} / 7.0 • Thuật toán: 2.0 • Clean Code: 1.0
                </span>
                {isExactTarget ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    ✓ Đủ 7.0đ chức năng
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                    {totalCalculatedPoints < targetTestcaseMax
                      ? `Thiếu ${(targetTestcaseMax - totalCalculatedPoints).toFixed(1)}đ Testcases`
                      : `Dư ${(totalCalculatedPoints - targetTestcaseMax).toFixed(1)}đ Testcases`}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {uniqueQuestions.length} câu hỏi • 7 điểm kiểm tra kết quả • 2 điểm thuật toán • 1 điểm Clean Code.
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {uniqueQuestions.map((q) => {
                const qSum = testCases
                  .filter((tc) => (tc.questionNumber || 'Q1') === q)
                  .reduce((a, c) => a + (Number(c.points) || 0), 0);
                return (
                  <span
                    key={String(q)}
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200 font-mono text-[11px] font-bold text-slate-800 shadow-2xs"
                  >
                    {q}: {qSum.toFixed(1)}đ
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <TestcaseTable
          testCases={testCases}
          setTestCases={setTestCases}
          onAddBlankTestCase={onAddBlankTestCase}
          onOpenImportModal={onOpenImportModal}
          onDeleteTestCase={onDeleteTestCase}
        />
      </div>

      <WizardNavFooter
        onBack={onBack}
        backLabel="Quay lại Bước 2"
        onNext={() => {
          if (!isExactTarget) {
            window.alert('Tổng điểm test case phải đúng 7.0 điểm trước khi tiếp tục.');
            return;
          }
          onNext();
        }}
        nextLabel="Tiếp tục: Kiểm thử Sandbox & Lưu CSDL"
      />
    </div>
  );
};
