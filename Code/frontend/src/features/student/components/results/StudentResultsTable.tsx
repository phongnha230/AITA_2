'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileSearch,
  Filter,
  Layers,
  RefreshCw,
  Search,
  TrendingUp,
  Award,
} from 'lucide-react';
import type { StudentSubmissionListItem } from '../../types/student.types';

interface StudentResultsTableProps {
  submissions: StudentSubmissionListItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectSubmission: (id: string) => void;
  onOpenAiTutor: (sub: StudentSubmissionListItem) => void;
}

const PAGE_SIZE = 6;

export function StudentResultsTable({
  submissions,
  isLoading,
  onRefresh,
  onSelectSubmission,
  onOpenAiTutor,
}: StudentResultsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Available courses from submissions
  const availableCourses = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      if (s.courseCode) set.add(s.courseCode);
    });
    return Array.from(set).sort();
  }, [submissions]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourse, selectedStatus]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchSearch =
        !searchQuery.trim() ||
        s.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.paperCode && s.paperCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.courseCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCourse =
        selectedCourse === 'ALL' || s.courseCode === selectedCourse;

      const matchStatus =
        selectedStatus === 'ALL' || s.status === selectedStatus;

      return matchSearch && matchCourse && matchStatus;
    });
  }, [submissions, searchQuery, selectedCourse, selectedStatus]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE));
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSubmissions.slice(start, start + PAGE_SIZE);
  }, [filteredSubmissions, currentPage]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = submissions.length;
    if (total === 0) return { total: 0, avgScore: '0', passRate: 0, passedCount: 0 };

    const graded = submissions.filter((s) => s.status === 'GRADED');
    const passed = graded.filter((s) => Number(s.finalScore ?? 0) >= 5.0);
    const sumScore = graded.reduce((acc, cur) => acc + Number(cur.finalScore ?? 0), 0);
    const avgScore = graded.length > 0 ? (sumScore / graded.length).toFixed(1) : '0';
    const passRate = graded.length > 0 ? Math.round((passed.length / graded.length) * 100) : 0;

    return {
      total,
      avgScore,
      passRate,
      passedCount: passed.length,
    };
  }, [submissions]);

  return (
    <div className="space-y-4">
      {/* Compact SaaS Metric Summary Strip (Nhỏ gọn, thanh mảnh) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {/* Card 1: Tổng bài thi */}
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-2xs">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Layers className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-3xs font-medium uppercase tracking-wider text-slate-500 truncate">Tổng bài thi</p>
            <p className="text-sm font-black text-slate-900 leading-tight">{stats.total}</p>
          </div>
        </div>

        {/* Card 2: Điểm trung bình */}
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-2xs">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-3xs font-medium uppercase tracking-wider text-slate-500 truncate">Điểm TB (GPA)</p>
            <p className="text-sm font-black text-slate-900 leading-tight">
              {stats.avgScore} <span className="text-3xs font-normal text-slate-400">/ 10</span>
            </p>
          </div>
        </div>

        {/* Card 3: Tỉ lệ đạt */}
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-2xs">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Award className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-3xs font-medium uppercase tracking-wider text-slate-500 truncate">Tỉ lệ đạt</p>
            <p className="text-sm font-black text-emerald-600 leading-tight">{stats.passRate}%</p>
          </div>
        </div>

        {/* Card 4: Socratic AI */}
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-2xs">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Brain className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-3xs font-medium uppercase tracking-wider text-slate-500 truncate">Socratic AI</p>
            <p className="text-2xs font-bold text-slate-800 leading-tight flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Sẵn sàng
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-elevated-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bài thi, mã đề (Paper Code) hoặc môn..."
            className="h-8.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 text-xs text-slate-900 shadow-inner outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Course Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-2xs text-slate-700">
            <Filter className="size-3 text-slate-400" />
            <select
              aria-label="Lọc theo môn học"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-transparent font-medium outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Tất cả môn học</option>
              {availableCourses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-2xs text-slate-700">
            <select
              aria-label="Lọc theo trạng thái chấm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-medium outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="GRADED">Đã chấm xong</option>
              <option value="REVIEW_PENDING">Chờ duyệt điểm</option>
              <option value="GRADING">Đang chấm</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Làm mới danh sách bài nộp"
            className="inline-flex size-8.5 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-elevated">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-2xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Bài thi &amp; Môn học</th>
                <th className="px-4 py-3">Thời gian &amp; Lần nộp</th>
                <th className="px-4 py-3 text-center">Trạng thái &amp; Điểm số</th>
                <th className="px-4 py-3">Nhận xét tóm tắt của AI</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                // Skeleton loading rows
                [...Array(PAGE_SIZE)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-3.5">
                      <div className="h-4 w-40 rounded-sm bg-slate-200" />
                      <div className="mt-1.5 h-3 w-24 rounded-sm bg-slate-100" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-3 w-28 rounded-sm bg-slate-200" />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="mx-auto h-6 w-16 rounded-lg bg-slate-200" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-3 w-48 rounded-sm bg-slate-100" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="ml-auto h-7 w-24 rounded-xl bg-slate-200" />
                    </td>
                  </tr>
                ))
              ) : paginatedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSearch className="size-8 text-slate-300" />
                      <p className="font-semibold text-slate-700">Không tìm thấy bài thi nào</p>
                      <p className="text-2xs text-slate-400">
                        {searchQuery
                          ? 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ lọc môn học.'
                          : 'Bạn chưa có bài nộp nào trên hệ thống.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSubmissions.map((sub) => {
                  const score = Number(sub.finalScore ?? 0);
                  const isPassed = score >= 5.0;
                  const isGraded = sub.status === 'GRADED';
                  const isPendingReview = sub.status === 'REVIEW_PENDING';
                  const isGrading = sub.status === 'GRADING' || sub.status === 'PENDING';

                  return (
                    <tr
                      key={sub.id}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      {/* Column 1: Assignment & Course */}
                      <td className="px-5 py-3.5 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-2xs font-bold text-blue-700 border border-blue-200/60">
                              {sub.courseCode || 'PE'}
                            </span>
                            {sub.paperCode && (
                              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-2xs font-semibold text-slate-700 border border-slate-200">
                                Đề: {sub.paperCode}
                              </span>
                            )}
                            <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-2xs text-slate-500 border border-slate-200">
                              {sub.environment || 'Docker'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSelectSubmission(sub.id)}
                            className="text-left font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mt-0.5"
                          >
                            {sub.assignmentTitle}
                          </button>
                          <span className="font-mono text-3xs text-slate-400">
                            ID: {sub.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>

                      {/* Column 2: Timestamp & Attempt */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex flex-col gap-1 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-slate-400 shrink-0" />
                            <span>{new Date(sub.submittedAt).toLocaleString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-2xs text-slate-400">
                            <span>Attempt #{sub.attemptNo ?? 1}</span>
                            <span>•</span>
                            <span className="uppercase">{sub.submissionChannel || 'WEB'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Score & Status */}
                      <td className="px-4 py-3.5 align-top text-center">
                        <div className="flex flex-col items-center gap-1">
                          {isGraded ? (
                            <div
                              className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-0.5 text-xs font-black shadow-2xs ${
                                isPassed
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span>{score.toFixed(1)}</span>
                              <span className="text-2xs font-medium text-slate-400">/10</span>
                            </div>
                          ) : isPendingReview ? (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-0.5 text-2xs font-bold text-amber-700 border border-amber-200">
                              Chờ duyệt điểm
                            </span>
                          ) : isGrading ? (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-0.5 text-2xs font-bold text-blue-700 border border-blue-200">
                              <RefreshCw className="size-3 animate-spin text-blue-600" />
                              Đang chấm
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-0.5 text-2xs font-semibold text-slate-600">
                              {sub.status}
                            </span>
                          )}

                          <div className="flex items-center gap-1.5 text-3xs text-slate-400 font-mono">
                            <span>Sandbox: <strong className="text-slate-600">{sub.sandboxScore ?? 0}</strong></span>
                            <span>|</span>
                            <span>AI: <strong className="text-blue-600">{sub.aiScore ?? 0}</strong></span>
                          </div>
                        </div>
                      </td>

                      {/* Column 4: AI Feedback / Notes */}
                      <td className="px-4 py-3.5 align-top max-w-[260px]">
                        <div className="flex flex-col gap-1">
                          {sub.aiFeedback ? (
                            <p className="text-2xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/80 p-1.5 rounded-lg border border-slate-200/60">
                              {sub.aiFeedback}
                            </p>
                          ) : isGraded ? (
                            <p className="text-2xs text-slate-400 italic">
                              Hệ thống đã hoàn tất chấm điểm tự động. Bấm trò chuyện để AI tư vấn chi tiết.
                            </p>
                          ) : (
                            <span className="text-2xs text-slate-400">Chưa có nhận xét</span>
                          )}

                          {(sub.timeComplexity || sub.spaceComplexity) && (
                            <div className="flex items-center gap-2 text-3xs text-slate-400 font-mono">
                              {sub.timeComplexity && <span>T: {sub.timeComplexity}</span>}
                              {sub.spaceComplexity && <span>S: {sub.spaceComplexity}</span>}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 5: Actions */}
                      <td className="px-5 py-3.5 align-top text-right">
                        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1.5">
                          {/* Contextual Socratic AI Tutor Trigger */}
                          <button
                            type="button"
                            onClick={() => onOpenAiTutor(sub)}
                            className="inline-flex h-7.5 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-2.5 text-2xs font-bold text-blue-700 shadow-2xs transition-colors hover:bg-blue-100 hover:border-blue-300"
                            title="Mở trợ giảng AI thảo luận về bài thi này"
                          >
                            <Brain className="size-3 text-blue-600" />
                            <span>Trò chuyện AI</span>
                          </button>

                          {/* View Full Submission Details */}
                          <button
                            type="button"
                            onClick={() => onSelectSubmission(sub.id)}
                            className="inline-flex h-7.5 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 text-2xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900"
                            title="Xem chi tiết điểm từng testcase và code"
                          >
                            <span>Chi tiết</span>
                            <ArrowRight className="size-3 text-slate-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Controls (Hiển thị 5-6 bài mỗi trang & nút 1, 2, 3...) */}
        {filteredSubmissions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 bg-slate-50/60 px-5 py-2.5 text-xs text-slate-600">
            <div className="text-2xs text-slate-500">
              Hiển thị <span className="font-bold text-slate-700">{(currentPage - 1) * PAGE_SIZE + 1}</span> -{' '}
              <span className="font-bold text-slate-700">
                {Math.min(currentPage * PAGE_SIZE, filteredSubmissions.length)}
              </span>{' '}
              trên tổng số <span className="font-bold text-slate-700">{filteredSubmissions.length}</span> bài thi (6 bài / trang)
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex h-7.5 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-2xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Trước</span>
                </button>

                {/* Numbered Page Buttons */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      totalPages > 6 &&
                      pageNum !== 1 &&
                      pageNum !== totalPages &&
                      Math.abs(pageNum - currentPage) > 1
                    ) {
                      if (pageNum === 2 || pageNum === totalPages - 1) {
                        return <span key={pageNum} className="px-0.5 text-2xs text-slate-400">...</span>;
                      }
                      return null;
                    }

                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`size-7.5 rounded-lg text-2xs font-bold transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex h-7.5 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-2xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>Sau</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
