import { Upload, FileSpreadsheet, Plus, Archive, X, Sparkles } from 'lucide-react';
import { AssignmentEnv, TestCase } from '../../types/assignment.types';
import { TestcaseTable } from './TestcaseTable';
import { WizardNavFooter } from './WizardNavFooter';
import { ReactGradingStep } from './ReactGradingStep';

interface WizardStep3SolutionProps {
  environment: AssignmentEnv;
  courseCode: string;
  solutionTitle: string;
  setSolutionTitle: (val: string) => void;
  solutionCode: string;
  solutionZipName: string;
  solutionFiles: Array<{ path: string; content: string }>;
  onRemoveSolutionZip: () => void;
  expectedComplexity: string;
  setExpectedComplexity: (val: string) => void;
  expectedSpaceComplexity: string;
  setExpectedSpaceComplexity: (val: string) => void;
  acceptedStrategiesText: string;
  setAcceptedStrategiesText: (val: string) => void;
  algorithmNotes: string;
  setAlgorithmNotes: (val: string) => void;
  reactStructureRequirements: string;
  setReactStructureRequirements: (val: string) => void;
  reactCleanCodeRequirements: string;
  setReactCleanCodeRequirements: (val: string) => void;
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
  environment,
  courseCode,
  solutionTitle,
  setSolutionTitle,
  solutionCode,
  solutionZipName,
  solutionFiles,
  onRemoveSolutionZip,
  expectedComplexity,
  setExpectedComplexity,
  expectedSpaceComplexity,
  setExpectedSpaceComplexity,
  acceptedStrategiesText,
  setAcceptedStrategiesText,
  algorithmNotes,
  setAlgorithmNotes,
  reactStructureRequirements,
  setReactStructureRequirements,
  reactCleanCodeRequirements,
  setReactCleanCodeRequirements,
  handleSolutionFileUpload,
  testCases,
  setTestCases,
  onAddBlankTestCase,
  onOpenImportModal,
  onDeleteTestCase,
  onBack,
  onNext,
}) => {
  const isProCourse = courseCode.trim().toUpperCase() === 'PRO192';
  const targetTestcaseMax = 7.0;
  const totalCalculatedPoints = testCases.reduce((acc, cur) => acc + (Number(cur.points) || 0), 0);
  const isExactTarget = Math.abs(totalCalculatedPoints - targetTestcaseMax) < 0.01;
  const uniqueQuestions = Array.from(new Set(testCases.map((tc) => tc.questionNumber || 'Q1')));

  const handleScaleToTarget = () => {
    if (testCases.length === 0 || totalCalculatedPoints === 0) return;
    const factor = targetTestcaseMax / totalCalculatedPoints;
    let accumulated = 0;
    const updated = testCases.map((tc, index) => {
      if (index === testCases.length - 1) {
        const lastPoints = Math.round((targetTestcaseMax - accumulated) * 100) / 100;
        return { ...tc, points: Math.max(0.01, lastPoints) };
      }
      const scaled = Math.round(Number(tc.points) * factor * 100) / 100;
      accumulated += scaled;
      return { ...tc, points: Math.max(0.01, scaled) };
    });
    setTestCases(updated);
  };

  if (environment === 'REACT_JS') {
    return (
      <ReactGradingStep
        testCases={testCases}
        setTestCases={setTestCases}
        structureRequirements={reactStructureRequirements}
        setStructureRequirements={setReactStructureRequirements}
        cleanCodeRequirements={reactCleanCodeRequirements}
        setCleanCodeRequirements={setReactCleanCodeRequirements}
        onAddBlankTestCase={onAddBlankTestCase}
        onDeleteTestCase={onDeleteTestCase}
        onBack={onBack}
        onNext={onNext}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Role Banner clarifying Step 3 purpose */}
      <div className="flex items-center gap-3 p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-xs text-emerald-950 shadow-2xs">
        <div className="size-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
          🔒
        </div>
        <div>
          <span className="font-bold">Dữ liệu kiểm thử bảo mật của Giảng viên (Chỉ chạy trên Sandbox):</span>
          <p className="text-emerald-800/90 text-xs mt-0.5">
            Testcase chiếm 7 điểm và được Sandbox chạy thật. AI dùng ZIP đáp án cùng các tiêu chí bên dưới để đề xuất điểm thuật toán/thiết kế (2 điểm) và Clean Code (1 điểm); không yêu cầu code giống đáp án.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        {/* Header Card 1: Tiêu đề + Nút Upload tệp giải */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-blue-600"></span>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900">
                1. Bài Giải Tham Chiếu Chuẩn (Reference Solution)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Tải ZIP chứa một hoặc nhiều file lời giải C/Java; không cần dán từng file.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer flex items-center gap-1.5 transition shadow-2xs">
              <Upload className="size-3.5" />
              <span>Tải ZIP đáp án (.zip)</span>
              <input
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleSolutionFileUpload(f);
                }}
              />
            </label>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl font-bold border border-emerald-200">
              Đối sánh Sandbox
            </span>
          </div>
        </div>

        {/* Row 1: 3 Cột thông số thẳng hàng cân đối */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
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
              placeholder="Ví dụ: Bài giải chuẩn PRF192 / PRO192"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
            />
          </div>
          <div>
            <label htmlFor="wizard-expected-complexity" className="block font-bold text-slate-700 mb-1">
              {isProCourse ? 'Big-O tham khảo (nếu đề có thuật toán)' : 'Độ phức tạp thuật toán kỳ vọng (Time Big-O)'}
            </label>
            <input
              id="wizard-expected-complexity"
              type="text"
              aria-label="Độ phức tạp thuật toán kỳ vọng (Big-O)"
              value={expectedComplexity}
              onChange={(e) => setExpectedComplexity(e.target.value)}
              placeholder={isProCourse ? 'Không bắt buộc với bài OOP thuần' : 'VD: O(n log n), O(n), O(1)...'}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-mono font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
            />
          </div>
          <div>
            <label htmlFor="wizard-expected-space-complexity" className="block font-bold text-slate-700 mb-1">
              {isProCourse ? 'Bộ nhớ tham khảo (nếu cần)' : 'Độ phức tạp bộ nhớ kỳ vọng (Space Big-O)'}
            </label>
            <input
              id="wizard-expected-space-complexity"
              type="text"
              aria-label="Độ phức tạp bộ nhớ kỳ vọng (Big-O)"
              value={expectedSpaceComplexity}
              onChange={(e) => setExpectedSpaceComplexity(e.target.value)}
              placeholder={isProCourse ? 'Không bắt buộc với bài OOP thuần' : 'VD: O(n), O(1)...'}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-mono font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
            />
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50/50 p-4">
          {solutionFiles.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-blue-900">
                  <Archive className="size-4 shrink-0" />
                  <span className="truncate">{solutionZipName || 'Đáp án hiện có'}</span>
                  <span className="shrink-0 text-xs font-medium text-slate-500">({solutionFiles.length} file mã nguồn)</span>
                </div>
                <button type="button" onClick={onRemoveSolutionZip} className="flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50">
                  <X className="size-3.5" /> Gỡ ZIP
                </button>
              </div>
              <ul className="grid gap-1 sm:grid-cols-2">
                {solutionFiles.map((sourceFile) => (
                  <li key={sourceFile.path} className="truncate rounded-md bg-white px-2.5 py-1.5 font-mono text-[11px] text-slate-700" title={sourceFile.path}>{sourceFile.path}</li>
                ))}
              </ul>
            </div>
          ) : solutionCode ? (
            <div className="flex items-center justify-between gap-3 text-xs text-slate-700">
              <span>Đã có đáp án lưu trong đề ({solutionCode.split('\n').length} dòng). Tải ZIP mới nếu muốn thay thế.</span>
              <button type="button" onClick={onRemoveSolutionZip} className="shrink-0 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 font-bold text-rose-700 hover:bg-rose-50">Gỡ đáp án</button>
            </div>
          ) : (
            <p className="text-xs text-slate-600">Chưa tải đáp án. ZIP cần có file {environment === 'JAVA_JDK' ? '.java' : '.c hoặc .h'}; có thể chứa nhiều file và thư mục.</p>
          )}
        </div>

        {/* Row 3: Hướng giải & Ghi chú thuật toán được bố trí gọn gàng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <label htmlFor="wizard-accepted-strategies" className="block font-bold text-slate-700">
              {isProCourse ? 'Thiết kế / cách tiếp cận được chấp nhận' : 'Các hướng giải được chấp nhận (Accepted Strategies)'}
            </label>
            <textarea
              id="wizard-accepted-strategies"
              value={acceptedStrategiesText}
              onChange={(e) => setAcceptedStrategiesText(e.target.value)}
              rows={2}
              placeholder={isProCourse ? 'Ví dụ: dùng interface; tách trách nhiệm class; composition thay inheritance...' : 'Ví dụ: Merge sort, Quick sort, Heap sort...'}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400">{isProCourse ? 'Nêu thiết kế nào được chấp nhận; không ép sinh viên sao chép cấu trúc đáp án.' : 'Ngăn cách các hướng giải bằng dấu phẩy hoặc xuống dòng.'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <label htmlFor="wizard-algorithm-notes" className="block font-bold text-slate-700">
              {isProCourse ? 'Ghi chú chấm OOP / tiêu chí tương đương' : 'Ghi chú chấm thuật toán & Tiêu chí tương đương'}
            </label>
            <textarea
              id="wizard-algorithm-notes"
              value={algorithmNotes}
              onChange={(e) => setAlgorithmNotes(e.target.value)}
              rows={2}
              maxLength={4_000}
              placeholder={isProCourse ? 'Ví dụ: đánh giá encapsulation, cohesion; không trừ điểm nếu không dùng inheritance khi không cần...' : 'Tiêu chí thuật toán, giới hạn thời gian chạy hoặc cách giải tương đương...'}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400">Được lưu cùng phiên bản đề và đưa vào ngữ cảnh AI chấm; giảng viên vẫn duyệt điểm.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-blue-600"></span>
            <h2 className="font-extrabold text-sm text-slate-900">
              2. Quản Lý & Import Bộ Testcase ({testCases.length} cases)
            </h2>
          </div>

          {testCases.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenImportModal}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 shadow-2xs transition"
              >
                <FileSpreadsheet className="size-3.5 text-amber-600" />
                <span>Import cả bộ Testcase (JSON / CSV)</span>
              </button>

              <button
                type="button"
                onClick={onAddBlankTestCase}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition"
              >
                <Plus className="size-3.5" />
                <span>Thêm 1 testcase</span>
              </button>
            </div>
          )}
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
                  className={`size-2.5 rounded-full ${
                    isExactTarget ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                />
                <span>
                  Điểm chức năng: {totalCalculatedPoints.toFixed(1)} / 7.0 • Thuật toán: 2.0 • Clean Code: 1.0
                </span>
                {isExactTarget ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                    ✓ Đủ 7.0đ chức năng
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs">
                    {totalCalculatedPoints < targetTestcaseMax
                      ? `Thiếu ${(targetTestcaseMax - totalCalculatedPoints).toFixed(1)}đ Testcases`
                      : `Dư ${(totalCalculatedPoints - targetTestcaseMax).toFixed(1)}đ Testcases`}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {uniqueQuestions.length} câu hỏi • 7 điểm kiểm tra kết quả • 2 điểm thuật toán • 1 điểm Clean Code.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isExactTarget && totalCalculatedPoints > 0 && (
                <button
                  type="button"
                  onClick={handleScaleToTarget}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Sparkles className="size-3.5" />
                  <span>Quy đổi về 7.0đ</span>
                </button>
              )}
              {uniqueQuestions.map((q) => {
                const qSum = testCases
                  .filter((tc) => (tc.questionNumber || 'Q1') === q)
                  .reduce((a, c) => a + (Number(c.points) || 0), 0);
                return (
                  <span
                    key={String(q)}
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs font-bold text-slate-800 shadow-2xs"
                  >
                    {q}: {qSum.toFixed(1)}đ
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <TestcaseTable
          environment={environment}
          testCases={testCases}
          setTestCases={setTestCases}
          onAddBlankTestCase={onAddBlankTestCase}
          onOpenImportModal={onOpenImportModal}
          onDeleteTestCase={onDeleteTestCase}
        />
      </div>

      {!isExactTarget && totalCalculatedPoints > 0 && (
        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-950 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>
              ⚠️ Tổng điểm testcase hiện tại là <strong className="text-rose-700">{totalCalculatedPoints.toFixed(2)}đ / 7.0đ</strong>. Cần đúng 7.0đ để chuyển sang Bước 4 (chừa 2đ Thuật toán + 1đ Clean Code cho AI).
            </span>
          </div>
          <button
            type="button"
            onClick={handleScaleToTarget}
            className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Sparkles className="size-4" />
            <span>⚡ Quy đổi ngay về 7.0đ</span>
          </button>
        </div>
      )}

      <WizardNavFooter
        onBack={onBack}
        backLabel="Quay lại Bước 2"
        onNext={onNext}
        nextLabel="Tiếp tục: Kiểm thử Sandbox & Lưu CSDL"
      />
    </div>
  );
};
