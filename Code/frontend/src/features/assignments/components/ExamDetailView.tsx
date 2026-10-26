'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, ShieldCheck, Users } from 'lucide-react';
import { assignmentService } from '../services/assignment.service';
import { getErrorMessage } from '@/lib/errors';
import { Assignment } from '../types/assignment.types';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { ExamDetailHeaderBanner } from './exam-detail/ExamDetailHeaderBanner';
import { ExamDetailTestcasesTab } from './exam-detail/ExamDetailTestcasesTab';
import { ExamDetailOverviewTab } from './exam-detail/ExamDetailOverviewTab';
import { ExamDetailSolutionTab } from './exam-detail/ExamDetailSolutionTab';
import { ExamDetailLoading, ExamDetailErrorView } from './exam-detail/ExamDetailStates';
import { ExamDetailTabsNav } from './exam-detail/ExamDetailTabsNav';
import { ExamSessionControlStrip } from './exam-detail/ExamSessionControlStrip';


interface ExamDetailViewProps {
  examId: string;
}

export const ExamDetailView: React.FC<ExamDetailViewProps> = ({ examId }) => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'testcases' | 'overview' | 'solution'>('testcases');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchExamDetail = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await assignmentService.getAssignmentById(examId);
      if (!data) {
        setError('Không tìm thấy thông tin đề thi trong hệ thống.');
      } else {
        setAssignment(data);
      }
    } catch (err: unknown) {
      console.error('Lỗi khi tải chi tiết đề thi:', err);
      setError(getErrorMessage(err, 'Không thể tải chi tiết đề thi. Vui lòng thử lại sau.'));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (examId) {
      fetchExamDetail();
    }
  }, [examId, fetchExamDetail]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  if (loading) return <ExamDetailLoading />;
  if (error || !assignment) return <ExamDetailErrorView error={error} />;

  const testCases = assignment.testCases || [];
  const solutions = assignment.solutions || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans pb-20">
      {/* 1. TOP BREADCRUMB & ACTION CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button asChild variant="ghost" className="h-9 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white w-fit shadow-2xs border border-slate-200/60">
          <Link href={ROUTES.LECTURER.EXAM_BANK}>
            <ArrowLeft className="size-4 mr-1.5" />
            <span>Quay lại Ngân hàng đề thi</span>
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="h-9 px-3.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-2xs">
            <Link href={`${ROUTES.LECTURER.EXAM_BANK_CREATE}?editId=${encodeURIComponent(assignment.id)}&type=PE_EXAM`}>
              <Edit3 className="size-3.5 mr-1.5 text-amber-700" />
              <span>Chỉnh sửa trong Wizard</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm" className="h-9 px-3.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-2xs">
            <Link href={ROUTES.LECTURER.EXAM_BANK_SUBMISSIONS(assignment.id)}>
              <Users className="size-3.5 mr-1.5" />
              <span>Xem bài nộp ({assignment._count?.submissions || 0})</span>
            </Link>
          </Button>

          <Button asChild size="sm" className="h-9 px-3.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xs">
            <Link href={ROUTES.LECTURER.LIVE_PROCTORING_ROOM(assignment.id)}>
              <ShieldCheck className="size-3.5 mr-1.5" />
              <span>🔴 Giám sát ca thi trực tiếp</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. EXAM HEADER BANNER */}
      <ExamDetailHeaderBanner assignment={assignment} />

      {/* 2.5. LIVE SESSION CONTROL & COUNTDOWN STRIP */}
      <ExamSessionControlStrip assignment={assignment} onRefresh={() => fetchExamDetail(true)} />


      {/* 3. NAVIGATION TABS */}
      <ExamDetailTabsNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        testCasesCount={testCases.length}
        solutionsCount={solutions.length}
      />

      {/* 4. TAB CONTENTS */}
      {activeTab === 'testcases' && (
        <ExamDetailTestcasesTab
          testCases={testCases}
          functionalMaxScore={assignment.functionalMaxScore ?? 8}
          selectedTagFilter={selectedTagFilter}
          onSelectTagFilter={setSelectedTagFilter}
          copiedKey={copiedKey}
          onCopy={handleCopy}
        />
      )}

      {activeTab === 'overview' && (
        <ExamDetailOverviewTab assignment={assignment} />
      )}

      {activeTab === 'solution' && (
        <ExamDetailSolutionTab
          solutions={solutions}
          copiedKey={copiedKey}
          onCopy={handleCopy}
        />
      )}
    </div>
  );
};
