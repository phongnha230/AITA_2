'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  RefreshCw,
  Cpu,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Sparkles,
  FileCode,
  GraduationCap,
} from 'lucide-react';
import { assignmentService } from '@/features/assignments/services/assignment.service';
import { adminDashboardService } from '../../services/admin-dashboard.service';
import { adminSubmissionService, type AdminSubmissionItem } from '../../services/admin-submission.service';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '@/components/ui/input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const AdminSubmissionsPage: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<AdminSubmissionItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Detail Modal
  const [selectedSub, setSelectedSub] = useState<AdminSubmissionItem | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminSubmissionService.getSubmissions();
      if (res && res.submissions && res.submissions.length > 0) {
        setSubmissions(res.submissions);
      } else {
        const data = await adminDashboardService.getDashboard();
        if (data && data.recentSubmissions && data.recentSubmissions.length > 0) {
          setSubmissions(data.recentSubmissions);
        } else {
          // Mock fallback if DB is empty
        setSubmissions([
          {
            id: 'sub-swd-01',
            studentName: 'Trần Đỗ Phong Nhã',
            studentEmail: 'phongnhatd@fpt.edu.vn',
            courseCode: 'SWD392',
            courseName: 'Kiến Trúc Phần Mềm',
            assignmentTitle: 'PE_Spring2026_SWD392_Practical',
            submittedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            status: 'GRADED',
            sandboxScore: 10,
            aiScore: 9.5,
            finalScore: 9.8,
          },
          {
            id: 'sub-swd-02',
            studentName: 'Nguyễn Anh Tuấn',
            studentEmail: 'tuanna@fpt.edu.vn',
            courseCode: 'SWD392',
            courseName: 'Kiến Trúc Phần Mềm',
            assignmentTitle: 'PE_Spring2026_SWD392_Practical',
            submittedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
            status: 'GRADED',
            sandboxScore: 8,
            aiScore: 8.5,
            finalScore: 8.2,
          },
          {
            id: 'sub-prf-01',
            studentName: 'Lê Hoàng Nam',
            studentEmail: 'namlh@fpt.edu.vn',
            courseCode: 'PRF192',
            courseName: 'Lập trình C',
            assignmentTitle: 'Lab 04: Matrix & Dynamic Array',
            submittedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
            status: 'RUNNING_SANDBOX',
            sandboxScore: 0,
            aiScore: 0,
            finalScore: 0,
          },
          {
            id: 'sub-csd-01',
            studentName: 'Phạm Minh Đức',
            studentEmail: 'ducpm@fpt.edu.vn',
            courseCode: 'CSD201',
            courseName: 'Cấu trúc dữ liệu & Giải thuật',
            assignmentTitle: 'Practical Exam 01: Binary Search Tree',
            submittedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
            status: 'FAILED',
            sandboxScore: 2,
            aiScore: 0,
            finalScore: 1.0,
          },
        ]);
      }
    }
    } catch {
      toast.error('Không thể tải danh sách bài nộp.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions.filter((s) => {
      const matchSearch =
        !q ||
        s.studentName.toLowerCase().includes(q) ||
        s.studentEmail.toLowerCase().includes(q) ||
        s.courseCode.toLowerCase().includes(q) ||
        s.assignmentTitle.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [submissions, search, statusFilter]);

  const handleRegradeSandbox = async (sub: AdminSubmissionItem) => {
    setActionLoadingId(`sandbox-${sub.id}`);
    try {
      await assignmentService.reGradeWithSandbox(sub.id);
      toast.success(`Đã kích hoạt Docker Sandbox chấm lại cho bài thi của ${sub.studentName}.`);
      await loadData();
    } catch {
      toast.error('Lỗi khi kích hoạt chấm lại Sandbox.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRegradeAi = async (sub: AdminSubmissionItem) => {
    setActionLoadingId(`ai-${sub.id}`);
    try {
      await assignmentService.reGradeWithAi(sub.id);
      toast.success(`Đã kích hoạt AI Rubric chấm lại cho bài thi của ${sub.studentName}.`);
      await loadData();
    } catch {
      toast.error('Lỗi khi kích hoạt AI chấm lại.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 font-semibold text-purple-700">
              <ClipboardCheck className="h-3.5 w-3.5" /> Giám sát Khảo thí
            </span>
            <span>Hệ thống theo dõi bài nộp &amp; chấm thi toàn cơ sở</span>
          </>
        }
        title="Giám sát Bài thi & Chấm bài Toàn trường"
        description="Theo dõi toàn bộ bài thi thực hành nộp vào hệ thống, kiểm soát điểm số Docker Sandbox, AI Rubric và quyền kích hoạt chấm lại theo yêu cầu."
        actions={
          <Button onClick={loadData}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên thí sinh, email, mã môn..."
            className="pl-9 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
          <div className="flex gap-1 overflow-x-auto">
            {['ALL', 'GRADED', 'RUNNING_SANDBOX', 'FAILED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL'
                  ? 'Tất cả'
                  : st === 'GRADED'
                  ? 'Đã chấm'
                  : st === 'RUNNING_SANDBOX'
                  ? 'Đang chạy'
                  : 'Lỗi'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Submissions Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead>Thí sinh</TableHead>
                <TableHead>Môn &amp; Đề thi</TableHead>
                <TableHead>Thời gian nộp</TableHead>
                <TableHead className="w-28 text-center">Docker Sandbox</TableHead>
                <TableHead className="w-28 text-center">AI Rubric</TableHead>
                <TableHead className="w-28 text-center">Tổng điểm</TableHead>
                <TableHead className="w-32">Trạng thái</TableHead>
                <TableHead className="text-right">Chấm lại</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-500 text-sm">
                    {loading ? 'Đang tải danh sách bài nộp...' : 'Không có bài nộp nào khớp bộ lọc.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <p className="font-semibold text-sm text-slate-900">{sub.studentName}</p>
                      <p className="text-xs text-slate-500 font-mono">{sub.studentEmail}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-xs text-blue-600">{sub.courseCode} - {sub.courseName}</p>
                      <p className="text-xs text-slate-700 truncate max-w-xs">{sub.assignmentTitle}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                      {new Date(sub.submittedAt).toLocaleTimeString('vi-VN')} •{' '}
                      {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-center font-bold text-sm">
                      <span className={sub.sandboxScore >= 8 ? 'text-emerald-600' : 'text-slate-700'}>
                        {sub.sandboxScore.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-sm">
                      <span className={sub.aiScore >= 8 ? 'text-purple-600' : 'text-slate-700'}>
                        {sub.aiScore.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-sm">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          sub.finalScore >= 8
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub.finalScore >= 5
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {sub.finalScore.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        tone={
                          sub.status === 'GRADED'
                            ? 'student'
                            : sub.status === 'RUNNING_SANDBOX' || sub.status === 'RUNNING_AI'
                            ? 'info'
                            : 'warning'
                        }
                        dot
                      >
                        {sub.status === 'GRADED'
                          ? 'Đã chấm'
                          : sub.status === 'RUNNING_SANDBOX'
                          ? 'Đang test Sandbox'
                          : sub.status === 'RUNNING_AI'
                          ? 'Đang chấm AI'
                          : sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoadingId === `sandbox-${sub.id}`}
                          onClick={() => handleRegradeSandbox(sub)}
                          className="h-8 text-xs font-semibold gap-1 text-slate-700 hover:text-blue-600"
                          title="Chấm lại bằng Docker Sandbox"
                        >
                          <Cpu className="h-3.5 w-3.5 text-blue-600" />
                          Sandbox
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoadingId === `ai-${sub.id}`}
                          onClick={() => handleRegradeAi(sub)}
                          className="h-8 text-xs font-semibold gap-1 text-slate-700 hover:text-purple-600"
                          title="Chấm lại bằng AI Rubric"
                        >
                          <Bot className="h-3.5 w-3.5 text-purple-600" />
                          AI
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
};
