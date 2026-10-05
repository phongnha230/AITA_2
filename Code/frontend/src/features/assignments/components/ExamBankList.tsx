'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  FileCode,
  Search,
  RefreshCw,
  Trash2,
  Layers,
  Terminal,
  Clock,
  Eye,
} from 'lucide-react';
import { assignmentService } from '../services/assignment.service';
import { Assignment, Course } from '../types/assignment.types';

export const ExamBankList: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const [assignList, courseList] = await Promise.all([
        assignmentService.getAssignments(),
        assignmentService.getCourses(),
      ]);
      setAssignments(assignList);
      setCourses(courseList);
    } catch (err) {
      console.error('Lỗi tải danh sách đề thi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đề thi: "${title}" khỏi hệ thống CSDL?`)) return;
    setDeletingId(id);
    try {
      await assignmentService.deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(`Lỗi khi xóa đề thi: ${err.message || err}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = assignments.filter((a) => {
    if (selectedCourseFilter !== 'ALL') {
      const match = a.courseId === selectedCourseFilter || a.course?.code === selectedCourseFilter;
      if (!match) return false;
    }
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      (a.course?.code || '').toLowerCase().includes(q) ||
      (a.course?.name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* 1. TOP HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-500">
            <span>Ngân hàng Đề thi Thực hành</span>
            <span>•</span>
            <span className="text-blue-600 font-bold">Khảo thí & Chấm tự động PE</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản lý Đề thi & Bộ Testcase PE
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Xem lại chi tiết đề bài, kiểm tra bộ testcase, xem code bài giải mẫu và cấu hình môi trường chấm.
          </p>
        </div>

        <Link
          href="/exam-bank/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đề thi PE mới</span>
        </Link>
      </div>

      {/* 3. SEARCH & COURSE FILTER TABS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tiêu đề đề thi, mã môn (PRF192, CSD201)..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAssignments}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới danh sách</span>
            </button>
          </div>
        </div>

        {/* Course Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold mr-1 text-[11px]">Lọc theo môn:</span>
          <button
            onClick={() => setSelectedCourseFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              selectedCourseFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({assignments.length})
          </button>
          {courses.map((c) => {
            const count = assignments.filter((a) => a.courseId === c.id || a.course?.code === c.code).length;
            const isSelected = selectedCourseFilter === c.id || selectedCourseFilter === c.code;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCourseFilter(c.code)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.code} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ASSIGNMENT CARDS LIST */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span>Đang tải danh sách đề thi...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
          <FileCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-sm text-slate-800">Chưa có đề thi nào trong ngân hàng</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Hãy tạo đề thi đầu tiên với file PDF đề, starter code và bộ testcase để bắt đầu!
          </p>
          <Link
            href="/exam-bank/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Tạo đề thi PE ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const isPublished = item.status === 'PUBLISHED';
            const isJava = item.environment === 'JAVA_JDK';
            const testcaseCount = item.testCases ? item.testCases.length : 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {item.course?.code || 'Đề thi PE'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isPublished ? '● ĐÃ XUẤT BẢN' : 'BẢN NHÁP'}
                    </span>
                  </div>

                  <Link href={`/exam-bank/${item.id}`} className="hover:text-blue-600 transition block">
                    <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug hover:text-blue-600">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {item.description || 'Không có mô tả chi tiết.'}
                  </p>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Terminal className="w-3.5 h-3.5 text-blue-600" />
                        <span>Môi trường Sandbox:</span>
                      </span>
                      <span className="font-bold text-slate-800 text-[11px]">
                        {isJava ? 'Java JDK 21' : 'C GCC 11'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Layers className="w-3.5 h-3.5 text-amber-500" />
                        <span>Bộ Testcase tự động:</span>
                      </span>
                      <span className="font-bold text-slate-800 text-[11px]">
                        {testcaseCount} testcases đã lưu
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Thời lượng nộp bài:</span>
                      </span>
                      <span className="font-bold text-slate-800 text-[11px]">
                        120 phút
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {item.id.substring(0, 8)}...
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      disabled={deletingId === item.id}
                      title="Xóa đề thi khỏi CSDL"
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* View Details & Testcases Button */}
                    <Link
                      href={`/exam-bank/${item.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem Chi tiết & Testcase</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      </div>
  );
};
