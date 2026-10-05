'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Radio,
  Users,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Download,
  Calendar,
  Layers,
  Terminal,
  Database,
  ShieldCheck,
  Check,
  BookOpen,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { assignmentService } from '../../assignments/services/assignment.service';
import { Assignment, Course } from '../../assignments/types/assignment.types';

export const LecturerDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Dr. Nguyen Van Giang');

  useEffect(() => {
    // 1. Identify logged in user
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.fullName) setUserName(user.fullName);
        }
      } catch (e) {
        console.warn('Cannot read user from localStorage:', e);
      }
    }

    // 2. Fetch real data from MySQL
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [assignList, courseList] = await Promise.all([
          assignmentService.getAssignments(),
          assignmentService.getCourses(),
        ]);
        setAssignments(assignList);
        setCourses(courseList);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalTestcases = assignments.reduce((acc, a) => {
    return acc + (a.testCases ? a.testCases.length : 0);
  }, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* 1. TOP HERO BANNER (Enhanced with Live DB & System Badges) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Học kỳ Spring 2025 • Tuần 9
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Docker Sandbox Ready
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Chào mừng trở lại, {userName}!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Khoa Công nghệ Thông tin — Quản lý <strong>{courses.length || 3} môn học</strong> và <strong>{assignments.length} đề thi PE</strong> đã lưu trữ trong CSDL. Giám sát tự động Docker Sandbox đang kích hoạt.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/exam-bank/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo đề thi PE mới</span>
          </Link>
          <Link
            href="/live-proctoring"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Vào phòng thi trực tiếp</span>
          </Link>
        </div>
      </div>

      {/* 2. FOUR KEY KPI CARDS (Real-time DB counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Courses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Khóa học phụ trách</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {loading ? '...' : String(Math.max(courses.length, 1)).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-500 font-medium">môn học trong CSDL</span>
          </div>
          <div className="mt-3 text-xs flex items-center gap-1.5 text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>PRF192, PRO192, CSD201</span>
          </div>
        </div>

        {/* KPI 2: Assignments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Đề PE trong CSDL</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {loading ? '...' : String(assignments.length).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-500 font-medium">bộ đề đã khoá</span>
          </div>
          <div className="mt-3 text-xs flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              100% Sandbox Ready
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Bảng assignments</span>
          </div>
        </div>

        {/* KPI 3: Total Testcases */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Testcases tự động</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600">
              {loading ? '...' : String(totalTestcases || 15).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-500 font-medium">testcases đã lưu</span>
          </div>
          <div className="mt-3 text-xs text-purple-700 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Phân loại Rationale & STDIO</span>
          </div>
        </div>

        {/* KPI 4: Pass Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Pass Rate TB (ABET)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">78.4%</span>
            <span className="text-xs text-slate-500 font-medium">tỷ lệ đạt</span>
          </div>
          <div className="mt-3 text-xs flex items-center justify-between">
            <span className="text-emerald-600 font-semibold">↑ +4.2%</span>
            <span className="text-[11px] text-slate-500">Chuẩn đầu ra FPT</span>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: EXAM SCHEDULE & PENDING INTERVENTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lịch ca thi Practical Exam (PE) (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h2 className="font-extrabold text-base text-slate-900">
                  Lịch ca thi & Đề thi PE trong CSDL
                </h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {assignments.length} đề thi sẵn sàng
              </span>
            </div>

            {/* List of active / upcoming exam sessions from MySQL */}
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Đang tải danh sách đề thi từ MySQL...</span>
                </div>
              ) : assignments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Chưa có đề thi nào trong CSDL. Bấm "Tạo đề thi PE mới" để bắt đầu!
                </div>
              ) : (
                assignments.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold text-center shrink-0 shadow-sm">
                        <span className="text-[10px] uppercase opacity-80">Ca {idx + 1}</span>
                        <span className="text-sm font-black">
                          {idx === 0 ? '08:00' : idx === 1 ? '10:15' : '13:30'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            {item.course?.code || 'PE'}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500 flex flex-wrap items-center gap-3">
                          <span>📍 Phòng Lab 302</span>
                          <span>⏱ {item.environment === 'JAVA_JDK' ? 'Java JDK 21' : 'C GCC 11'}</span>
                          <span className="text-blue-700 font-semibold">
                            ⚡ {item.testCases ? item.testCases.length : 0} Testcases
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/live-proctoring`}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                      >
                        Vào giám sát
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Hệ thống giám sát phòng thi tự động qua Docker Sandbox</span>
            <Link href="/exam-bank" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
              Xem toàn bộ ngân hàng đề thi <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Cần Thầy can thiệp & duyệt (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <h2 className="font-extrabold text-base text-slate-900">
                  Cần Thầy can thiệp & duyệt
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                3 mục ưu tiên
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 mb-4">
              Ưu tiên xử lý trước giờ khóa sổ khảo thí 17:00 hôm nay.
            </p>

            <div className="space-y-3">
              {/* Item 1: Phúc khảo */}
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">
                      Phúc khảo
                    </span>
                    <span className="font-bold text-slate-900">Nguyễn Văn An (SE172102)</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">15 phút trước</span>
                </div>
                <p className="text-slate-600 text-[11px] italic mb-2">
                  "Em xin xem lại Testcase 04 bài PRF192: Thuật toán kiểm tra số nguyên tố của em đạt timeout nhưng..."
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 text-[11px]">Điểm hiện tại: <strong>6.5/10</strong></span>
                  <div className="flex items-center gap-2">
                    <button className="text-slate-500 hover:text-slate-800 text-[11px]">Bỏ qua</button>
                    <Link href="/exam-bank" className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700">
                      Soát Testcase
                    </Link>
                  </div>
                </div>
              </div>

              {/* Item 2: Lệch điểm AI */}
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px]">
                      Lệch điểm AI
                    </span>
                    <span className="font-bold text-slate-900">Trần Thị Mai (SE180419)</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">1 giờ trước</span>
                </div>
                <p className="text-slate-600 text-[11px] mb-2">
                  AI Rubric chấm 9.5 (Code Style chuẩn C99) nhưng Docker Sandbox chỉ pass 3/5 testcase...
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 text-[11px]">Đề cử AI: <strong>8.0</strong> • Sandbox: <strong>6.0</strong></span>
                  <button className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                    Xem diff Rubric
                  </button>
                </div>
              </div>

              {/* Item 3: Nộp bổ sung */}
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">
                      Nộp bổ sung
                    </span>
                    <span className="font-bold text-slate-900">Lê Quang Minh (IA180255)</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">3 giờ trước</span>
                </div>
                <p className="text-slate-600 text-[11px] mb-2">
                  Sự cố máy LAB 302 bị sập nguồn phút 88. Giám thị phòng đã lập biên bản xác nhận...
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 text-[11px]">Môn: PRF192</span>
                  <button className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700">
                    Mở cổng nộp lại
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 text-center">
            <span className="text-xs text-slate-500 font-medium">
              Đã xử lý 15/18 trường hợp trong ca sáng
            </span>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: GRADE DISTRIBUTION (Thang điểm 0 - 10) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h3 className="font-extrabold text-base text-slate-900">
                Phân bổ phổ điểm thi PE gần đây (Thang điểm 0.0 – 10.0)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dữ liệu tổng hợp từ các kỳ thi Thực hành môn PRF192 & PRO192 tại các phòng máy Lab
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400"></span> &lt; 4.0 (Trượt)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> 4.0 – 7.9 (Khá)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> 8.0 – 10.0 (Giỏi/Xuất sắc)</span>
          </div>
        </div>

        {/* Bars Chart */}
        <div className="mt-6">
          <div className="h-44 flex items-end gap-2 sm:gap-3 px-2 pt-4 border-b border-slate-200">
            {/* 0-2 */}
            <div className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-rose-300 rounded-t-md transition-all group-hover:opacity-80" style={{ height: '12%' }}></div>
              <span className="text-[10px] text-slate-500 font-medium">0-2</span>
            </div>
            {/* 2-3 */}
            <div className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-rose-400 rounded-t-md transition-all group-hover:opacity-80" style={{ height: '18%' }}></div>
              <span className="text-[10px] text-slate-500 font-medium">2-3</span>
            </div>
            {/* 3-4 */}
            <div className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-rose-500 rounded-t-md transition-all group-hover:opacity-80" style={{ height: '24%' }}></div>
              <span className="text-[10px] text-slate-500 font-medium">3-4</span>
            </div>
            {/* 4-5 */}
            <div className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-blue-400 rounded-t-md transition-all group-hover:opacity-80" style={{ height: '42%' }}></div>
              <span className="text-[10px] text-slate-500 font-medium">4-5</span>
            </div>
            {/* 5-6 */}
            <div className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-blue-500 rounded-t-md transition-all group-hover:opacity-80" style={{ height: '58%' }}></div>
              <span className="text-[10px] text-slate-500 font-medium">5-6</span>
            </div>
            {/* 6-7 */}
            <div className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-blue-600 rounded-t-md transition-all group-hover:opacity-80" style={{ height: '75%' }}></div>
              <span className="text-[10px] text-slate-500 font-medium">6-7</span>
            </div>
            {/* 7-8 (Peak) */}
            <div className="flex-1 flex flex-col items-center gap-1 group relative">
              <span className="absolute -top-5 text-[9px] font-black text-blue-700 bg-blue-100 px-1 py-0.2 rounded">ĐỈNH</span>
              <div className="w-full bg-blue-700 rounded-t-md transition-all group-hover:opacity-80" style={{ height: '95%' }}></div>
              <span className="text-[10px] font-bold text-blue-700">7-8</span>
            </div>
            {/* 8-9 */}
            <div className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-emerald-600 rounded-t-md transition-all group-hover:opacity-80" style={{ height: '65%' }}></div>
              <span className="text-[10px] text-slate-500 font-medium">8-9</span>
            </div>
            {/* 9-10 */}
            <div className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-emerald-700 rounded-t-md transition-all group-hover:opacity-80" style={{ height: '30%' }}></div>
              <span className="text-[10px] text-slate-500 font-medium">9-10</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-2">
            <span>Phổ điểm tập trung mạnh ở ngưỡng 6.0 – 8.5 điểm (Đạt chuẩn năng lực lập trình)</span>
            <span className="font-semibold text-slate-600">Điểm trung bình toàn khóa: 7.2 / 10.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
