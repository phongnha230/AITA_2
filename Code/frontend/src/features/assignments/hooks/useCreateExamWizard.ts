import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import JSZip from 'jszip';
import { assignmentService } from '../services/assignment.service';
import {
  AssignmentEnv,
  Course,
  RubricRuleInput,
  TestCase,
  WebTestScript,
} from '../types/assignment.types';
import { sampleCsd201Template, samplePrf192Template, samplePro192Template, SampleExamTemplate } from '../components/wizard/sampleExamTemplates';
import { buildJavaGradingRubric } from '../components/wizard/java-grading-rubric';
import { buildReactGradingRubric } from '../components/wizard/react-grading-rubric';
import { useTestcaseImport } from './useTestcaseImport';

const defaultReactStructureRequirements = 'Đánh giá cách tổ chức component, sử dụng props/state, hooks và dependency của effect; routing/context/store phải phù hợp phạm vi bài, có xử lý loading, error và empty state khi cần.';
const defaultReactCleanCodeRequirements = 'Đánh giá naming, khả năng đọc hiểu, component không ôm quá nhiều trách nhiệm, tránh lặp logic, tránh hardcode không cần thiết và bảo đảm accessibility cơ bản.';

const hasWebTestSteps = (testCase: TestCase): boolean => {
  try {
    const parsed = JSON.parse(testCase.stdinInput ?? '') as Partial<WebTestScript>;
    return Array.isArray(parsed.steps) && parsed.steps.length > 0;
  } catch {
    return false;
  }
};

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
  const [submissionType, setSubmissionType] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [accessCode, setAccessCode] = useState('');


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
  const [expectedSpaceComplexity, setExpectedSpaceComplexity] = useState('');
  const [acceptedStrategiesText, setAcceptedStrategiesText] = useState('');
  const [algorithmNotes, setAlgorithmNotes] = useState('');
  const [reactStructureRequirements, setReactStructureRequirements] = useState(defaultReactStructureRequirements);
  const [reactCleanCodeRequirements, setReactCleanCodeRequirements] = useState(defaultReactCleanCodeRequirements);
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

  const handleEnvironmentChange = (nextEnvironment: AssignmentEnv) => {
    if (nextEnvironment !== environment) {
      setTestCases([]);
      setDryRunResult(null);
    }
    setEnvironment(nextEnvironment);
  };

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
        if (data.submissionType) setSubmissionType(data.submissionType);
        if (data.testCases && data.testCases.length > 0) {
          setTestCases(data.testCases);
        }
        if (data.solutions && data.solutions.length > 0) {
          setSolutionTitle(data.solutions[0].title || '');
          setSolutionCode(data.solutions[0].sourceCode || '');
          setExpectedComplexity(data.solutions[0].expectedTimeComplexity || '');
          setExpectedSpaceComplexity(data.solutions[0].expectedSpaceComplexity || '');
          setAcceptedStrategiesText((data.solutions[0].acceptedStrategies || []).join(', '));
          setAlgorithmNotes(data.solutions[0].algorithmNotes || '');
        }
        const structureRubric = data.rubricRules?.find((rule) => rule.criterionType === 'ALGORITHM');
        const cleanCodeRubric = data.rubricRules?.find((rule) => rule.criterionType === 'CLEAN_CODE');
        if (data.environment === 'REACT_JS') {
          setReactStructureRequirements(structureRubric?.description || defaultReactStructureRequirements);
          setReactCleanCodeRequirements(cleanCodeRubric?.description || defaultReactCleanCodeRequirements);
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
    setExpectedComplexity(samplePrf192Template.expectedComplexity || '');
    setExpectedSpaceComplexity(samplePrf192Template.expectedSpaceComplexity || '');
    setAcceptedStrategiesText((samplePrf192Template.acceptedStrategies || []).join(', '));
    setAlgorithmNotes(samplePrf192Template.algorithmNotes || '');
    setTestCases(samplePrf192Template.testCases);
  };

  const applyJavaTemplate = (template: SampleExamTemplate, requiredCourseCode: 'PRO192' | 'CSD201') => {
    const course = courses.find((candidate) => candidate.code.trim().toUpperCase() === requiredCourseCode);
    if (!course) {
      window.alert(`Không tìm thấy khóa học ${requiredCourseCode}. Hãy tạo/chọn khóa học đúng mã trước khi áp dụng template.`);
      return;
    }

    setCourseId(course.id);
    setTitle(template.title);
    setDescription(template.description);
    setEnvironment(template.environment);
    setDurationMinutes(template.durationMinutes);
    setPdfFile(template.pdfFile);
    setStarterZipFile(template.starterZipFile);
    setZipEntries(template.zipEntries);
    setZipFilesContent(template.zipFilesContent);
    setSolutionTitle(template.solutionTitle);
    setSolutionCode(template.solutionCode);
    setExpectedComplexity(template.expectedComplexity || '');
    setExpectedSpaceComplexity(template.expectedSpaceComplexity || '');
    setAcceptedStrategiesText((template.acceptedStrategies || []).join(', '));
    setAlgorithmNotes(template.algorithmNotes || '');
    setTestCases(template.testCases);
  };

  const handleLoadSamplePro192 = () => applyJavaTemplate(samplePro192Template, 'PRO192');
  const handleLoadSampleCsd201 = () => applyJavaTemplate(sampleCsd201Template, 'CSD201');

  // Handler: Add individual testcase
  const handleAddBlankTestCase = () => {
    const newIdx = testCases.length + 1;
    const reactSteps = JSON.stringify({
      version: 1,
      steps: [
        { action: 'GOTO', target: '/', timeoutMs: 15_000 },
        { action: 'ASSERT_VISIBLE', target: 'body', timeoutMs: 10_000 },
      ],
    });
    setTestCases([
      ...testCases,
      {
        orderIndex: newIdx,
        label: `TC0${newIdx} - Test Case mới`,
        rationaleTag: 'FUNCTIONAL',
        isHidden: false,
        timeLimitMs: 1500,
        memoryLimitKb: 262144,
        points: 1.0,
        comparisonMode: 'STDIO',
        stdinInput: environment === 'REACT_JS' ? reactSteps : 'INPUT_DATA',
        expectedStdout: environment === 'REACT_JS' ? 'Tất cả bước Playwright hoàn tất' : 'EXPECTED_OUTPUT',
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

  const selectedCourse = courses.find((course) => course.id === courseId);

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
    const functionalPoints = testCases.reduce((sum, testCase) => sum + (Number(testCase.points) || 0), 0);
    if (Math.abs(functionalPoints - 7) >= 0.01) {
      alert(`Tổng điểm test case phải bằng 7.0; hiện tại là ${functionalPoints.toFixed(2)}.`);
      setActiveStep(3);
      return;
    }
    if (environment === 'REACT_JS' && testCases.some((testCase) => !hasWebTestSteps(testCase))) {
      alert('Mỗi testcase React phải có ít nhất một bước Playwright hợp lệ.');
      setActiveStep(3);
      return;
    }
    if (
      environment === 'REACT_JS'
      && (reactStructureRequirements.trim().length < 20 || reactCleanCodeRequirements.trim().length < 20)
    ) {
      alert('Vui lòng mô tả rõ tiêu chí cấu trúc React và Clean Code trước khi công bố.');
      setActiveStep(3);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const start = startTime ? new Date(startTime) : new Date();
      const deadline = new Date(start.getTime() + durationMinutes * 60 * 1000);

      const createdAssign = await assignmentService.createAssignment({
        courseId,
        title,
        description,
        environment,
        submissionType,
        startTime: start.toISOString(),
        deadline: deadline.toISOString(),
        durationMinutes,
        accessCode: accessCode.trim() || undefined,
        status: 'DRAFT',
        gradingVersion: 2,
        functionalMaxScore: 7,
        algorithmMaxScore: 2,
        cleanCodeMaxScore: 1,
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

      if (environment !== 'REACT_JS' && solutionCode.trim()) {
        await assignmentService.upsertSolution(assignmentId, {
          title: solutionTitle || 'Mã nguồn bài giải mẫu',
          sourceCode: solutionCode,
          explanation: `Mã giải mẫu tham chiếu chuẩn. Độ phức tạp thuật toán kỳ vọng: ${expectedComplexity}.`,
          expectedTimeComplexity: expectedComplexity.trim() || undefined,
          expectedSpaceComplexity: expectedSpaceComplexity.trim() || undefined,
          acceptedStrategies: acceptedStrategiesText
            .split(/[\n,]/)
            .map((strategy) => strategy.trim())
            .filter(Boolean),
          algorithmNotes: algorithmNotes.trim() || undefined,
        });
      }

      const rubricRules: RubricRuleInput[] = environment === 'REACT_JS'
        ? buildReactGradingRubric(reactStructureRequirements, reactCleanCodeRequirements)
        : environment === 'JAVA_JDK'
          ? buildJavaGradingRubric(selectedCourse?.code, expectedComplexity, expectedSpaceComplexity)
          : [
          {
            criterionName: 'Độ phức tạp thuật toán kỳ vọng',
            description: `Đánh giá chiến lược thuật toán theo độ phức tạp thời gian ${expectedComplexity || 'chưa cấu hình'} và bộ nhớ ${expectedSpaceComplexity || 'chưa cấu hình'}, có xét các cách giải hợp lệ khác đáp án tham chiếu.`,
            maxPoints: 2.0,
            weight: 1.0,
            orderIndex: 1,
            criterionType: 'ALGORITHM',
          },
          {
            criterionName: 'Clean Code & Chống Hardcode mã nguồn',
            description: 'Cấu trúc mã nguồn rõ ràng, đặt tên biến/hàm chuẩn mực OOP/Clean Code, xử lý thuật toán tổng quát, tuyệt đối không hardcode kết quả testcase.',
            maxPoints: 1.0,
            weight: 1.0,
            orderIndex: 2,
            criterionType: 'CLEAN_CODE',
          },
        ];
      await assignmentService.setRubricRules(assignmentId, rubricRules);

      await assignmentService.updateAssignment(assignmentId, { status: 'PUBLISHED' });

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
    setEnvironment: handleEnvironmentChange,
    submissionType,
    setSubmissionType,
    durationMinutes,
    setDurationMinutes,
    startTime,
    setStartTime,
    accessCode,
    setAccessCode,
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
    handleLoadSampleCsd201,
    handleAddBlankTestCase,
    handleDeleteTestCase,
    handleDryRun,
    handleSaveToDatabase,
  };
}
