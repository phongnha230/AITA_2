import { useState } from 'react';
import { TestCase } from '../types/assignment.types';

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getText = (record: JsonRecord, ...keys: string[]): string | undefined => {
  const value = keys.map((key) => record[key]).find((item) => typeof item === 'string' || typeof item === 'number');
  return value === undefined ? undefined : String(value);
};

const getNumber = (record: JsonRecord, ...keys: string[]): number | undefined => {
  const value = keys.map((key) => record[key]).find((item) => item !== undefined && item !== null && item !== '');
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toTestCase = (item: JsonRecord, index: number, questionNumber: string | number, questionTitle: string): TestCase => {
  const isHidden = Boolean(item.isHidden);
  const rationaleTag = item.rationaleTag;
  const allowedTags = ['FUNCTIONAL', 'BOUNDARY', 'EDGE', 'PERFORMANCE', 'SECURITY'] as const;
  const tag = typeof rationaleTag === 'string' && allowedTags.includes(rationaleTag as (typeof allowedTags)[number])
    ? rationaleTag as TestCase['rationaleTag']
    : isHidden ? 'EDGE' : 'FUNCTIONAL';
  return {
    orderIndex: index,
    questionNumber,
    questionTitle,
    label: getText(item, 'label', 'name') ?? `${questionNumber}_TC_${index}`,
    rationaleTag: tag,
    isHidden,
    timeLimitMs: getNumber(item, 'timeLimitMs') || 1500,
    memoryLimitKb: 262144,
    points: getNumber(item, 'points', 'score') ?? 1,
    comparisonMode: 'STDIO',
    stdinInput: getText(item, 'stdinInput', 'stdin', 'input') ?? '',
    expectedStdout: getText(item, 'expectedStdout', 'expected', 'expectedOutput') ?? '',
  };
};

export function useTestcaseImport(
  testCases: TestCase[],
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>
) {
  const [importModal, setImportModal] = useState(false);
  const [importType, setImportType] = useState<'json' | 'excel'>('json');
  const [jsonText, setJsonText] = useState('');
  const [previewTestCases, setPreviewTestCases] = useState<TestCase[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  // Parse CSV text into preview state
  const handleParseCsvForPreview = (csvString: string) => {
    setImportError(null);
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) {
      setImportError('File CSV không có dữ liệu hoặc thiếu dòng tiêu đề!');
      setPreviewTestCases([]);
      return;
    }
    const parsed: TestCase[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length >= 3) {
        parsed.push({
          orderIndex: i,
          label: parts[0] || `TC_CSV_${i}`,
          stdinInput: (parts[1] || '').replace(/\\n/g, '\n'),
          expectedStdout: (parts[2] || '').replace(/\\n/g, '\n'),
          points: Number(parts[3]) || 2.0,
          isHidden: parts[4]?.toLowerCase() === 'true',
          rationaleTag: 'FUNCTIONAL',
          timeLimitMs: 1500,
          memoryLimitKb: 262144,
          comparisonMode: 'STDIO',
        });
      }
    }
    if (parsed.length === 0) {
      setImportError('Không tìm thấy dòng testcase hợp lệ nào trong file CSV!');
    }
    setPreviewTestCases(parsed);
  };

  // Parse JSON text into preview state (Supports both nested Question format and flat testcases list)
  const handleParseJsonForPreview = (jsonString: string) => {
    setImportError(null);
    try {
      const parsed: unknown = JSON.parse(jsonString);
      let formatted: TestCase[] = [];

      if (Array.isArray(parsed)) {
        // Check if elements are Question containers (e.g. { question: "Q1", testCases: [...] })
        const rows = parsed.filter(isRecord);
        const hasQuestionContainers = rows.some((item) => Array.isArray(item.testCases) || Array.isArray(item.tests));

        if (hasQuestionContainers) {
          let globalIdx = 1;
          rows.forEach((qItem, qIdx) => {
            const qNum = getText(qItem, 'questionNumber', 'question') ?? `Q${qIdx + 1}`;
            const qTitle = getText(qItem, 'questionTitle', 'title') ?? `Câu hỏi ${qNum}`;
            const casesList = Array.isArray(qItem.testCases) ? qItem.testCases : Array.isArray(qItem.tests) ? qItem.tests : [];

            casesList.filter(isRecord).forEach((item, tcIdx) => {
              formatted.push(toTestCase(item, globalIdx++, qNum, qTitle || `Câu hỏi ${qNum}`));
            });
          });
        } else {
          // Flat list of testcases
          formatted = rows.map((item, idx) => {
            const questionNumber = getText(item, 'questionNumber', 'question') ?? `Q${Math.floor(idx / 3) + 1}`;
            return toTestCase(item, idx + 1, questionNumber, getText(item, 'questionTitle') ?? `Câu hỏi ${questionNumber}`);
          });
        }

        setPreviewTestCases(formatted);
      } else {
        setImportError('Dữ liệu JSON phải là một mảng [] danh sách các câu hỏi hoặc testcase!');
        setPreviewTestCases([]);
      }
    } catch (err: unknown) {
      console.error('Không thể phân tích dữ liệu testcase JSON:', err);
      setImportError(`Định dạng JSON không hợp lệ: ${err instanceof Error ? err.message : 'dữ liệu không hợp lệ'}`);
      setPreviewTestCases([]);
    }
  };

  // Confirm import from preview table into main testcase list
  const handleConfirmImport = () => {
    if (previewTestCases.length === 0) return;
    const reindexed = previewTestCases.map((tc, idx) => ({
      ...tc,
      orderIndex: testCases.length + idx + 1,
    }));
    setTestCases([...testCases, ...reindexed]);
    setImportModal(false);
    setPreviewTestCases([]);
    setJsonText('');
  };

  const openModal = () => {
    setImportModal(true);
    setPreviewTestCases([]);
    setImportError(null);
  };

  const closeModal = () => {
    setImportModal(false);
  };

  return {
    importModal,
    openModal,
    closeModal,
    importType,
    setImportType,
    jsonText,
    setJsonText,
    previewTestCases,
    setPreviewTestCases,
    importError,
    handleParseCsvForPreview,
    handleParseJsonForPreview,
    handleConfirmImport,
  };
}
