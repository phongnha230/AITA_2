export const webTestActions = [
  'GOTO',
  'FILL',
  'CLICK',
  'SELECT',
  'CHECK',
  'UNCHECK',
  'PRESS_KEY',
  'WAIT_FOR',
  'WAIT_FOR_TIMEOUT',
  'ASSERT_VISIBLE',
  'ASSERT_TEXT',
  'ASSERT_VALUE',
  'ASSERT_URL',
] as const;

export type WebTestAction = typeof webTestActions[number];

export interface WebActionStep {
  action: WebTestAction;
  target?: string;
  value?: string;
  expected?: string;
  timeoutMs?: number;
}

export const getWebAssertionPoints = (totalPoints: number, assertionCount: number, assertionIndex: number): number => {
  if (assertionCount <= 0 || assertionIndex < 0 || assertionIndex >= assertionCount) return 0;
  const basePoints = Math.floor((totalPoints / assertionCount) * 100) / 100;
  return assertionIndex === assertionCount - 1
    ? Number((totalPoints - (basePoints * (assertionCount - 1))).toFixed(2))
    : basePoints;
};

const actionSet = new Set<string>(webTestActions);
const targetActions = new Set<WebTestAction>([
  'GOTO', 'FILL', 'CLICK', 'SELECT', 'CHECK', 'UNCHECK', 'PRESS_KEY', 'WAIT_FOR',
  'ASSERT_VISIBLE', 'ASSERT_TEXT', 'ASSERT_VALUE',
]);
const valueActions = new Set<WebTestAction>(['FILL', 'SELECT', 'PRESS_KEY', 'WAIT_FOR_TIMEOUT']);
const expectedActions = new Set<WebTestAction>(['ASSERT_TEXT', 'ASSERT_VALUE', 'ASSERT_URL']);

const requireBoundedString = (
  value: unknown,
  field: string,
  stepIndex: number,
  maximumLength: number
): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Bước ${stepIndex + 1} thiếu ${field}.`);
  }
  if (value.length > maximumLength) {
    throw new Error(`Bước ${stepIndex + 1}: ${field} vượt quá ${maximumLength} ký tự.`);
  }
  return value;
};

export const parseWebTestScript = (inputData: string): WebActionStep[] => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(inputData);
  } catch (error) {
    throw new Error('Kịch bản Playwright phải là JSON hợp lệ.', { cause: error });
  }

  const rawSteps = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object'
      ? (parsed as { steps?: unknown }).steps
      : undefined;
  if (!Array.isArray(rawSteps) || rawSteps.length === 0) {
    throw new Error('Kịch bản Playwright phải có ít nhất một bước.');
  }
  if (rawSteps.length > 100) {
    throw new Error('Một kịch bản Playwright không được vượt quá 100 bước.');
  }

  return rawSteps.map((rawStep, stepIndex) => {
    if (!rawStep || typeof rawStep !== 'object') {
      throw new Error(`Bước ${stepIndex + 1} không hợp lệ.`);
    }
    const candidate = rawStep as Record<string, unknown>;
    if (typeof candidate.action !== 'string' || !actionSet.has(candidate.action)) {
      throw new Error(`Bước ${stepIndex + 1} có action không được hỗ trợ.`);
    }
    const action = candidate.action as WebTestAction;
    const step: WebActionStep = { action };

    if (targetActions.has(action)) {
      step.target = requireBoundedString(candidate.target, 'selector/đường dẫn', stepIndex, 1_000);
    }
    if (valueActions.has(action)) {
      step.value = requireBoundedString(candidate.value, 'giá trị', stepIndex, 4_000);
      if (action === 'WAIT_FOR_TIMEOUT') {
        const milliseconds = Number(step.value);
        if (!Number.isInteger(milliseconds) || milliseconds < 0 || milliseconds > 10_000) {
          throw new Error(`Bước ${stepIndex + 1}: thời gian chờ phải từ 0 đến 10000ms.`);
        }
      }
    }
    if (expectedActions.has(action)) {
      step.expected = requireBoundedString(candidate.expected, 'kết quả mong đợi', stepIndex, 4_000);
    }
    if (candidate.timeoutMs !== undefined) {
      const timeoutMs = Number(candidate.timeoutMs);
      if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 30_000) {
        throw new Error(`Bước ${stepIndex + 1}: timeout phải từ 100 đến 30000ms.`);
      }
      step.timeoutMs = timeoutMs;
    }
    return step;
  });
};
