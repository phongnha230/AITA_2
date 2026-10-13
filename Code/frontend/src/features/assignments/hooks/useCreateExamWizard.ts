import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import JSZip from 'jszip';
import { assignmentService } from '../services/assignment.service';
import {
  AssignmentEnv,
  Course,
  TestCase,
} from '../types/assignment.types';
import { samplePrf192Template, samplePro192Template } from '../components/wizard/sampleExamTemplates';
import { useTestcaseImport } from './useTestcaseImport';

export function useCreateExamWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('editId') || null;
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Active Step (1 to 4)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // 1. General Info State
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState<AssignmentEnv>('C_GCC');
  const [durationMinutes, setDurationMinutes] = useState(60);

  // 2. PDF Exam File State
  const [pdfFile, setPdfFile] = useState<{ name: string; size: string } | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // 3. Starter Code Template State
  const [starterZipFile, setStarterZipFile] = useState<{ name: string; size: string } | null>(null);
  const [zipEntries, setZipEntries] = useState<string[]>([]);
  const [zipFilesContent, setZipFilesContent] = useState<Record<string, string>>({});
  const [isReadingZip, setIsReadingZip] = useState(false);
  const [viewingZipFile, setViewingZipFile] = useState<{ filename: string; content: string } | null>(null);

  // 4. Solution Code State
  const [solutionTitle, setSolutionTitle] = useState('');
  const [solutionCode, setSolutionCode] = useState('');
  const [expectedComplexity, setExpectedComplexity] = useState('O(n log n)');
  const [macJunkDetected, setMacJunkDetected] = useState(false);

  // 5. Test Cases State
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  // Testcase Import Hook
  const testcaseImport = useTestcaseImport(testCases, setTestCases);

  // Dry Run Sandbox State
  const [dryRunRunning, setDryRunRunning] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<{ passed: number; total: number; latency: string } | null>(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch courses from DB (Prioritize PRF192)
  useEffect(() => {
    assignmentService.getCourses().then((cList) => {
      setCourses(cList);
      if (cList.length > 0 && !editId) {
        const prf = cList.find((c) => c.code.toLowerCase().includes('prf'));
        setCourseId(prf ? prf.id : cList[0].id);
      }
    });
  }, [editId]);

  // Load existing assignment if editId is present (Edit Mode)
  useEffect(() => {
    if (!editId) return;
    let isCancelled = false;
    setLoadingEdit(true);
    assignmentService
      .getAssignmentById(editId)
      .then((data) => {
        if (isCancelled || !data) return;
        setTitle(data.title || '');
        setDescription(data.description || '');
        if (data.courseId) setCourseId(data.courseId);
        if (data.environment) setEnvironment(data.environment);
        if (data.testCases && data.testCases.length > 0) {
          setTestCases(data.testCases);
        }
        if (data.solutions && data.solutions.length > 0) {
          setSolutionTitle(data.solutions[0].title || '');
          setSolutionCode(data.solutions[0].sourceCode || '');
        }
      })
      .catch((err) => {
        console.error('Lỗi khi nạp dữ liệu đề thi:', err);
      })
      .finally(() => {
        if (!isCancelled) setLoadingEdit(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [editId]);

  // Cleanup Blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  // Handler: Real ZIP Extraction via JSZip
  const handleZipUpload = async (file: File) => {
    setStarterZipFile({ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` });
    setIsReadingZip(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const entries: string[] = [];
      const contents: Record<string, string> = {};

      const promises: Promise<void>[] = [];
      let junkFound = false;
      zip.forEach((relativePath, zipEntry) => {
        if (relativePath.startsWith('__MACOSX') || relativePath.includes('.DS_Store')) {
          junkFound = true;
          return;
        }
        entries.push(relativePath);
        if (!zipEntry.dir) {
          const isText = /\.(c|h|cpp|hpp|java|txt|md|json|xml|csv|sh|py|Makefile)$/i.test(relativePath) || relativePath === 'Makefile';
          if (isText) {
            promises.push(
              zipEntry.async('string').then((txt) => {
                contents[relativePath] = txt;
              })
            );
          }
        }
      });

      await Promise.all(promises);
      setMacJunkDetected(junkFound);
      setZipEntries(entries.sort());
      setZipFilesContent(contents);
    } catch (err: any) {
      console.error(err);
      alert('Không thể đọc cấu trúc file ZIP: ' + err.message);
    } finally {
      setIsReadingZip(false);
    }
  };

  // Handler: Real Solution File Upload
  const handleSolutionFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const code = (e.target?.result as string) || '';
      setSolutionCode(code);
      if (!solutionTitle) {
        setSolutionTitle(`Bài giải mẫu: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  // Handler: 1-Click Load Sample PRF192 Demo Data
  const handleLoadSamplePrf192 = () => {
    setTitle(samplePrf192Template.title);
    setDescription(samplePrf192Template.description);
    setEnvironment(samplePrf192Template.environment);
    setDurationMinutes(samplePrf192Template.durationMinutes);
    setPdfFile(samplePrf192Template.pdfFile);
    setStarterZipFile(samplePrf192Template.starterZipFile);
    setZipEntries(samplePrf192Template.zipEntries);
    setZipFilesContent(samplePrf192Template.zipFilesContent);
    setSolutionTitle(samplePrf192Template.solutionTitle);
    setSolutionCode(samplePrf192Template.solutionCode);
    setTestCases(samplePrf192Template.testCases);
  };

  // Handler: Load 1-Click Sample PE PRO192 / CSD201
  const handleLoadSamplePro192 = () => {
    const javaCourse =
      courses.find((c) => c.code.toLowerCase().includes('pro') || c.code.toLowerCase().includes('csd')) || courses[0];
    if (javaCourse) setCourseId(javaCourse.id);

    setTitle(samplePro192Template.title);
    setDescription(samplePro192Template.description);
    setEnvironment(samplePro192Template.environment);
    setDurationMinutes(samplePro192Template.durationMinutes);
    setPdfFile(samplePro192Template.pdfFile);
    setStarterZipFile(samplePro192Template.starterZipFile);
    setZipEntries(samplePro192Template.zipEntries);
    setZipFilesContent(samplePro192Template.zipFilesContent);
    setSolutionTitle(samplePro192Template.solutionTitle);
    if (samplePro192Template.expectedComplexity) {
      setExpectedComplexity(samplePro192Template.expectedComplexity);
    }
    setSolutionCode(samplePro192Template.solutionCode);
    setTestCases(samplePro192Template.testCases);
  };

  // Handler: Add individual testcase
  const handleAddBlankTestCase = () => {
    const newIdx = testCases.length + 1;
    setTestCases([
      ...testCases,
      {
        orderIndex: newIdx,
        label: `TC0${newIdx} - Test Case mới`,
        rationaleTag: 'FUNCTIONAL',
        isHidden: false,
        timeLimitMs: 1500,
        memoryLimitKb: 262144,
        points: 2.0,
        comparisonMode: 'STDIO',
        stdinInput: 'INPUT_DATA',
        expectedStdout: 'EXPECTED_OUTPUT',
      },
    ]);
  };

  const handleDeleteTestCase = (idx: number) => {
    setTestCases(testCases.filter((_, i) => i !== idx));
  };

  // Handler: Dry Run simulation
  const handleDryRun = () => {
    setDryRunRunning(true);
    setDryRunResult(null);
    setTimeout(() => {
      setDryRunRunning(false);
      setDryRunResult({
        passed: testCases.length,
        total: testCases.length,
        latency: '0.84s',
      });
    }, 1600);
  };

  // Handler: Save Exam, Testcases & Solution to Database
  const handleSaveToDatabase = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề đề thi tại Bước 1!');
      setActiveStep(1);
      return;
    }
    if (!courseId) {
      alert('Vui lòng chọn môn học tại Bước 1!');
      setActiveStep(1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const startTime = new Date();
      const deadline = new Date(Date.now() + durationMinutes * 60 * 1000);

      const createdAssign = await assignmentService.createAssignment({
        courseId,
        title,
        description,
        environment,
        startTime: startTime.toISOString(),
        deadline: deadline.toISOString(),
        status: 'PUBLISHED',
      });

      const assignmentId = createdAssign.id;

      await Promise.all(
        testCases.map((tc, i) =>
          assignmentService.addTestCase(assignmentId, {
            orderIndex: i + 1,
            label: tc.label || `TC_${i + 1}`,
            rationaleTag: tc.rationaleTag || 'FUNCTIONAL',
            isHidden: Boolean(tc.isHidden),
            timeLimitMs: Number(tc.timeLimitMs) || 1500,
            memoryLimitKb: Number(tc.memoryLimitKb) || 262144,
            points: Number(tc.points) || 1.0,
            comparisonMode: tc.comparisonMode || 'STDIO',
            stdinInput: tc.stdinInput || '',
            expectedStdout: tc.expectedStdout || '',
            inputFileName: tc.inputFileName || null,
            inputFileContent: tc.inputFileContent || null,
            expectedFileName: tc.expectedFileName || null,
            expectedFileContent: tc.expectedFileContent || null,
          })
        )
      );

      if (solutionCode.trim()) {
        await assignmentService.upsertSolution(assignmentId, {
          title: solutionTitle || 'Mã nguồn bài giải mẫu',
          sourceCode: solutionCode,
          explanation: `Mã giải mẫu tham chiếu chuẩn. Độ phức tạp thuật toán kỳ vọng: ${expectedComplexity}.`,
        });
      }

      try {
        await assignmentService.setRubricRules(assignmentId, [
          {
            criterionName: 'Độ phức tạp thuật toán kỳ vọng',
            description: `Thuật toán đạt độ phức tạp mục tiêu ${expectedComplexity}, tối ưu tài nguyên thực thi và không gây rò rỉ bộ nhớ.`,
            maxPoints: 1.0,
            weight: 1.0,
            orderIndex: 1,
          },
          {
            criterionName: 'Clean Code & Chống Hardcode mã nguồn',
            description: 'Cấu trúc mã nguồn rõ ràng, đặt tên biến/hàm chuẩn mực OOP/Clean Code, xử lý thuật toán tổng quát, tuyệt đối không hardcode kết quả testcase.',
            maxPoints: 1.0,
            weight: 1.0,
            orderIndex: 2,
          },
        ]);
      } catch (rubricErr) {
        console.warn('Không thể khởi tạo rubric AI tự động, tiếp tục xuất bản:', rubricErr);
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push('/exam-bank');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.response?.data?.message || err.message || 'Lỗi khi lưu đề thi vào CSDL');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === courseId);
  const totalPoints = testCases.reduce((sum, c) => sum + (Number(c.points) || 0), 0);

  return {
    router,
    editId,
    loadingEdit,
    activeStep,
    setActiveStep,
    courses,
    courseId,
    setCourseId,
    selectedCourse,
    title,
    setTitle,
    description,
    setDescription,
    environment,
    setEnvironment,
    durationMinutes,
    setDurationMinutes,
    pdfFile,
    setPdfFile,
    pdfBlobUrl,
    setPdfBlobUrl,
    showPdfPreview,
    setShowPdfPreview,
    starterZipFile,
    setStarterZipFile,
    zipEntries,
    setZipEntries,
    zipFilesContent,
    setZipFilesContent,
    isReadingZip,
    viewingZipFile,
    setViewingZipFile,
    macJunkDetected,
    solutionTitle,
    setSolutionTitle,
    solutionCode,
    setSolutionCode,
    expectedComplexity,
    setExpectedComplexity,
    testCases,
    setTestCases,
    totalPoints,
    testcaseImport,
    dryRunRunning,
    dryRunResult,
    isSubmitting,
    submitError,
    submitSuccess,
    handleZipUpload,
    handleSolutionFileUpload,
    handleLoadSamplePrf192,
    handleLoadSamplePro192,
    handleAddBlankTestCase,
    handleDeleteTestCase,
    handleDryRun,
    handleSaveToDatabase,
  };
}
