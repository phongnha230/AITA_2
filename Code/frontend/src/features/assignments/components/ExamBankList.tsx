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
  AlertCircle,
} from 'lucide-react';
import { assignmentService } from '../services/assignment.service';
import { Assignment, Course } from '../types/assignment.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* 1. TOP HEADER */}
      <Card className="rounded-2xl border-slate-200 shadow-2xs p-6 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-500">
            <span>Ngân hàng Đề thi Thực hành</span>
            <span>•</span>
            <span className="text-indigo-600 font-bold">Khảo thí & Chấm tự động PE</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản lý Đề thi & Bộ Testcase PE
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Xem lại chi tiết đề bài, kiểm tra bộ testcase, xem code bài giải mẫu và cấu hình môi trường chấm.
          </p>
        </div>

        <Button asChild className="h-10 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shrink-0">
          <Link href="/exam-bank/create">
            <Plus className="w-4 h-4 mr-1.5 shrink-0" />
            <span>Tạo đề thi PE mới</span>
          </Link>
        </Button>
      </Card>

      {/* 2. SEARCH & COURSE FILTER TABS */}
      <Card className="rounded-2xl border-slate-200 shadow-2xs p-4 bg-white space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tiêu đề đề thi, mã môn (PRF192, CSD201)..."
              className="pl-9 h-9 bg-white border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus-visible:ring-indigo-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAssignments}
              disabled={loading}
              className="h-9 px-3 rounded-xl text-xs font-semibold border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới danh sách</span>
            </Button>
          </div>
        </div>

        {/* Course Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold mr-1 text-[11px]">Lọc theo môn:</span>
          <Button
            variant={selectedCourseFilter === 'ALL' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setSelectedCourseFilter('ALL')}
            className={`h-7 px-3 rounded-lg text-xs font-bold transition ${
              selectedCourseFilter === 'ALL'
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Tất cả ({assignments.length})
          </Button>
          {courses.map((c) => {
            const count = assignments.filter((a) => a.courseId === c.id || a.course?.code === c.code).length;
            const isSelected = selectedCourseFilter === c.id || selectedCourseFilter === c.code;
            return (
              <Button
                key={c.id}
                variant={isSelected ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCourseFilter(c.code)}
                className={`h-7 px-3 rounded-lg text-xs font-bold transition ${
                  isSelected
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {c.code} ({count})
              </Button>
            );
          })}
        </div>
      </Card>

      {/* 3. ASSIGNMENT CARDS LIST */}
      {loading ? (
        <Card className="rounded-2xl border-slate-200 shadow-2xs p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span>Đang tải danh sách đề thi từ CSDL...</span>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-500 shadow-2xs flex flex-col items-center justify-center">
          <FileCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-sm text-slate-800">Chưa có đề thi nào trong ngân hàng</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Hãy tạo đề thi đầu tiên với file PDF đề, starter code và bộ testcase để bắt đầu!
          </p>
          <Button asChild className="h-9 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
            <Link href="/exam-bank/create">
              <Plus className="w-4 h-4 mr-1.5" /> Tạo đề thi PE ngay
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const isPublished = item.status === 'PUBLISHED';
            const isJava = item.environment === 'JAVA_JDK';
            const testcaseCount = item.testCases ? item.testCases.length : 0;

            return (
              <Card
                key={item.id}
                className="rounded-2xl border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between overflow-hidden bg-white"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className="font-mono text-xs font-bold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border-indigo-200"
                    >
                      {item.course?.code || 'Đề thi PE'}
                    </Badge>
                    <Badge
                      variant={isPublished ? 'default' : 'secondary'}
                      className={
                        isPublished
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px]'
                          : 'bg-slate-100 text-slate-600 font-bold text-[10px]'
                      }
                    >
                      {isPublished ? '● ĐÃ XUẤT BẢN' : 'BẢN NHÁP'}
                    </Badge>
                  </div>

                  <Link href={`/exam-bank/${item.id}`} className="hover:text-indigo-600 transition block">
                    <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug hover:text-indigo-600">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {item.description || 'Không có mô tả chi tiết.'}
                  </p>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Terminal className="w-3.5 h-3.5 text-indigo-600" />
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

                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {item.id.substring(0, 8)}...
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id, item.title)}
                      disabled={deletingId === item.id}
                      title="Xóa đề thi khỏi CSDL"
                      className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-xl text-xs font-bold bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200 transition shadow-2xs"
                    >
                      <Link href={`/exam-bank/${item.id}`}>
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>Chi tiết</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
