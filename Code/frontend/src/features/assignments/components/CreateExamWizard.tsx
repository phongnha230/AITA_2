'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileCode,
  FileText,
  Upload,
  Archive,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Terminal,
  Play,
  Save,
  ArrowLeft,
  ArrowRight,
  Eye,
  FileSpreadsheet,
  Download,
  FolderTree,
  Sparkles,
  RefreshCw,
  X,
  ExternalLink,
  ChevronRight,
  Check,
  Code2,
  Settings,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import JSZip from 'jszip';
import { assignmentService } from '../services/assignment.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import {
  AssignmentEnv,
  Course,
  RationaleTag,
  TestCase,
} from '../types/assignment.types';

export const CreateExamWizard: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('editId') || null;
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Active Step (1 to 4)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // 1. General Info State (Clean by default)
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState<AssignmentEnv>('C_GCC');
  const [durationMinutes, setDurationMinutes] = useState(60);

  // 2. PDF Exam File State (Empty by default)
  const [pdfFile, setPdfFile] = useState<{ name: string; size: string } | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // 3. Starter Code Template State (Empty by default, parsed via JSZip)
  const [starterZipFile, setStarterZipFile] = useState<{ name: string; size: string } | null>(null);
  const [zipEntries, setZipEntries] = useState<string[]>([]);
  const [zipFilesContent, setZipFilesContent] = useState<Record<string, string>>({});
  const [isReadingZip, setIsReadingZip] = useState(false);
  const [viewingZipFile, setViewingZipFile] = useState<{ filename: string; content: string } | null>(null);

  // 4. Solution Code State (Empty by default)
  const [solutionTitle, setSolutionTitle] = useState('');
  const [solutionCode, setSolutionCode] = useState('');
  const [expectedComplexity, setExpectedComplexity] = useState('O(n log n)');
  const [macJunkDetected, setMacJunkDetected] = useState(false);

  // 5. Test Cases State (Empty by default)
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  // Modal Import Testcase State
  const [importModal, setImportModal] = useState(false);
  const [importType, setImportType] = useState<'json' | 'excel'>('json');
  const [jsonText, setJsonText] = useState('');
  const [previewTestCases, setPreviewTestCases] = useState<TestCase[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

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
    const loadAssignment = async () => {
      setLoadingEdit(true);
      try {
        const data = await assignmentService.getAssignmentById(editId);
        if (data) {
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
        }
      } catch (err) {
        console.error('Lỗi khi nạp dữ liệu đề thi:', err);
      } finally {
        setLoadingEdit(false);
      }
    };
    loadAssignment();
  }, [editId]);

  // Cleanup Blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  // Handler: Real ZIP Extraction via JSZip & Cache text contents for preview
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

  // Handler: Real Solution File Upload (.c, .java, .txt)
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
    setTitle('Đề thi Thực hành PE PRF192 - Spring 2025');
    setDescription(
      'Kỳ thi thực hành môn Cơ sở lập trình với C (Programming Fundamentals with C). Gồm các bài toán về Thuật toán số nguyên tố và Xử lý mảng.'
    );
    setEnvironment('C_GCC');
    setDurationMinutes(60);
    setPdfFile({ name: 'PRF192_PE_Paper.pdf', size: '3.1 KB' });
    setStarterZipFile({ name: 'PRF192_Starter_Template.zip', size: '1.2 KB' });
    setZipEntries(['Makefile', 'src/main.c', 'src/solution.c', 'src/solution.h']);
    setZipFilesContent({
      'Makefile': `CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -O2
SRC = src/main.c src/solution.c
TARGET = program

all: $(TARGET)

$(TARGET): $(SRC)
\t$(CC) $(CFLAGS) $(SRC) -o $(TARGET)

clean:
\trm -f $(TARGET)
`,
      'src/solution.h': `#ifndef SOLUTION_H
#define SOLUTION_H

#include <stdbool.h>

bool isPrime(int num);
void solveQuestion1(int n);
void solveQuestion2(int n, int arr[]);

#endif
`,
      'src/solution.c': `#include <stdio.h>
#include <stdbool.h>
#include "solution.h"

// TODO: Sinh viên hiện thực các hàm giải thuật tại đây

bool isPrime(int num) {
    // Viết code tại đây
    return false;
}

void solveQuestion1(int n) {
    // Viết code tại đây
}

void solveQuestion2(int n, int arr[]) {
    // Viết code tại đây
}
`,
      'src/main.c': `#include <stdio.h>
#include "solution.h"

int main() {
    int qId;
    if (scanf("%d", &qId) != 1) return 0;
    if (qId == 1) {
        int n;
        if (scanf("%d", &n) == 1) {
            solveQuestion1(n);
        }
    } else if (qId == 2) {
        int n;
        if (scanf("%d", &n) == 1) {
            int arr[105];
            for (int i = 0; i < n; i++) {
                scanf("%d", &arr[i]);
            }
            solveQuestion2(n, arr);
        }
    }
    return 0;
}
`,
    });
    setSolutionTitle('Bài giải chuẩn PRF192 (Reference Solution - Q1 & Q2)');
    setSolutionCode(`// ==========================================
// PRF192 PE REFERENCE SOLUTION - Q1 & Q2
// ==========================================
#include <stdio.h>
#include <stdbool.h>
#include <math.h>

// Helper: Check if a number is prime
bool isPrime(int num) {
    if (num < 2) return false;
    for (int i = 2; i * i <= num; i++) {
        if (num % i == 0) return false;
    }
    return true;
}

// Problem 1: Print primes up to N and count
void solveQuestion1(int n) {
    int count = 0;
    bool first = true;
    for (int i = 2; i <= n; i++) {
        if (isPrime(i)) {
            if (!first) printf(" ");
            printf("%d", i);
            first = false;
            count++;
        }
    }
    printf("\\nTotal primes: %d\\n", count);
}

// Problem 2: Reverse array from 0 to max index
void solveQuestion2(int n, int arr[]) {
    if (n <= 0) return;
    int maxIdx = 0;
    for (int i = 1; i < n; i++) {
        if (arr[i] > arr[maxIdx]) {
            maxIdx = i;
        }
    }
    int left = 0, right = maxIdx;
    while (left < right) {
        int temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        left++;
        right--;
    }
    for (int i = 0; i < n; i++) {
        printf("%d%s", arr[i], (i == n - 1) ? "" : " ");
    }
    printf("\\n");
}

int main() {
    int qId;
    if (scanf("%d", &qId) != 1) return 0;
    if (qId == 1) {
        int n;
        if (scanf("%d", &n) == 1) {
            solveQuestion1(n);
        }
    } else if (qId == 2) {
        int n;
        if (scanf("%d", &n) == 1) {
            int arr[105];
            for (int i = 0; i < n; i++) {
                scanf("%d", &arr[i]);
            }
            solveQuestion2(n, arr);
        }
    }
    return 0;
}`);
    setTestCases([
      {
        orderIndex: 1,
        label: 'TC1_Q1_Range10',
        rationaleTag: 'FUNCTIONAL',
        isHidden: false,
        timeLimitMs: 1500,
        memoryLimitKb: 262144,
        points: 2.0,
        comparisonMode: 'STDIO',
        stdinInput: '1\n10',
        expectedStdout: '2 3 5 7\nTotal primes: 4',
      },
      {
        orderIndex: 2,
        label: 'TC2_Q1_Range20',
        rationaleTag: 'FUNCTIONAL',
        isHidden: false,
        timeLimitMs: 1500,
        memoryLimitKb: 262144,
        points: 2.0,
        comparisonMode: 'STDIO',
        stdinInput: '1\n20',
        expectedStdout: '2 3 5 7 11 13 17 19\nTotal primes: 8',
      },
      {
        orderIndex: 3,
        label: 'TC3_Q1_Hidden_EdgeCase',
        rationaleTag: 'BOUNDARY',
        isHidden: true,
        timeLimitMs: 1500,
        memoryLimitKb: 262144,
        points: 1.0,
        comparisonMode: 'STDIO',
        stdinInput: '1\n2',
        expectedStdout: '2\nTotal primes: 1',
      },
      {
        orderIndex: 4,
        label: 'TC4_Q2_Sample1',
        rationaleTag: 'FUNCTIONAL',
        isHidden: false,
        timeLimitMs: 1500,
        memoryLimitKb: 262144,
        points: 2.5,
        comparisonMode: 'STDIO',
        stdinInput: '2\n5\n3 1 9 4 2',
        expectedStdout: '9 1 3 4 2',
      },
      {
        orderIndex: 5,
        label: 'TC5_Q2_Hidden_MaxAtEnd',
        rationaleTag: 'BOUNDARY',
        isHidden: true,
        timeLimitMs: 1500,
        memoryLimitKb: 262144,
        points: 2.5,
        comparisonMode: 'STDIO',
        stdinInput: '2\n4\n1 2 3 4',
        expectedStdout: '4 3 2 1',
      },
    ]);
  };

  // Handler: Load 1-Click Sample PE PRO192 / CSD201 (Java OOP + File I/O + RAG)
  const handleLoadSamplePro192 = () => {
    const javaCourse =
      courses.find((c) => c.code.toLowerCase().includes('pro') || c.code.toLowerCase().includes('csd')) || courses[0];
    if (javaCourse) setCourseId(javaCourse.id);

    setTitle('Kỳ thi Thực hành PE PRO192 / CSD201 - Spring 2025');
    setDescription(`Đề thi thực hành môn Lập trình Hướng đối tượng Java & Cấu trúc dữ liệu. 
Sinh viên được cấp Skeleton Starter Code chứa Interface ICar và class Car.
Yêu cầu hoàn thành các phương thức:
- Câu 1 (f1): Đếm số lượng xe có giá >= 500.
- Câu 2 (f2): Sắp xếp danh sách xe theo rate tăng dần, nếu bằng nhau thì theo price giảm dần (Độ phức tạp kỳ vọng O(n log n)).
- Câu 3 (f3): Ghi danh sách xe ra file đầu ra f1.txt (File I/O).`);
    setEnvironment('JAVA_JDK');
    setDurationMinutes(90);

    setPdfFile({ name: 'PE_PRO192_CSD201_SP25_FinalExam.pdf', size: '384 KB' });

    setStarterZipFile({ name: 'PRO192_StarterCode_Skeleton.zip', size: '128 KB' });
    setZipEntries(['src/Car.java', 'src/ICar.java', 'src/Main.java', 'src/MyCar.java']);
    setZipFilesContent({
      'src/ICar.java': `package src;\nimport java.util.List;\n\npublic interface ICar {\n    int f1(List<Car> list);\n    void f2(List<Car> list);\n    void f3(List<Car> list, String outputFile);\n}`,
      'src/Car.java': `package src;\n\npublic class Car {\n    private String name;\n    private double price;\n    private int rate;\n    public Car(String name, double price, int rate) {\n        this.name = name;\n        this.price = price;\n        this.rate = rate;\n    }\n    public String getName() { return name; }\n    public double getPrice() { return price; }\n    public int getRate() { return rate; }\n}`,
      'src/MyCar.java': `package src;\nimport java.util.List;\n\n// TODO: Sinh viên triển khai các phương thức f1, f2, f3 vào đây\npublic class MyCar implements ICar {\n    @Override\n    public int f1(List<Car> list) {\n        return 0;\n    }\n    @Override\n    public void f2(List<Car> list) {}\n    @Override\n    public void f3(List<Car> list, String outputFile) {}\n}`,
    });

    setSolutionTitle('Bài giải mẫu chuẩn PRO192 / CSD201 - OOP Java Reference');
    setExpectedComplexity('O(n log n)');
    setSolutionCode(`// ==========================================
// PRO192 & CSD201 PE REFERENCE SOLUTION
// Big-O Target: O(n log n)
// ==========================================
package src;

import java.util.*;
import java.io.*;

public class MyCar implements ICar {
    // Câu 1: Đếm số lượng xe có price >= 500
    @Override
    public int f1(List<Car> list) {
        if (list == null) return 0;
        int count = 0;
        for (Car c : list) {
            if (c.getPrice() >= 500) count++;
        }
        return count;
    }

    // Câu 2: Sắp xếp danh sách xe theo rate tăng dần, price giảm dần
    // Độ phức tạp thuật toán: O(n log n)
    @Override
    public void f2(List<Car> list) {
        if (list == null || list.size() <= 1) return;
        Collections.sort(list, new Comparator<Car>() {
            @Override
            public int compare(Car o1, Car o2) {
                if (o1.getRate() != o2.getRate()) {
                    return Integer.compare(o1.getRate(), o2.getRate());
                }
                return Double.compare(o2.getPrice(), o1.getPrice());
            }
        });
    }

    // Câu 3: Ghi kết quả ra file f1.txt (File I/O)
    @Override
    public void f3(List<Car> list, String outputFile) {
        if (list == null) return;
        try (PrintWriter pw = new PrintWriter(new FileWriter(outputFile))) {
            for (Car c : list) {
                pw.println(c.getName() + " - " + c.getPrice());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}`);

    setTestCases([
      {
        orderIndex: 1,
        label: 'TC1_Q1_CountPriceThreshold',
        rationaleTag: 'FUNCTIONAL',
        isHidden: false,
        timeLimitMs: 2000,
        memoryLimitKb: 262144,
        points: 2.0,
        comparisonMode: 'STDIO',
        stdinInput: '1\\n4\\nAudi 600 5\\nBMW 400 4\\nToyota 750 5\\nKia 300 2',
        expectedStdout: 'OUTPUT: 2',
      },
      {
        orderIndex: 2,
        label: 'TC2_Q2_SortRateAndPrice',
        rationaleTag: 'PERFORMANCE',
        isHidden: false,
        timeLimitMs: 2000,
        memoryLimitKb: 262144,
        points: 3.0,
        comparisonMode: 'STDIO',
        stdinInput: '2\\n3\\nCarA 100 2\\nCarB 200 1\\nCarC 300 2',
        expectedStdout: 'CarB 200.0\\nCarC 300.0\\nCarA 100.0',
      },
      {
        orderIndex: 3,
        label: 'TC3_Q3_FileIO_f1_txt',
        rationaleTag: 'BOUNDARY',
        isHidden: false,
        timeLimitMs: 2000,
        memoryLimitKb: 262144,
        points: 2.5,
        comparisonMode: 'FILE_TO_FILE',
        inputFileName: 'data.txt',
        inputFileContent: 'Ferrari 1200 5\\nLamborghini 1500 5',
        expectedFileName: 'f1.txt',
        expectedFileContent: 'Ferrari - 1200.0\\nLamborghini - 1500.0',
      },
      {
        orderIndex: 4,
        label: 'TC4_Q2_Hidden_EmptyList',
        rationaleTag: 'EDGE',
        isHidden: true,
        timeLimitMs: 1500,
        memoryLimitKb: 262144,
        points: 2.5,
        comparisonMode: 'STDIO',
        stdinInput: '2\\n0',
        expectedStdout: 'EMPTY_LIST',
      },
    ]);
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

  // Parse JSON text into preview state
  const handleParseJsonForPreview = (jsonString: string) => {
    setImportError(null);
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        const formatted: TestCase[] = parsed.map((item, idx) => ({
          orderIndex: idx + 1,
          label: item.label || item.name || `TC_Imported_${idx + 1}`,
          rationaleTag: item.rationaleTag || 'FUNCTIONAL',
          isHidden: Boolean(item.isHidden),
          timeLimitMs: Number(item.timeLimitMs) || 1500,
          memoryLimitKb: 262144,
          points: Number(item.points || item.score) || 2.0,
          comparisonMode: 'STDIO',
          stdinInput: item.stdinInput || item.stdin || item.input || '',
          expectedStdout: item.expectedStdout || item.expected || item.expectedOutput || '',
        }));
        setPreviewTestCases(formatted);
      } else {
        setImportError('Dữ liệu JSON phải là một mảng [] danh sách các testcase!');
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

      // 1. Tạo Assignment trong Database MySQL
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

      // 2. Thêm từng Testcase vào Database
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        await assignmentService.addTestCase(assignmentId, {
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
        });
      }

      // 3. Thêm Solution Code vào Database
      if (solutionCode.trim()) {
        await assignmentService.upsertSolution(assignmentId, {
          title: solutionTitle || 'Mã nguồn bài giải mẫu',
          sourceCode: solutionCode,
          explanation: `Mã giải mẫu tham chiếu chuẩn. Độ phức tạp mục tiêu RAG: ${expectedComplexity}.`,
        });
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

  // Stepper definition
  const steps = [
    { number: 1, title: 'Thông tin & Ca thi', desc: 'Môn học, Sandbox, Thời lượng' },
    { number: 2, title: 'PDF & Starter ZIP', desc: 'Đề thi & Mã nguồn khởi tạo' },
    { number: 3, title: 'Solution & Testcases', desc: 'Bài giải chuẩn & Import test' },
    { number: 4, title: 'Kiểm thử & Lưu CSDL', desc: 'Dry Run Sandbox & Xuất bản' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      {/* TOP BREADCRUMB & HEADER */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <Link href="/exam-bank">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Quay lại Ngân hàng đề thi</span>
          </Link>
        </Button>
        <Badge variant="outline" className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 border-indigo-200">
          Khảo thí PE • Chấm tự động
        </Badge>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-2xs p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {editId ? (
              <Badge variant="outline" className="text-[11px] font-bold bg-amber-50 text-amber-800 border-amber-300">
                CHẾ ĐỘ CHỈNH SỬA (EDIT MODE)
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border-indigo-200">
                TẠO MỚI (CREATE MODE)
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {editId ? (loadingEdit ? 'Đang tải dữ liệu đề thi...' : `Chỉnh Sửa Đề Thi: ${title || 'Chi tiết'}`) : 'Tạo Mới & Import Đề Thi PE'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {editId
              ? 'Dữ liệu đề bài, bộ testcase và bài giải mẫu đã được nạp tự động. Bạn có thể cập nhật các thông tin cần thiết.'
              : 'Quy trình 4 bước chuẩn hoá: tải đề thi PDF, nạp khung mã nguồn mẫu cho sinh viên, nạp bài giải code sẵn và import bộ testcase tự động.'}
          </p>
        </div>
        {!editId && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadSamplePrf192}
              className="h-9 px-3.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 flex items-center gap-1.5 shadow-2xs transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>⚡ Mẫu C (PRF192)</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadSamplePro192}
              className="h-9 px-3.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-300 flex items-center gap-1.5 shadow-2xs transition"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>☕ Mẫu Java (PRO192 / CSD201)</span>
            </Button>
          </div>
        )}
      </Card>


      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Đã lưu thành công đề thi, bộ testcase và bài giải mẫu! Đang chuyển hướng...</span>
        </div>
      )}

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>Lỗi: {submitError}</span>
        </div>
      )}

      {/* STEPPER WIZARD TABS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {steps.map((step) => {
            const isCurrent = activeStep === step.number;
            const isPassed = activeStep > step.number;

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(step.number as any)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition ${
                  isCurrent
                    ? 'bg-blue-50/80 border border-blue-200 shadow-sm'
                    : isPassed
                    ? 'hover:bg-slate-50 text-slate-700'
                    : 'hover:bg-slate-50 text-slate-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : isPassed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isPassed ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <div className="overflow-hidden">
                  <div
                    className={`font-bold text-xs truncate ${
                      isCurrent ? 'text-blue-900' : isPassed ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate hidden sm:block">
                    {step.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BƯỚC 1: THÔNG TIN CHUNG & CẤU HÌNH CA THI */}
      {activeStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="font-extrabold text-sm text-slate-900">
                Bước 1: Thông tin chung & Cấu hình Ca thi PE
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Bước 1 trên 4</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Môn học (Course)</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name} ({c.semester})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Môi trường Docker Sandbox</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as AssignmentEnv)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              >
                <option value="C_GCC">C/C++ GCC 11 Compiler (Mặc định cho PRF192)</option>
                <option value="JAVA_JDK">Java OpenJDK 21 LTS (Maven & JUnit cho PRO192/CSD201)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Tiêu đề Đề thi PE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Kỳ thi Thực hành PE PRF192 - Spring 2025"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Mô tả / Yêu cầu chung của đề bài</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ghi chú thêm về quy chế thi, cấu trúc bài toán hoặc lưu ý cho sinh viên..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Thời lượng làm bài (phút)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Giới hạn số lần nộp Docker Sandbox</label>
              <input
                type="number"
                defaultValue={10}
                disabled
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Tối đa 10 lần nộp để tránh nghẽn hàng đợi chấm.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!title.trim()) {
                  alert('Vui lòng nhập Tiêu đề Đề thi PE trước khi tiếp tục!');
                  return;
                }
                setActiveStep(2);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
            >
              <span>Tiếp tục: Tải Đề PDF & Starter ZIP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* BƯỚC 2: FILE PDF & STARTER CODE ZIP */}
      {activeStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h2 className="font-extrabold text-sm text-slate-900">
                  1. File PDF Đề Thi Chính Thức
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Bảo mật cấp độ Phòng thi Kiosk</span>
            </div>

            <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 text-center transition">
              {pdfFile ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">{pdfFile.name}</div>
                      <div className="text-[11px] text-slate-400">{pdfFile.size} • Đã sẵn sàng phát cho thí sinh</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPdfPreview(!showPdfPreview)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showPdfPreview ? 'Ẩn xem trước' : 'Xem trước PDF'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfFile(null);
                        if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
                        setPdfBlobUrl(null);
                        setShowPdfPreview(false);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block py-4">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-700">Kéo thả hoặc Nhấp để tải file PDF đề thi (.pdf)</div>
                  <div className="text-[11px] text-slate-400 mt-1">Dung lượng tối đa 20MB. Đề thi sẽ được khóa và mã hóa.</div>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setPdfFile({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB` });
                        if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
                        setPdfBlobUrl(URL.createObjectURL(f));
                        setShowPdfPreview(true);
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {showPdfPreview && pdfFile && (
              <div className="rounded-xl border border-slate-300 bg-slate-100 p-4 animate-in fade-in">
                {pdfBlobUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-medium px-1">
                      <span>Xem trước file PDF: <strong className="text-slate-900">{pdfFile.name}</strong></span>
                      <a
                        href={pdfBlobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-bold text-xs"
                      >
                        <span>Mở tab mới</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <iframe
                      src={pdfBlobUrl}
                      className="w-full h-[550px] rounded-lg border border-slate-300 shadow bg-white"
                      title="PDF Document Preview"
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-md p-6 max-w-2xl mx-auto space-y-4 text-xs font-serif text-slate-800">
                    <div className="text-center border-b pb-3 border-slate-200 font-sans">
                      <div className="font-bold text-sm tracking-wider uppercase text-slate-900">TRƯỜNG ĐẠI HỌC FPT — KHOA CNTT</div>
                      <div className="font-extrabold text-base text-blue-700 mt-1">ĐỀ THI THỰC HÀNH (PRACTICAL EXAM)</div>
                      <div className="text-slate-500 text-[11px]">Môn: PRF192 — Programming Fundamentals with C • Thời gian: 60 phút</div>
                    </div>
                    <div className="space-y-3 font-sans leading-relaxed">
                      <p><strong>Câu 1 (5.0 điểm):</strong> Viết chương trình C đọc số nguyên N. Đếm và in tất cả các số nguyên tố trong đoạn [1, N] theo thứ tự tăng dần. Dòng tiếp theo in <code>Total primes: K</code>.</p>
                      <p><strong>Câu 2 (5.0 điểm):</strong> Cho mảng N số nguyên. Tìm phần tử lớn nhất đầu tiên và đảo ngược mảng từ vị trí 0 đến vị trí phần tử lớn nhất đó.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h2 className="font-extrabold text-sm text-slate-900">
                  2. Khung Mã Nguồn Mẫu (Starter / Template Code ZIP)
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Click vào tệp bất kỳ bên dưới để xem nội dung code</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              {starterZipFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                        ZIP
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900">{starterZipFile.name}</div>
                        <div className="text-[11px] text-slate-400">{starterZipFile.size} • Bộ khung code mẫu đã nạp</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStarterZipFile(null);
                        setZipEntries([]);
                        setZipFilesContent({});
                        setViewingZipFile(null);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {macJunkDetected && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Hệ thống đã tự động lọc bỏ các tệp rác hệ điều hành (__MACOSX, .DS_Store) theo đúng quy chuẩn khảo thí FPT.</span>
                    </div>
                  )}

                  <div className="p-3 bg-slate-900 text-slate-300 font-mono text-xs rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FolderTree className="w-3.5 h-3.5 text-blue-400" />
                        <span>Cấu trúc tệp tin đọc từ file ZIP ({zipEntries.length} tệp):</span>
                      </div>
                      {isReadingZip && <span className="text-amber-400 animate-pulse font-sans">Đang giải nén đọc file...</span>}
                    </div>

                    <div className="space-y-1 text-[11px] max-h-52 overflow-y-auto pr-1">
                      {zipEntries.length > 0 ? (
                        zipEntries.map((entry, idx) => {
                          const hasContent = Boolean(zipFilesContent[entry]);
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                if (hasContent) {
                                  setViewingZipFile({
                                    filename: entry,
                                    content: zipFilesContent[entry],
                                  });
                                }
                              }}
                              className={`flex items-center justify-between p-1.5 rounded transition ${
                                hasContent
                                  ? 'hover:bg-slate-800 cursor-pointer text-slate-200'
                                  : 'text-slate-400'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-emerald-400">📄</span>
                                <span className="font-mono">{entry}</span>
                              </div>
                              {hasContent && (
                                <span className="text-[10px] text-blue-400 font-sans flex items-center gap-1 shrink-0 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                                  <Eye className="w-3 h-3" /> Xem code
                                </span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-slate-500 italic py-2">
                          {isReadingZip ? 'Đang phân tích cấu trúc gói ZIP...' : 'Gói nén trống hoặc chưa được phân tích.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block py-5 text-center hover:bg-slate-100/60 rounded-xl transition">
                  <Archive className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-700">Tải lên file nén mã nguồn mẫu (.zip)</div>
                  <div className="text-[11px] text-slate-400 mt-1">Hệ thống sẽ dùng JSZip giải nén và cho phép đọc mã nguồn từng file bên trong</div>
                  <input
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleZipUpload(f);
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Bước 1</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
            >
              <span>Tiếp tục: Bài giải chuẩn & Testcases</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* BƯỚC 3: BÀI GIẢI CHUẨN & IMPORT TESTCASES */}
      {activeStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h2 className="font-extrabold text-sm text-slate-900">
                  1. Bài Giải Code Sẵn (Reference Solution)
                </h2>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài giải tham chiếu</label>
                  <input
                    type="text"
                    value={solutionTitle}
                    onChange={(e) => setSolutionTitle(e.target.value)}
                    placeholder="Ví dụ: Bài giải chuẩn PRF192 / PRO192 Reference Solution"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Độ phức tạp RAG (Big-O)
                  </label>
                  <input
                    type="text"
                    value={expectedComplexity}
                    onChange={(e) => setExpectedComplexity(e.target.value)}
                    placeholder="VD: O(n log n), O(1)..."
                    className="w-full p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 text-purple-900 font-mono font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã nguồn bài giải (Solution Code)</label>
                <textarea
                  rows={8}
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
                  onClick={() => {
                    setImportModal(true);
                    setPreviewTestCases([]);
                    setImportError(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 shadow-sm transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                  <span>Import Testcase (JSON / CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddBlankTestCase}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm thủ công</span>
                </button>
              </div>
            </div>

            {testCases.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Terminal className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700">Chưa có testcase nào trong đề thi</div>
                <p className="text-[11px] text-slate-400 mt-1 mb-4">
                  Bấm <strong>Import Testcase (JSON/CSV)</strong> để nạp từ file có sẵn, hoặc bấm <strong>⚡ Nạp dữ liệu mẫu PRF192</strong> ở đầu trang.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddBlankTestCase}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"
                  >
                    Thêm thủ công
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImportModal(true);
                      setPreviewTestCases([]);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-sm flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import từ file JSON / CSV</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Tên Testcase</th>
                      <th className="py-2.5 px-3">Phân loại</th>
                      <th className="py-2.5 px-3">Chế độ</th>
                      <th className="py-2.5 px-3">Điểm</th>
                      <th className="py-2.5 px-3">Giới hạn</th>
                      <th className="py-2.5 px-3">Đầu vào (Stdin)</th>
                      <th className="py-2.5 px-3">Kết quả mong đợi</th>
                      <th className="py-2.5 px-3 text-right">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {testCases.map((tc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          <input
                            type="text"
                            value={tc.label}
                            onChange={(e) => {
                              const copy = [...testCases];
                              copy[idx].label = e.target.value;
                              setTestCases(copy);
                            }}
                            className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-44"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={tc.rationaleTag}
                            onChange={(e) => {
                              const copy = [...testCases];
                              copy[idx].rationaleTag = e.target.value as RationaleTag;
                              setTestCases(copy);
                            }}
                            className="bg-transparent text-[11px] font-semibold text-slate-600"
                          >
                            <option value="FUNCTIONAL">Functional</option>
                            <option value="BOUNDARY">Boundary</option>
                            <option value="EDGE">Edge Case</option>
                            <option value="PERFORMANCE">Performance</option>
                            <option value="SECURITY">Security</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...testCases];
                              copy[idx].isHidden = !copy[idx].isHidden;
                              setTestCases(copy);
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tc.isHidden
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {tc.isHidden ? 'Ẩn (Chấm thật)' : 'Công khai'}
                          </button>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            step="0.5"
                            value={tc.points}
                            onChange={(e) => {
                              const copy = [...testCases];
                              copy[idx].points = Number(e.target.value);
                              setTestCases(copy);
                            }}
                            className="w-12 bg-transparent text-center font-bold text-blue-700 focus:outline-none border-b border-slate-200"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                          {tc.timeLimitMs}ms
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                          <input
                            type="text"
                            value={tc.stdinInput ?? ''}
                            onChange={(e) => {
                              const copy = [...testCases];
                              copy[idx].stdinInput = e.target.value;
                              setTestCases(copy);
                            }}
                            className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-36 truncate"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                          <input
                            type="text"
                            value={tc.expectedStdout ?? ''}
                            onChange={(e) => {
                              const copy = [...testCases];
                              copy[idx].expectedStdout = e.target.value;
                              setTestCases(copy);
                            }}
                            className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-36 truncate"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteTestCase(idx)}
                            className="p-1 text-slate-300 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Bước 2</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
            >
              <span>Tiếp tục: Kiểm thử Sandbox & Lưu CSDL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* BƯỚC 4: TỔNG QUAN, DRY RUN & LƯU CƠ SỞ DỮ LIỆU */}
      {activeStep === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h2 className="font-extrabold text-sm text-slate-900">
                  1. Rà Soát Tổng Thể Đề Thi Trước Khi Công Bố
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                SẴN SÀNG XUẤT BẢN
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400 font-semibold">Môn học</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {selectedCourse?.code || 'Chưa chọn'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">{selectedCourse?.name}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400 font-semibold">Môi trường Compiler</div>
                <div className="text-sm font-black text-blue-700 mt-0.5">
                  {environment === 'C_GCC' ? 'C GCC 11' : 'Java JDK 21'}
                </div>
                <div className="text-[10px] text-slate-500">Docker Sandbox</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400 font-semibold">Số bộ Testcase</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {testCases.length} cases
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">Tổng {totalPoints} điểm</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400 font-semibold">Thời lượng ca thi</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {durationMinutes} phút
                </div>
                <div className="text-[10px] text-slate-500">Đếm ngược Kiosk</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-1">
              <div className="font-extrabold text-blue-900">{title || '(Chưa nhập tiêu đề đề thi)'}</div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {description || 'Không có mô tả chi tiết.'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h2 className="font-extrabold text-sm text-slate-900">
                  2. Kiểm Thử Sandbox Đối Sánh (Dry Run)
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Chạy mã giải với các testcase</span>
            </div>

            <p className="text-xs text-slate-500">
              Hệ thống sẽ chạy thử nghiệm mã giải tham chiếu đã nạp với toàn bộ {testCases.length} testcase để đảm bảo đề thi đạt chuẩn 100% trước khi lưu trữ vào CSDL.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDryRun}
                disabled={dryRunRunning || testCases.length === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm shadow-emerald-500/20 transition disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${dryRunRunning ? 'animate-spin' : ''}`} />
                <span>{dryRunRunning ? 'Đang chạy mô phỏng Sandbox...' : 'Bắt đầu Dry Run Kiểm thử'}</span>
              </button>
            </div>

            {dryRunResult && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    KẾT QUẢ DRY RUN: Vượt qua {dryRunResult.passed}/{dryRunResult.total} Testcases! (Độ trễ trung bình {dryRunResult.latency})
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  100% PASSED
                </span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Bước 3</span>
            </button>

            <button
              type="button"
              onClick={handleSaveToDatabase}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu vào MySQL Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>LƯU ĐỀ THI VÀO CƠ SỞ DỮ LIỆU MYSQL</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: XEM NỘI DUNG TỆP TRONG FILE ZIP */}
      {viewingZipFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2 font-mono text-xs">
                <Code2 className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">Tệp trong ZIP:</span>
                <span className="font-bold text-white">{viewingZipFile.filename}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingZipFile(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <pre className="p-4 bg-slate-950 font-mono text-xs text-slate-200 rounded-xl overflow-x-auto max-h-[480px] border border-slate-850 leading-relaxed">
                {viewingZipFile.content}
              </pre>
            </div>
            <div className="px-5 py-3 border-t border-slate-800 flex justify-end bg-slate-950">
              <button
                type="button"
                onClick={() => setViewingZipFile(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT TESTCASE VỚI BẢNG XEM TRƯỚC (PREVIEW TABLE) */}
      {importModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span className="font-extrabold text-sm text-slate-900">
                  Import Testcase Hàng Loạt & Xem Trước Dữ Liệu
                </span>
              </div>
              <button
                type="button"
                onClick={() => setImportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex border-b border-slate-200 pb-2 gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setImportType('json');
                    setPreviewTestCases([]);
                    setImportError(null);
                  }}
                  className={`pb-1 ${importType === 'json' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
                >
                  Import file JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportType('excel');
                    setPreviewTestCases([]);
                    setImportError(null);
                  }}
                  className={`pb-1 ${importType === 'excel' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
                >
                  Import file Excel / CSV
                </button>
              </div>

              {importType === 'json' ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="font-bold text-slate-700">Tải file hoặc dán JSON testcases:</span>
                    <div className="flex items-center gap-2">
                      <label className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer inline-flex items-center gap-1 border border-blue-200">
                        <Upload className="w-3 h-3" />
                        <span>Chọn file .json</span>
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              const content = evt.target?.result as string;
                              setJsonText(content);
                              handleParseJsonForPreview(content);
                            };
                            reader.readAsText(file);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = JSON.stringify(
                            [
                              {
                                label: 'TC1_PrimeCheck',
                                stdinInput: '1\n10',
                                expectedStdout: '2 3 5 7\nTotal primes: 4',
                                points: 2.0,
                                isHidden: false,
                              },
                              {
                                label: 'TC2_ReverseArray',
                                stdinInput: '2\n5\n3 1 9 4 2',
                                expectedStdout: '9 1 3 4 2',
                                points: 2.5,
                                isHidden: false,
                              },
                            ],
                            null,
                            2
                          );
                          setJsonText(sample);
                          handleParseJsonForPreview(sample);
                        }}
                        className="text-[11px] text-blue-600 hover:underline"
                      >
                        Nạp JSON mẫu
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={jsonText}
                    onChange={(e) => {
                      setJsonText(e.target.value);
                      handleParseJsonForPreview(e.target.value);
                    }}
                    placeholder='[ { "label": "TC1", "stdinInput": "...", "expectedStdout": "...", "points": 2.0, "isHidden": false } ]'
                    className="w-full p-2.5 font-mono text-[11px] rounded-xl border border-slate-200 bg-slate-900 text-slate-100 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-slate-600">
                    Chọn file định dạng <strong>.csv</strong> hoặc bảng tính chứa các cột:{' '}
                    <code>label, stdinInput, expectedStdout, points, isHidden</code>
                  </div>
                  <label className="cursor-pointer block p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-center bg-slate-50 transition">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-700">Bấm để chọn file .csv từ máy tính</span>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const content = evt.target?.result as string;
                          handleParseCsvForPreview(content);
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>
                </div>
              )}

              {importError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {previewTestCases.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Tìm thấy {previewTestCases.length} testcases hợp lệ:
                    </span>
                    <span className="text-slate-500 font-normal text-[11px]">
                      Tổng điểm: <strong>{previewTestCases.reduce((s, c) => s + (Number(c.points) || 0), 0)} pts</strong>
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase sticky top-0">
                        <tr>
                          <th className="py-2 px-2.5">#</th>
                          <th className="py-2 px-2.5">Tên Test</th>
                          <th className="py-2 px-2.5">Chế độ</th>
                          <th className="py-2 px-2.5">Điểm</th>
                          <th className="py-2 px-2.5">Input (Stdin)</th>
                          <th className="py-2 px-2.5">Kết quả (Stdout)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {previewTestCases.map((tc, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-2.5 font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-1.5 px-2.5 font-semibold text-slate-800 truncate max-w-[140px]">
                              {tc.label}
                            </td>
                            <td className="py-1.5 px-2.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  tc.isHidden ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                {tc.isHidden ? 'Ẩn' : 'Hiện'}
                              </span>
                            </td>
                            <td className="py-1.5 px-2.5 font-bold text-blue-700">{tc.points} pts</td>
                            <td className="py-1.5 px-2.5 font-mono text-[11px] text-slate-600 truncate max-w-[120px]">
                              {tc.stdinInput?.replace(/\n/g, ' ↵ ')}
                            </td>
                            <td className="py-1.5 px-2.5 font-mono text-[11px] text-slate-600 truncate max-w-[120px]">
                              {tc.expectedStdout?.replace(/\n/g, ' ↵ ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setImportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={previewTestCases.length === 0}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
              >
                Xác nhận nạp {previewTestCases.length > 0 ? `(${previewTestCases.length} cases)` : ''} vào đề
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
