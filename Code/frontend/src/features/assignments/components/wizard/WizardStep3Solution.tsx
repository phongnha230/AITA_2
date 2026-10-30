import { Upload, FileSpreadsheet, Plus, Archive, X, Sparkles, Trash2 } from 'lucide-react';
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
  const targetTestcaseMax = 10.0;
  const totalCalculatedPoints = testCases.reduce((acc, cur) => acc + (Number(cur.points) || 0), 0);
  const isExactTarget = Math.abs(totalCalculatedPoints - targetTestcaseMax) < 0.01;

  // Gom nhóm testcase theo từng câu hỏi (Q1, Q2... Q10)
  const questionMap = new Map<string, TestCase[]>();
  testCases.forEach((tc) => {
    const qKey = (tc.questionNumber ? String(tc.questionNumber).trim().toUpperCase() : 'Q1');
    if (!questionMap.has(qKey)) {
      questionMap.set(qKey, []);
    }
    questionMap.get(qKey)!.push(tc);
  });
  const uniqueQuestions = Array.from(questionMap.keys());

  const hasSampleCases = testCases.some((tc) => /^TC\d+_Q\d+_/i.test(tc.label));
  const hasJsonCases = testCases.some((tc) => /^Q\d+-T\d+/i.test(tc.label));

  // Lọc bỏ các testcase mẫu cũ nếu đã có testcase từ JSON
  const handlePurgeSampleCases = () => {
    const onlyJsonCases = testCases
      .filter((tc) => !/^TC\d+_Q\d+_/i.test(tc.label))
      .map((tc, idx) => ({ ...tc, orderIndex: idx + 1 }));
    setTestCases(onlyJsonCases);
  };

  // Chuẩn hóa điểm theo từng câu hỏi (ví dụ 10 câu -> mỗi câu đúng 1.0đ, tổng đúng 10.0đ)
  const handleNormalizePointsByQuestion = () => {
    if (testCases.length === 0) return;

    // Nếu phát hiện bị lẫn cả testcase mẫu (TC1_Q1...) và testcase từ JSON (Q1-T1...), tự động loại bỏ testcase mẫu!
    const effectiveCases = (hasSampleCases && hasJsonCases)
      ? testCases.filter((tc) => !/^TC\d+_Q\d+_/i.test(tc.label))
      : testCases;

    const currentQuestionMap = new Map<string, TestCase[]>();
    effectiveCases.forEach((tc) => {
      const qKey = (tc.questionNumber ? String(tc.questionNumber).trim().toUpperCase() : 'Q1');
      if (!currentQuestionMap.has(qKey)) {
        currentQuestionMap.set(qKey, []);
      }
      currentQuestionMap.get(qKey)!.push(tc);
    });
    const currentUniqueQuestions = Array.from(currentQuestionMap.keys());

    const qCount = currentUniqueQuestions.length || 1;
    const baseTargetPerQ = Math.round((targetTestcaseMax / qCount) * 100) / 100;

    let accumulatedTotalScore = 0;
    const updatedTestCases: TestCase[] = [];
    let globalIndex = 1;

    currentUniqueQuestions.forEach((qKey, qIdx) => {
      const qCases = currentQuestionMap.get(qKey) || [];
      const caseCount = qCases.length;
      if (caseCount === 0) return;

      const isLastQ = qIdx === currentUniqueQuestions.length - 1;
      const qTarget = isLastQ
        ? Math.max(0.01, Math.round((targetTestcaseMax - accumulatedTotalScore) * 100) / 100)
        : baseTargetPerQ;
      accumulatedTotalScore += qTarget;

      let accInQ = 0;
      qCases.forEach((tc, cIdx) => {
        let pts: number;
        if (cIdx === caseCount - 1) {
          pts = Math.round((qTarget - accInQ) * 100) / 100;
        } else {
          pts = Math.round((qTarget / caseCount) * 100) / 100;
          accInQ += pts;
        }
        updatedTestCases.push({
          ...tc,
          orderIndex: globalIndex++,
          questionNumber: qKey,
          points: Math.max(0.01, pts),
        });
      });
    });

    setTestCases(updatedTestCases);
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
            Testcase chức năng chiếm trọn thang điểm 10.0đ và được Sandbox chạy thật. AI dùng ZIP đáp án cùng các tiêu chí bên dưới để audit phát hiện gian lận/hardcode và trừ điểm phạt nếu vi phạm.
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
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <FileSpreadsheet className="size-3.5 text-amber-600" />
                <span>Import cả bộ Testcase (JSON / CSV)</span>
              </button>

              <button
                type="button"
                onClick={onAddBlankTestCase}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Thêm 1 testcase</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ testcase để nạp lại từ đầu?')) {
                    setTestCases([]);
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 transition cursor-pointer"
                title="Xóa toàn bộ testcase trong bảng để import lại từ file JSON"
              >
                <Trash2 className="size-3.5 text-rose-600" />
                <span>Xóa tất cả</span>
              </button>
            </div>
          )}
        </div>

        {/* Standard: Strict PE Total Points Monitor & Question Breakdown */}
        {testCases.length > 0 && (
          <div
            className={`p-4 rounded-xl border flex flex-col gap-3 text-xs transition ${
              isExactTarget
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : totalCalculatedPoints > targetTestcaseMax
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            {/* Tầng 1: Trạng thái điểm & Các nút hành động */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`size-2.5 rounded-full ${
                      isExactTarget
                        ? 'bg-emerald-500'
                        : totalCalculatedPoints > targetTestcaseMax
                        ? 'bg-rose-500 animate-pulse'
                        : 'bg-amber-500 animate-pulse'
                    }`}
                  />
                  <span className="text-sm font-extrabold text-slate-900">
                    Thang điểm Khảo thí: 10.0đ
                  </span>
                  {isExactTarget ? (
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                      ✓ Đạt chuẩn 10.0đ ({uniqueQuestions.length} câu, mỗi câu {(10 / (uniqueQuestions.length || 1)).toFixed(1)}đ)
                    </span>
                  ) : totalCalculatedPoints > targetTestcaseMax ? (
                    <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-xs">
                      ⚠️ Bị thừa testcase cũ (+{(totalCalculatedPoints - targetTestcaseMax).toFixed(2)}đ)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs">
                      ⚠️ Chưa đủ testcase (Thiếu {(targetTestcaseMax - totalCalculatedPoints).toFixed(2)}đ)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {uniqueQuestions.length} câu hỏi • Thang điểm chuẩn tối đa 10.0đ (mỗi câu 1.0đ) • AI Audit chỉ trừ phạt nếu phát hiện vi phạm/hardcode.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {hasSampleCases && hasJsonCases && (
                  <button
                    type="button"
                    onClick={handlePurgeSampleCases}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    title="Xóa các testcase mẫu bị lẫn, chỉ giữ đúng 57 testcase từ file JSON"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Lọc bỏ testcase mẫu (Chỉ giữ file JSON)</span>
                  </button>
                )}

                {!isExactTarget && (
                  <button
                    type="button"
                    onClick={handleNormalizePointsByQuestion}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    title="Chia đều điểm chuẩn theo từng câu hỏi: 10 câu = mỗi câu đúng 1.0đ"
                  >
                    <Sparkles className="size-3.5" />
                    <span>✨ Chuẩn hóa 1.0đ / câu (Tổng 10.0đ)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tầng 2: Lưới hiển thị chi tiết điểm theo từng câu hỏi (Không bị tràn/bóp méo) */}
            <div className="pt-2.5 border-t border-slate-200/60">
              <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                <span>PHÂN BỔ ĐIỂM THEO CÂU HỎI ({uniqueQuestions.length} câu):</span>
                {!isExactTarget && (
                  <span className="text-amber-700 font-semibold">Bấm nút "Chuẩn hóa" để tự động cân bằng 1.0đ cho mỗi câu</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {uniqueQuestions.map((q) => {
                  const qCases = questionMap.get(q) || [];
                  const qSum = qCases.reduce((a, c) => a + (Number(c.points) || 0), 0);
                  const targetPerQ = 10 / (uniqueQuestions.length || 1);
                  const isQExact = Math.abs(qSum - targetPerQ) < 0.05;
                  return (
                    <span
                      key={String(q)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border transition ${
                        isQExact
                          ? 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                          : qSum > targetPerQ + 0.05
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : 'bg-amber-50 border-amber-300 text-amber-800'
                      }`}
                    >
                      {q}: {qSum.toFixed(2)}đ ({qCases.length} cases)
                    </span>
                  );
                })}
              </div>
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
            <span className="size-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>
              ⚠️ Đề thi cần đạt chuẩn đúng <strong>10.0đ (10 câu, mỗi câu 1.0đ)</strong> trước khi chuyển sang Bước 4. Bấm nút bên cạnh để tự động làm sạch và cân bằng chuẩn 10.0đ.
            </span>
          </div>
          <button
            type="button"
            onClick={handleNormalizePointsByQuestion}
            className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Sparkles className="size-4" />
            <span>⚡ Chuẩn hóa 1.0đ / câu (Tổng 10.0đ)</span>
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
