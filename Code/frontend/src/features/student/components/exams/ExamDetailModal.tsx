'use client';

import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Clock,
  Code2,
  Cpu,
  FileCode,
  HardDriveUpload,
  Layers,
  Scale,
  Sparkles,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { studentService } from '../../services/student.service';
import type {
  AssignmentRubric,
  AssignmentTestCase,
  StudentExamViewModel,
} from '../../types/student.types';

interface ExamDetailModalProps {
  exam: StudentExamViewModel | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSubmit: () => void;
}

export function ExamDetailModal({
  exam,
  isOpen,
  onClose,
  onOpenSubmit,
}: ExamDetailModalProps) {
  const [testCases, setTestCases] = useState<AssignmentTestCase[]>([]);
  const [rubrics, setRubrics] = useState<AssignmentRubric[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (!isOpen || !exam) return;
    let active = true;
    setIsLoadingDetails(true);

    Promise.allSettled([
      studentService.getAssignmentTestCases(exam.assignment.id),
      studentService.getAssignmentRubrics(exam.assignment.id),
    ]).then(([tcResult, rbResult]) => {
      if (!active) return;
      if (tcResult.status === 'fulfilled') setTestCases(tcResult.value);
      if (rbResult.status === 'fulfilled') setRubrics(rbResult.value);
      setIsLoadingDetails(false);
    });

    return () => { active = false; };
  }, [isOpen, exam]);

  if (!exam) return null;

  const { assignment, course } = exam;
  const sampleTestCases = testCases.filter((tc) => tc.isSample);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileCode size={18} />
            </span>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {assignment.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            {course ? `${course.code} • ${course.name} (Học kỳ ${course.semester})` : 'Môn học khảo thí'}
          </DialogDescription>
        </DialogHeader>

        {/* General Meta Information */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Môi trường Sandbox</span>
            <span className="font-bold text-slate-800 font-mono">{assignment.environment}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Hình thức thi</span>
            <span className="font-bold text-slate-800">{assignment.submissionType === 'GROUP' ? 'Nhóm' : 'Cá nhân'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Kênh nộp bài</span>
            <span className="font-bold text-indigo-700">
              {[
                assignment.allowZipSubmission !== false ? 'File .ZIP' : null,
                assignment.allowGitSubmission ? 'GitHub' : null,
              ].filter(Boolean).join(' / ') || 'Tự do'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Hạn nộp</span>
            <span className="font-semibold text-rose-600">{new Date(assignment.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Problem Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Layers size={14} className="text-indigo-600" />
            Đặc tả đề bài
          </h4>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-xs leading-relaxed text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap">
            {assignment.description || 'Chưa có mô tả chi tiết cho đề thi này.'}
          </div>
        </div>

        {/* Sample Test Cases */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Cpu size={14} className="text-indigo-600" />
            Testcase mẫu công khai ({sampleTestCases.length})
          </h4>
          {sampleTestCases.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sampleTestCases.map((tc, index) => (
                <div key={tc.id || index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-sans font-semibold">
                    <span>Testcase #{index + 1}</span>
                    <span>Trọng số: {tc.scoreWeight}đ • Giới hạn: {tc.timeLimitMs}ms</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Đầu vào (Input):</span>
                      <pre className="rounded bg-slate-900 text-slate-100 p-2 overflow-x-auto text-[10px]">
                        {tc.inputData || '(Không có)'}
                      </pre>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Đầu ra kỳ vọng (Expected Output):</span>
                      <pre className="rounded bg-slate-900 text-emerald-400 p-2 overflow-x-auto text-[10px]">
                        {tc.expectedOutput || '(Không có)'}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Đề thi chưa công bố testcase mẫu trước giờ làm bài.</p>
          )}
        </div>

        {/* Rubrics Criteria */}
        {rubrics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Scale size={14} className="text-indigo-600" />
              Thang điểm Rubric đánh giá ({rubrics.length})
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {rubrics.map((rubric) => (
                <div key={rubric.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-800">{rubric.criteriaName}</p>
                    {rubric.description && <p className="text-[11px] text-slate-500 mt-0.5">{rubric.description}</p>}
                  </div>
                  <span className="rounded-md bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 text-xs shrink-0">
                    +{rubric.maxPoints}đ
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="pt-3 gap-2 sm:gap-0 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 text-xs rounded-lg"
          >
            Đóng
          </Button>
          <Button
            type="button"
            onClick={() => {
              onClose();
              onOpenSubmit();
            }}
            className="h-10 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5"
          >
            <HardDriveUpload size={15} />
            <span>Nộp bài thi này</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
