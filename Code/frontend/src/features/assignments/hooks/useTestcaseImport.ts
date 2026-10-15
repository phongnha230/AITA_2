import { useState } from 'react';
import { TestCase } from '../types/assignment.types';

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
      const parsed = JSON.parse(jsonString);
      let formatted: TestCase[] = [];

      if (Array.isArray(parsed)) {
        // Check if elements are Question containers (e.g. { question: "Q1", testCases: [...] })
        const hasQuestionContainers = parsed.some((item) => item && (Array.isArray(item.testCases) || Array.isArray(item.tests)));

        if (hasQuestionContainers) {
          let globalIdx = 1;
          parsed.forEach((qItem: any, qIdx: number) => {
            const qNum = qItem.questionNumber || qItem.question || `Q${qIdx + 1}`;
            const qTitle = qItem.questionTitle || qItem.title || `Câu hỏi ${qNum}`;
            const casesList = Array.isArray(qItem.testCases) ? qItem.testCases : (Array.isArray(qItem.tests) ? qItem.tests : []);

            casesList.forEach((item: any, tcIdx: number) => {
              formatted.push({
                orderIndex: globalIdx++,
                questionNumber: qNum,
                questionTitle: qTitle,
                label: item.label || item.name || `${qNum}_TC_${tcIdx + 1}`,
                rationaleTag: item.rationaleTag || (item.isHidden ? 'EDGE' : 'FUNCTIONAL'),
                isHidden: Boolean(item.isHidden),
                timeLimitMs: Number(item.timeLimitMs) || 1500,
                memoryLimitKb: 262144,
                points: Number(item.points !== undefined ? item.points : (item.score !== undefined ? item.score : 1.0)),
                comparisonMode: 'STDIO',
                stdinInput: item.stdinInput || item.stdin || item.input || '',
                expectedStdout: item.expectedStdout || item.expected || item.expectedOutput || '',
              });
            });
          });
        } else {
          // Flat list of testcases
          formatted = parsed.map((item, idx) => ({
            orderIndex: idx + 1,
            questionNumber: item.questionNumber || item.question || `Q${Math.floor(idx / 3) + 1}`,
            questionTitle: item.questionTitle || `Câu hỏi ${item.questionNumber || Math.floor(idx / 3) + 1}`,
            label: item.label || item.name || `TC_${idx + 1}`,
            rationaleTag: item.rationaleTag || 'FUNCTIONAL',
            isHidden: Boolean(item.isHidden),
            timeLimitMs: Number(item.timeLimitMs) || 1500,
            memoryLimitKb: 262144,
            points: Number(item.points !== undefined ? item.points : (item.score !== undefined ? item.score : 2.0)),
            comparisonMode: 'STDIO',
            stdinInput: item.stdinInput || item.stdin || item.input || '',
            expectedStdout: item.expectedStdout || item.expected || item.expectedOutput || '',
          }));
        }

        setPreviewTestCases(formatted);
      } else {
        setImportError('Dữ liệu JSON phải là một mảng [] danh sách các câu hỏi hoặc testcase!');
        setPreviewTestCases([]);
      }
    } catch (err: any) {
      setImportError(`Định dạng JSON không hợp lệ: ${err.message}`);
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
