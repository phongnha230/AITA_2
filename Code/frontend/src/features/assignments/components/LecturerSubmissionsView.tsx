'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Bot,
  ExternalLink,
  Github,
  FileArchive,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  Award,
  Users,
  Code2,
} from 'lucide-react';
import { assignmentService } from '../services/assignment.service';
import { Assignment, LecturerSubmission } from '../types/assignment.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LecturerSubmissionsViewProps {
  assignmentId: string;
}

export const LecturerSubmissionsView: React.FC<LecturerSubmissionsViewProps> = ({ assignmentId }) => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<LecturerSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    try {
      const [assignData, subsData] = await Promise.all([
        assignmentService.getAssignmentById(assignmentId),
        assignmentService.getSubmissionsByAssignment(assignmentId),
      ]);
      setAssignment(assignData);
      setSubmissions(subsData);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách bài nộp');
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
      showToast('Đã kích hoạt AI Rubrics đánh giá lại thành công!');
      loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Kích hoạt AI thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        sub.user?.fullName.toLowerCase().includes(query) ||
        sub.user?.email.toLowerCase().includes(query) ||
        sub.id.toLowerCase().includes(query) ||
        (sub.paperCode && sub.paperCode.toLowerCase().includes(query));

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
      <Card className="rounded-3xl border-slate-200 shadow-2xs p-6 md:p-8 bg-white">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs font-black bg-indigo-50 text-indigo-700 border-indigo-200">
            {assignment?.course?.code || 'SWD392'}
          </Badge>
          <Badge variant="secondary" className="text-xs font-semibold">
            {assignment?.environment === 'JAVA_JDK' ? 'Java JDK 21' : 'C GCC 11'}
          </Badge>
          <span className="text-xs text-slate-500">
            Hạn nộp: {assignment?.deadline ? new Date(assignment.deadline).toLocaleString('vi-VN') : 'Không giới hạn'}
          </span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Danh Sách Bài Nộp: {assignment?.title || 'Đề thi PE'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Quản lý toàn bộ bài nộp của sinh viên, theo dõi tiến độ thực thi Docker Sandbox và kết quả chấm điểm AI.
        </p>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400">Tổng bài nộp</div>
            <div className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>{stats.total} bài</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400">Đã hoàn thành chấm</div>
            <div className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{stats.graded} bài</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400">Chờ chấm / Đang chạy</div>
            <div className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{stats.pending} bài</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400">Điểm trung bình</div>
            <div className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>{stats.avgScore}/10</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border-slate-200/90 shadow-2xs p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên SV, email, mã đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl text-xs border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Lọc trạng thái:</span>
          <select
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

      {/* Submissions Table / Cards */}
      <Card className="rounded-3xl border-slate-200 shadow-2xs overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Sinh viên</th>
                <th className="py-3.5 px-4">Kênh nộp</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Sandbox</th>
                <th className="py-3.5 px-4 text-center">AI Rubric</th>
                <th className="py-3.5 px-4 text-center">Điểm Cuối</th>
                <th className="py-3.5 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Chưa có bài nộp nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const initials = (sub.user?.fullName || 'SV')
                    .trim()
                    .split(' ')
                    .slice(-2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition group">
                      {/* Sinh viên */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs shrink-0">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition truncate">
                              {sub.user?.fullName || 'Sinh viên'}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {sub.user?.email}
                            </div>
                            {sub.paperCode && (
                              <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                                Mã đề: {sub.paperCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Kênh nộp */}
                      <td className="py-4 px-4">
                        {sub.submissionChannel === 'GIT_COMMIT' ? (
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Github className="w-4 h-4 text-slate-800 shrink-0" />
                            <span>Git Commit</span>
                            {sub.gitRepoUrl && (
                              <a
                                href={sub.gitRepoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:text-indigo-800"
                                title="Mở repo Github"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <FileArchive className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>File ZIP</span>
                          </div>
                        )}
                      </td>

                      {/* Thời gian */}
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(sub.submittedAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-4 px-4 whitespace-nowrap">{renderStatusBadge(sub.status)}</td>

                      {/* Sandbox Score */}
                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">
                        {sub.sandboxScore !== null && sub.sandboxScore !== undefined
                          ? `${sub.sandboxScore}`
                          : '-'}
                      </td>

                      {/* AI Score */}
                      <td className="py-4 px-4 text-center font-mono font-bold text-purple-700">
                        {sub.aiScore !== null && sub.aiScore !== undefined ? `${sub.aiScore}` : '-'}
                      </td>

                      {/* Final Score */}
                      <td className="py-4 px-4 text-center font-mono font-black text-sm">
                        {sub.finalScore !== null && sub.finalScore !== undefined ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {sub.finalScore}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Xem chi tiết bài nộp */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setIsDetailModalOpen(true);
                            }}
                            className="h-8 px-2.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 text-xs font-semibold"
                            title="Xem chi tiết kết quả testcase"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>Chi tiết</span>
                          </Button>

                          {/* Chấm lại Sandbox */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionLoadingId === `sandbox-${sub.id}`}
                            onClick={() => handleReGradeSandbox(sub.id)}
                            className="h-8 px-2 rounded-lg text-slate-600 hover:text-slate-900 border-slate-200 text-xs"
                            title="Chạy lại kiểm thử Docker Sandbox"
                          >
                            {actionLoadingId === `sandbox-${sub.id}` ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </Button>

                          {/* Chấm lại AI */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionLoadingId === `ai-${sub.id}`}
                            onClick={() => handleReGradeAi(sub.id)}
                            className="h-8 px-2 rounded-lg text-slate-600 hover:text-purple-700 border-slate-200 text-xs"
                            title="Chạy lại thẩm định AI Rubrics"
                          >
                            {actionLoadingId === `ai-${sub.id}` ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                            ) : (
                              <Bot className="w-3.5 h-3.5 text-purple-600" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL CHI TIẾT BÀI NỘP */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 font-sans">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center justify-between">
              <span>Chi Tiết Bài Nộp Của Sinh Viên</span>
              {selectedSubmission && renderStatusBadge(selectedSubmission.status)}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Mã bài nộp: <code className="font-mono text-indigo-600">{selectedSubmission?.id}</code> • Sinh viên: {selectedSubmission?.user?.fullName} ({selectedSubmission?.user?.email})
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4 pt-2">
              {/* Tổng quan điểm số */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400">Điểm Sandbox (Testcases)</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">
                    {selectedSubmission.sandboxScore ?? '-'} / 10
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400">Điểm AI Rubric (Clean code)</div>
                  <div className="text-lg font-black text-purple-700 mt-0.5">
                    {selectedSubmission.aiScore ?? '-'} / 10
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400">Điểm Tổng Kết</div>
                  <div className="text-lg font-black text-emerald-700 mt-0.5">
                    {selectedSubmission.finalScore ?? '-'} / 10
                  </div>
                </div>
              </div>

              {/* Thông tin nộp bài */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Kênh nộp:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedSubmission.submissionChannel === 'GIT_COMMIT' ? 'Git Repository' : 'Tập tin nén (.zip)'}
                  </span>
                </div>
                {selectedSubmission.gitRepoUrl && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Git Repository:</span>
                    <a
                      href={selectedSubmission.gitRepoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      {selectedSubmission.gitRepoUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Thời gian nộp:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedSubmission.submittedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Trạng thái biên dịch:</span>
                  <span className={`font-semibold ${selectedSubmission.compileSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedSubmission.compileSuccess ? 'Thành công (0 error)' : 'Biên dịch thất bại'}
                  </span>
                </div>
              </div>

              {/* Testcases Details */}
              {selectedSubmission.testResults && selectedSubmission.testResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">Kết quả chạy Test Cases ({selectedSubmission.testResults.length} tests)</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedSubmission.testResults.map((tr, idx) => (
                      <div
                        key={tr.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700">Test #{idx + 1}</span>
                          <Badge
                            variant="outline"
                            className={
                              tr.verdict === 'PASSED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold'
                                : 'bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold'
                            }
                          >
                            {tr.verdict}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                          <span>{tr.executionTimeMs}ms</span>
                          <span className="font-bold text-slate-800">+{tr.earnedPoints} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReGradeSandbox(selectedSubmission.id)}
                  className="rounded-xl text-xs font-bold"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Chấm lại Sandbox
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleReGradeAi(selectedSubmission.id)}
                  className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Bot className="w-3.5 h-3.5 mr-1.5" />
                  Chấm lại AI
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
