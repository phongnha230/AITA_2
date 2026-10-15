'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bot,
} from 'lucide-react';
import { assignmentService } from '../services/assignment.service';
import { Assignment, LecturerSubmission } from '../types/assignment.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SubmissionsSummaryCard } from './submissions/SubmissionsSummaryCard';
import { SubmissionsTable } from './submissions/SubmissionsTable';
import { SubmissionDetailModal } from './submissions/SubmissionDetailModal';

interface LecturerSubmissionsViewProps {
  assignmentId: string;
}

export const LecturerSubmissionsView: React.FC<LecturerSubmissionsViewProps> = ({ assignmentId }) => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<LecturerSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedSubmission, setSelectedSubmission] = useState<LecturerSubmission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [assignData, subsData] = await Promise.all([
        assignmentService.getAssignmentById(assignmentId),
        assignmentService.getSubmissionsByAssignment(assignmentId),
      ]);
      setAssignment(assignData);
      setSubmissions(subsData);
    } catch (err: any) {
      showToast(err?.message || 'Không thể tải danh sách bài nộp');
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    if (assignmentId) {
      loadData();
    }
  }, [assignmentId, loadData]);

  // Re-grade with Sandbox
  const handleReGradeSandbox = async (subId: string) => {
    setActionLoadingId(`sandbox-${subId}`);
    try {
      await assignmentService.reGradeWithSandbox(subId);
      showToast('Đã kích hoạt chấm lại Sandbox thành công!');
      loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Kích hoạt Sandbox thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Re-grade with AI
  const handleReGradeAi = async (subId: string) => {
    setActionLoadingId(`ai-${subId}`);
    try {
      await assignmentService.reGradeWithAi(subId);
      showToast('Đã kích hoạt chấm lại AI Rubrics thành công!');
      loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Kích hoạt AI thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sub.user?.fullName?.toLowerCase().includes(q) ||
        sub.user?.email?.toLowerCase().includes(q) ||
        sub.paperCode?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = submissions.length;
    const graded = submissions.filter((s) => s.status === 'GRADED').length;
    const pending = total - graded;
    const avgScore =
      graded > 0
        ? (
            submissions
              .filter((s) => s.status === 'GRADED' && s.finalScore !== null)
              .reduce((sum, s) => sum + Number(s.finalScore || 0), 0) / graded
          ).toFixed(1)
        : '0.0';

    return { total, graded, pending, avgScore };
  }, [submissions]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'GRADED':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Đã chấm điểm
          </Badge>
        );
      case 'RUNNING_SANDBOX':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-amber-600 animate-spin" />
            Đang chạy Sandbox
          </Badge>
        );
      case 'RUNNING_AI':
        return (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-bold animate-pulse">
            <Bot className="w-3.5 h-3.5 mr-1 text-purple-600 animate-spin" />
            Đang chấm AI
          </Badge>
        );
      case 'QUEUED':
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Chờ xử lý
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
            Lỗi thực thi
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-800">Đang tải danh sách bài nộp...</h3>
        <p className="text-xs text-slate-500 mt-1">Đang kết nối hệ thống chấm bài AITA</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans pb-24">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button asChild variant="ghost" className="h-9 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white w-fit shadow-2xs border border-slate-200/60">
          <Link href={`/exam-bank/${assignmentId}`}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Quay lại Chi tiết đề thi</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="h-9 px-3.5 rounded-xl text-xs font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>Làm mới</span>
          </Button>

          <Button asChild size="sm" className="h-9 px-3.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
            <Link href="/live-proctoring">
              <span>Phòng thi trực tiếp</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Banner Summary */}
      <SubmissionsSummaryCard assignment={assignment} stats={stats} />

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border-slate-200/90 shadow-2xs p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên SV, email, mã đề..."
            aria-label="Tìm theo tên SV, email, mã đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl text-xs border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="lecturer-submissions-status-filter" className="text-xs font-semibold text-slate-500 shrink-0">Lọc trạng thái:</label>
          <select
            id="lecturer-submissions-status-filter"
            aria-label="Lọc trạng thái"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <option value="ALL">Tất cả ({submissions.length})</option>
            <option value="GRADED">Đã có điểm</option>
            <option value="RUNNING_SANDBOX">Đang chạy Sandbox</option>
            <option value="RUNNING_AI">Đang chấm AI</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="FAILED">Thất bại</option>
          </select>
        </div>
      </Card>

      {/* Submissions Table */}
      <SubmissionsTable
        submissions={filteredSubmissions}
        actionLoadingId={actionLoadingId}
        renderStatusBadge={renderStatusBadge}
        onSelectSubmission={(sub) => {
          setSelectedSubmission(sub);
          setIsDetailModalOpen(true);
        }}
        onReGradeSandbox={handleReGradeSandbox}
        onReGradeAi={handleReGradeAi}
      />

      {/* MODAL CHI TIẾT BÀI NỘP */}
      <SubmissionDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        submission={selectedSubmission}
        renderStatusBadge={renderStatusBadge}
        onReGradeSandbox={handleReGradeSandbox}
        onReGradeAi={handleReGradeAi}
      />
    </div>
  );
};
