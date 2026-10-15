import type { Dispatch, SetStateAction } from 'react';
import { ArrowDown, ArrowUp, EyeOff, Plus, ShieldAlert, Trash2, WandSparkles } from 'lucide-react';
import type {
  RationaleTag,
  TestCase,
  WebTestAction,
  WebTestScript,
  WebTestStep,
} from '../../types/assignment.types';

interface WebTestcaseBuilderProps {
  testCases: TestCase[];
  setTestCases: Dispatch<SetStateAction<TestCase[]>>;
  onAddBlankTestCase: () => void;
  onDeleteTestCase: (index: number) => void;
}

const actionOptions: Array<{ value: WebTestAction; label: string }> = [
  { value: 'GOTO', label: 'Mở trang' },
  { value: 'FILL', label: 'Điền input' },
  { value: 'CLICK', label: 'Click' },
  { value: 'SELECT', label: 'Chọn option' },
  { value: 'CHECK', label: 'Tick checkbox/radio' },
  { value: 'UNCHECK', label: 'Bỏ tick' },
  { value: 'PRESS_KEY', label: 'Nhấn phím' },
  { value: 'WAIT_FOR', label: 'Chờ element' },
  { value: 'WAIT_FOR_TIMEOUT', label: 'Chờ theo thời gian' },
  { value: 'ASSERT_VISIBLE', label: 'Kiểm tra hiển thị' },
  { value: 'ASSERT_TEXT', label: 'Kiểm tra nội dung' },
  { value: 'ASSERT_VALUE', label: 'Kiểm tra giá trị input' },
  { value: 'ASSERT_URL', label: 'Kiểm tra URL' },
];

const targetActions = new Set<WebTestAction>([
  'GOTO', 'FILL', 'CLICK', 'SELECT', 'CHECK', 'UNCHECK', 'PRESS_KEY', 'WAIT_FOR',
  'ASSERT_VISIBLE', 'ASSERT_TEXT', 'ASSERT_VALUE',
]);
const valueActions = new Set<WebTestAction>(['FILL', 'SELECT', 'PRESS_KEY', 'WAIT_FOR_TIMEOUT']);
const expectedActions = new Set<WebTestAction>(['ASSERT_TEXT', 'ASSERT_VALUE', 'ASSERT_URL']);

const parseScript = (raw: string | null | undefined): WebTestScript => {
  if (!raw?.trim()) return { version: 1, steps: [] };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return { version: 1, steps: parsed as WebTestStep[] };
    }
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { steps?: unknown }).steps)) {
      return { version: 1, steps: (parsed as { steps: WebTestStep[] }).steps };
    }
  } catch {
    // Invalid legacy content is shown as an empty scenario and replaced on the first edit.
  }
  return { version: 1, steps: [] };
};

const serializeScript = (steps: WebTestStep[]): string => JSON.stringify({ version: 1, steps });

const loginTemplate: WebTestStep[] = [
  { action: 'GOTO', target: '/login', timeoutMs: 15_000 },
  { action: 'FILL', target: 'input[name="email"]', value: 'student@example.com' },
  { action: 'FILL', target: 'input[name="password"]', value: 'replace-with-test-password' },
  { action: 'CLICK', target: 'button[type="submit"]' },
  { action: 'WAIT_FOR', target: '[data-testid="dashboard"]', timeoutMs: 10_000 },
  { action: 'ASSERT_URL', expected: '/dashboard' },
];

const getTargetPlaceholder = (action: WebTestAction): string => {
  if (action === 'GOTO') return '/login hoặc /products';
  return 'CSS selector, ví dụ: [data-testid="submit"]';
};

const getValuePlaceholder = (action: WebTestAction): string => {
  if (action === 'WAIT_FOR_TIMEOUT') return '1000';
  if (action === 'PRESS_KEY') return 'Enter';
  if (action === 'SELECT') return 'Giá trị option';
  return 'Dữ liệu cần điền';
};

