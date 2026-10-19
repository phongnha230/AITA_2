import type { Dispatch, SetStateAction } from 'react';
import { Braces, CheckCircle2, CodeXml, PlayCircle, Sparkles } from 'lucide-react';
import type { TestCase } from '../../types/assignment.types';
import { WebTestcaseBuilder } from './WebTestcaseBuilder';
import { WizardNavFooter } from './WizardNavFooter';

interface ReactGradingStepProps {
  testCases: TestCase[];
  setTestCases: Dispatch<SetStateAction<TestCase[]>>;
  structureRequirements: string;
  setStructureRequirements: (value: string) => void;
  cleanCodeRequirements: string;
  setCleanCodeRequirements: (value: string) => void;
  onAddBlankTestCase: () => void;
  onDeleteTestCase: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export function ReactGradingStep({
  testCases,
  setTestCases,
  structureRequirements,
  setStructureRequirements,
  cleanCodeRequirements,
  setCleanCodeRequirements,
  onAddBlankTestCase,
  onDeleteTestCase,
  onBack,
  onNext,
}: ReactGradingStepProps) {
  const functionalPoints = testCases.reduce((total, testCase) => total + (Number(testCase.points) || 0), 0);
  const hasExactFunctionalScore = Math.abs(functionalPoints - 7) < 0.01;

  const handleNext = () => {
    if (testCases.length === 0 || !hasExactFunctionalScore) {
      window.alert(`Các luồng Playwright phải có tổng đúng 7.0 điểm; hiện tại là ${functionalPoints.toFixed(1)}.`);
      return;
    }
    if (structureRequirements.trim().length < 20 || cleanCodeRequirements.trim().length < 20) {
      window.alert('Vui lòng mô tả rõ tiêu chí cấu trúc React và Clean Code trước khi tiếp tục.');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-indigo-600" />
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Grading profile riêng cho FER201</h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Không dùng stdin/stdout, Big-O hay đáp án code mẫu. Hệ thống chạy đúng luồng giao diện do giảng viên cấu hình,
              sau đó AI chỉ đọc tập file React quan trọng trong giới hạn dung lượng để chấm cấu trúc và Clean Code.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="bg-white p-3">
            <PlayCircle className="size-4 text-blue-600" />
            <p className="mt-2 text-xs font-bold text-slate-900">7 điểm chức năng</p>
            <p className="mt-1 text-xs text-slate-500">Playwright chạy URL deploy theo form bên dưới.</p>
          </div>
          <div className="bg-white p-3">
            <Braces className="size-4 text-violet-600" />
            <p className="mt-2 text-xs font-bold text-slate-900">2 điểm cấu trúc React</p>
            <p className="mt-1 text-xs text-slate-500">Hooks, state, component boundaries, routing/context.</p>
          </div>
          <div className="bg-white p-3">
            <CodeXml className="size-4 text-emerald-600" />
            <p className="mt-2 text-xs font-bold text-slate-900">1 điểm Clean Code</p>
            <p className="mt-1 text-xs text-slate-500">Naming, duplication, readability và maintainability.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">1. Luồng chức năng trên URL deploy</h2>
            <p className="mt-1 text-xs text-slate-500">
              Giảng viên quyết định Playwright phải mở trang nào, điền gì, click gì và kiểm tra kết quả nào.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddBlankTestCase}
            className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
          >
            Thêm luồng kiểm thử
          </button>
        </div>

        <div className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
          hasExactFunctionalScore
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}>
          <span className="font-bold">Tổng điểm Playwright: {functionalPoints.toFixed(1)} / 7.0</span>
          {hasExactFunctionalScore && <CheckCircle2 className="size-4" />}
        </div>

        <WebTestcaseBuilder
          testCases={testCases}
          setTestCases={setTestCases}
          onAddBlankTestCase={onAddBlankTestCase}
          onDeleteTestCase={onDeleteTestCase}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900">2. Tiêu chí đọc source có giới hạn</h2>
          <p className="mt-1 text-xs text-slate-500">
            AI ưu tiên package.json, entry point, router, context/store, hooks, pages/features và component chính; không gửi toàn bộ repository.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label htmlFor="react-structure-requirements" className="mb-1.5 block text-xs font-bold text-violet-800">
              Cấu trúc & kiến trúc React — 2.0 điểm
            </label>
            <textarea
              id="react-structure-requirements"
              rows={6}
              maxLength={4_000}
              value={structureRequirements}
              onChange={(event) => setStructureRequirements(event.target.value)}
              placeholder="Ví dụ: dùng hooks đúng dependency, tách component hợp lý, quản lý state và routing rõ ràng..."
              className="w-full rounded-xl border border-violet-200 bg-violet-50/40 p-3 text-base leading-5 focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="react-clean-code-requirements" className="mb-1.5 block text-xs font-bold text-emerald-800">
              Clean Code React — 1.0 điểm
            </label>
            <textarea
              id="react-clean-code-requirements"
              rows={6}
              maxLength={4_000}
              value={cleanCodeRequirements}
              onChange={(event) => setCleanCodeRequirements(event.target.value)}
              placeholder="Ví dụ: naming rõ ràng, tránh component quá lớn, không lặp logic, xử lý loading/error/empty state..."
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 text-base leading-5 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <WizardNavFooter
        onBack={onBack}
        backLabel="Quay lại Bước 2"
        onNext={handleNext}
        nextLabel="Tiếp tục: Rà soát cấu hình chấm React"
      />
    </div>
  );
}