export function WebTestcaseBuilder({
  testCases,
  setTestCases,
  onAddBlankTestCase,
  onDeleteTestCase,
}: WebTestcaseBuilderProps) {
  const updateTestCase = (index: number, patch: Partial<TestCase>) => {
    setTestCases((current) => current.map((testCase, itemIndex) => (
      itemIndex === index ? { ...testCase, ...patch } : testCase
    )));
  };

  const updateSteps = (testCaseIndex: number, updater: (steps: WebTestStep[]) => WebTestStep[]) => {
    setTestCases((current) => current.map((testCase, itemIndex) => {
      if (itemIndex !== testCaseIndex) return testCase;
      const nextSteps = updater(parseScript(testCase.stdinInput).steps);
      return { ...testCase, stdinInput: serializeScript(nextSteps) };
    }));
  };

  if (testCases.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-8 text-center">
        <WandSparkles className="mx-auto mb-2 h-9 w-9 text-indigo-400" />
        <p className="text-sm font-bold text-slate-800">Chưa có kịch bản Playwright</p>
        <p className="mx-auto mt-1 max-w-xl text-xs text-slate-500">
          Tạo từng luồng như đăng nhập, thêm sản phẩm, lọc danh sách hoặc checkout. Playwright chỉ chạy đúng các bước bạn cấu hình.
        </p>
        <button
          type="button"
          onClick={onAddBlankTestCase}
          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
        >
          Tạo kịch bản đầu tiên
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Dùng tài khoản test riêng và bật <strong>Test ẩn</strong> cho kịch bản chứa mật khẩu. Runner không ghi giá trị của bước Điền input vào log.
        </p>
      </div>

      {testCases.map((testCase, testCaseIndex) => {
        const steps = parseScript(testCase.stdinInput).steps;
        return (
          <section key={testCase.id ?? `web-test-${testCaseIndex}`} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[1fr_130px_130px_auto]">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600">Tên luồng kiểm thử</label>
                <input
                  value={testCase.label}
                  onChange={(event) => updateTestCase(testCaseIndex, { label: event.target.value })}
                  placeholder="Ví dụ: Đăng nhập thành công"
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600">Phân loại</label>
                <select
                  value={testCase.rationaleTag}
                  onChange={(event) => updateTestCase(testCaseIndex, { rationaleTag: event.target.value as RationaleTag })}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs"
                >
                  <option value="FUNCTIONAL">Functional</option>
                  <option value="BOUNDARY">Boundary</option>
                  <option value="EDGE">Edge case</option>
                  <option value="SECURITY">Security</option>
                  <option value="PERFORMANCE">Performance</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600">Điểm</label>
                <input
                  type="number"
                  min="0.1"
                  max="7"
                  step="0.1"
                  value={testCase.points}
                  onChange={(event) => updateTestCase(testCaseIndex, { points: Math.max(0, Number(event.target.value) || 0) })}
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs font-bold text-indigo-700"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => updateTestCase(testCaseIndex, { isHidden: !testCase.isHidden })}
                  className={`flex h-9 items-center gap-1 rounded-lg border px-3 text-[11px] font-bold ${
                    testCase.isHidden
                      ? 'border-purple-200 bg-purple-50 text-purple-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  {testCase.isHidden ? 'Test ẩn' : 'Công khai'}
                </button>
                <button
                  type="button"
                  aria-label="Xóa kịch bản"
                  onClick={() => onDeleteTestCase(testCaseIndex)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 p-4">
              {steps.length === 0 && (
                <p className="rounded-lg bg-rose-50 p-2 text-xs font-medium text-rose-700">
                  Kịch bản chưa có bước nào. Assignment sẽ không thể công bố cho đến khi thêm bước hợp lệ.
                </p>
              )}
              {steps.map((step, stepIndex) => (
                <div key={`${testCaseIndex}-${stepIndex}`} className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2 lg:grid-cols-[34px_165px_1fr_1fr_90px_92px]">
                  <span className="flex h-9 items-center justify-center rounded-lg bg-white font-mono text-xs font-bold text-slate-400">
                    {stepIndex + 1}
                  </span>
                  <select
                    aria-label={`Hành động bước ${stepIndex + 1}`}
                    value={step.action}
                    onChange={(event) => updateSteps(testCaseIndex, (current) => current.map((item, itemIndex) => (
                      itemIndex === stepIndex ? { action: event.target.value as WebTestAction } : item
                    )))}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold"
                  >
                    {actionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>

                  {targetActions.has(step.action) ? (
                    <input
                      aria-label={`Selector hoặc đường dẫn bước ${stepIndex + 1}`}
                      value={step.target ?? ''}
                      onChange={(event) => updateSteps(testCaseIndex, (current) => current.map((item, itemIndex) => (
                        itemIndex === stepIndex ? { ...item, target: event.target.value } : item
                      )))}
                      placeholder={getTargetPlaceholder(step.action)}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-3 font-mono text-[11px]"
                    />
                  ) : <span className="hidden lg:block" />}

                  {valueActions.has(step.action) ? (
                    <input
                      aria-label={`Giá trị bước ${stepIndex + 1}`}
                      type={step.action === 'FILL' && /password/i.test(step.target ?? '') ? 'password' : 'text'}
                      value={step.value ?? ''}
                      onChange={(event) => updateSteps(testCaseIndex, (current) => current.map((item, itemIndex) => (
                        itemIndex === stepIndex ? { ...item, value: event.target.value } : item
                      )))}
                      placeholder={getValuePlaceholder(step.action)}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs"
                    />
                  ) : expectedActions.has(step.action) ? (
                    <input
                      aria-label={`Kết quả mong đợi bước ${stepIndex + 1}`}
                      value={step.expected ?? ''}
                      onChange={(event) => updateSteps(testCaseIndex, (current) => current.map((item, itemIndex) => (
                        itemIndex === stepIndex ? { ...item, expected: event.target.value } : item
                      )))}
                      placeholder="Kết quả mong đợi"
                      className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs"
                    />
                  ) : <span className="hidden lg:block" />}

                  <input
                    type="number"
                    min="100"
                    max="30000"
                    step="100"
                    aria-label={`Timeout bước ${stepIndex + 1}`}
                    value={step.timeoutMs ?? 10_000}
                    onChange={(event) => updateSteps(testCaseIndex, (current) => current.map((item, itemIndex) => (
                      itemIndex === stepIndex ? { ...item, timeoutMs: Number(event.target.value) || 10_000 } : item
                    )))}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"
                    title="Timeout (ms)"
                  />

                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      aria-label="Đưa bước lên"
                      disabled={stepIndex === 0}
                      onClick={() => updateSteps(testCaseIndex, (current) => {
                        const next = [...current];
                        [next[stepIndex - 1], next[stepIndex]] = [next[stepIndex], next[stepIndex - 1]];
                        return next;
                      })}
                      className="rounded p-1.5 text-slate-400 hover:bg-white disabled:opacity-30"
                    ><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button
                      type="button"
                      aria-label="Đưa bước xuống"
                      disabled={stepIndex === steps.length - 1}
                      onClick={() => updateSteps(testCaseIndex, (current) => {
                        const next = [...current];
                        [next[stepIndex], next[stepIndex + 1]] = [next[stepIndex + 1], next[stepIndex]];
                        return next;
                      })}
                      className="rounded p-1.5 text-slate-400 hover:bg-white disabled:opacity-30"
                    ><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button
                      type="button"
                      aria-label="Xóa bước"
                      onClick={() => updateSteps(testCaseIndex, (current) => current.filter((_, itemIndex) => itemIndex !== stepIndex))}
                      className="rounded p-1.5 text-rose-400 hover:bg-rose-50"
                    ><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => updateSteps(testCaseIndex, (current) => [...current, { action: 'CLICK', target: '' }])}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:border-indigo-300"
                >
                  <Plus className="h-3.5 w-3.5" /> Thêm bước
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateTestCase(testCaseIndex, {
                      label: 'Đăng nhập thành công',
                      isHidden: true,
                      stdinInput: serializeScript(loginTemplate),
                    });
                  }}
                  className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  <WandSparkles className="h-3.5 w-3.5" /> Dùng mẫu đăng nhập
                </button>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
