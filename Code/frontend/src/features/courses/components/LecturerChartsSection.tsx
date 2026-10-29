'use client';

import React, { useMemo } from 'react';
import {
  BarChart as BarChartIcon,
  PieChart as PieIcon,
  Award,
  CheckCircle2,
  Activity,
  Code2,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BarChart, type BarItem } from '@/features/admin/components/ui/BarChart';
import { DonutChart, type DonutSegment } from '@/features/admin/components/ui/DonutChart';
import { AreaChart } from '@/features/admin/components/ui/AreaChart';
import type { Course, LecturerKpiMetrics, LecturerDashboardRecentSubmission } from '../types/course.types';

interface LecturerChartsSectionProps {
  courses: Course[];
  kpiMetrics: LecturerKpiMetrics;
  recentSubmissions?: LecturerDashboardRecentSubmission[];
  coursesOverview?: Array<{
    id: string;
    code: string;
    name: string;
    totalStudents: number;
    totalAssignments: number;
    totalSubmissions: number;
    averageScore: number;
  }>;
}

export const LecturerChartsSection: React.FC<LecturerChartsSectionProps> = ({
  courses,
  kpiMetrics,
  recentSubmissions = [],
  coursesOverview,
}) => {
  // 1. Dữ liệu biểu đồ cột: Đối chiếu Bài nộp & Số lượng sinh viên theo từng môn học
  const courseComparisonData: BarItem[] = (
    coursesOverview && coursesOverview.length > 0 ? coursesOverview : courses
  ).slice(0, 6).map((c: any) => {
    const studentCount = c.totalStudents ?? c.enrollmentCount ?? c._count?.enrollments ?? c.enrollments?.length ?? 1;
    const submissionsCount = c.totalSubmissions ?? (c.assignments
      ? c.assignments.reduce((sum: number, a: any) => sum + (a._count?.submissions ?? 0), 0)
      : 0);

    return {
      label: c.code,
      value: submissionsCount,
      secondaryValue: studentCount,
      subLabel: c.name.length > 22 ? `${c.name.slice(0, 22)}...` : c.name,
    };
  });

  // Fallback nếu chưa có khóa học nào
  const finalCourseData: BarItem[] =
    courseComparisonData.length > 0
      ? courseComparisonData
      : [
          { label: 'PRO192', value: 0, secondaryValue: 3, subLabel: 'OOP Java' },
          { label: 'CSD201', value: 0, secondaryValue: 6, subLabel: 'DSA' },
          { label: 'PRF192', value: 0, secondaryValue: 3, subLabel: 'C Basics' },
        ];

  // 2. Dữ liệu biểu đồ tròn: Phổ điểm sinh viên (tính theo bài nộp mới nhất của từng sinh viên)
  let gradeExcellent = 0; // >= 8.5
  let gradeGood = 0;      // 7.0 - 8.4
  let gradePass = 0;      // 5.0 - 6.9
  let gradeFail = 0;      // < 5.0

  // Lọc lấy bài nộp mới nhất của từng sinh viên để phản ánh đúng học lực thí sinh
  const latestByStudent = new Map<string, LecturerDashboardRecentSubmission>();
  for (const s of recentSubmissions) {
    if (s.studentId && !latestByStudent.has(s.studentId)) {
      latestByStudent.set(s.studentId, s);
    }
  }
  const scoredSubmissions = latestByStudent.size > 0 ? Array.from(latestByStudent.values()) : recentSubmissions;

  if (scoredSubmissions.length > 0) {
    scoredSubmissions.forEach((s) => {
      const score = Number(s.finalScore ?? s.sandboxScore ?? 0);
      if (score >= 8.5) gradeExcellent++;
      else if (score >= 7.0) gradeGood++;
      else if (score >= 5.0) gradePass++;
      else gradeFail++;
    });
  }

  const hasScoreData = gradeExcellent + gradeGood + gradePass + gradeFail > 0;

  const scoreSpectrumData: DonutSegment[] = hasScoreData
    ? [
        { name: 'Giỏi / Xuất sắc (≥ 8.5)', value: gradeExcellent, color: '#10b981' },
        { name: 'Khá (7.0 - 8.4)', value: gradeGood, color: '#2563eb' },
        { name: 'Trung bình (5.0 - 6.9)', value: gradePass, color: '#f59e0b' },
        { name: 'Cần cải thiện (< 5.0)', value: gradeFail, color: '#f43f5e' },
      ]
    : [
        { name: 'Giỏi / Xuất sắc (≥ 8.5)', value: 0, color: '#10b981' },
        { name: 'Khá (7.0 - 8.4)', value: 0, color: '#2563eb' },
        { name: 'Trung bình (5.0 - 6.9)', value: 0, color: '#f59e0b' },
        { name: 'Cần cải thiện (< 5.0)', value: 0, color: '#f43f5e' },
      ];

  // Tổng số bài nộp tính từ các khóa học
  const pendingCount = kpiMetrics.pendingGradingCount ?? 0;
  const totalSubmissions = coursesOverview && coursesOverview.length > 0
    ? coursesOverview.reduce((sum, c) => sum + (c.totalSubmissions ?? 0), 0)
    : courses.reduce((acc, c) => {
        const subCount = c.assignments
          ? c.assignments.reduce((sum, a) => sum + (a._count?.submissions ?? 0), 0)
          : 0;
        return acc + subCount;
      }, 0);
  const completedGrading = Math.max(0, totalSubmissions - pendingCount);

  const gradingProgressData: DonutSegment[] = [
    { name: 'Đã hoàn tất chấm', value: completedGrading, color: '#10b981' },
    { name: 'Chờ GV duyệt điểm', value: pendingCount, color: '#f59e0b' },
  ];

  // 3. Biểu đồ diện tích (AreaChart): Lưu lượng nộp bài & Tần suất chấm AI theo ca học
  const hourlyLabels = ['08:00', '10:00 (Ca 1)', '12:00', '14:00 (Ca 2)', '16:00', 'Hiện tại'];
  
  // Phân tích thời gian thực từ recentSubmissions nếu có, hoặc trả về 0 nếu chưa có bài nộp
  const { hourlySubmissions, hourlyAiCalls, hasHourlyData } = useMemo(() => {
    if (totalSubmissions === 0 || recentSubmissions.length === 0) {
      return {
        hourlySubmissions: [0, 0, 0, 0, 0, 0],
        hourlyAiCalls: [0, 0, 0, 0, 0, 0],
        hasHourlyData: false,
      };
    }

    const subCounts = [0, 0, 0, 0, 0, 0];
    const aiCounts = [0, 0, 0, 0, 0, 0];

    recentSubmissions.forEach((sub) => {
      if (!sub.submittedAt) return;
      const hour = new Date(sub.submittedAt).getHours();
      let bucket = 5; // Mặc định 'Hiện tại'
      if (hour < 9) bucket = 0;        // 08:00
      else if (hour < 11) bucket = 1;  // 10:00
      else if (hour < 13) bucket = 2;  // 12:00
      else if (hour < 15) bucket = 3;  // 14:00
      else if (hour < 17) bucket = 4;  // 16:00

      subCounts[bucket]++;
      if ((sub.aiScore ?? 0) > 0) {
        aiCounts[bucket]++;
      }
    });

    return {
      hourlySubmissions: subCounts,
      hourlyAiCalls: aiCounts,
      hasHourlyData: subCounts.some((v) => v > 0),
    };
  }, [totalSubmissions, recentSubmissions]);

  // 4. Biểu đồ tròn: Phân bổ Môi trường / Ngôn ngữ theo số lượng Môn học thực tế
  const languageData: DonutSegment[] = useMemo(() => {
    let javaCount = 0;
    let cGccCount = 0;
    let webCount = 0;
    let otherCount = 0;

    courses.forEach((c) => {
      const code = (c.code || '').toUpperCase();
      const name = (c.name || '').toUpperCase();
      if (code.includes('PRO') || code.includes('PRJ') || name.includes('JAVA')) {
        javaCount += 1;
      } else if (
        code.includes('PRF') ||
        code.includes('CSD') ||
        name.includes('C ') ||
        name.includes('C++') ||
        name.includes('GIẢI THUẬT')
      ) {
        cGccCount += 1;
      } else if (code.includes('WEB') || code.includes('JS') || name.includes('NODE') || name.includes('REACT')) {
        webCount += 1;
      } else {
        otherCount += 1;
      }
    });

    const segments: DonutSegment[] = [];
    if (javaCount > 0) {
      segments.push({ name: 'Java (JDK 21)', value: javaCount, color: '#f97316' });
    }
    if (cGccCount > 0) {
      segments.push({ name: 'C / C++ (GCC 13)', value: cGccCount, color: '#2563eb' });
    }
    if (webCount > 0) {
      segments.push({ name: 'Node.js / Web', value: webCount, color: '#10b981' });
    }
    if (otherCount > 0) {
      segments.push({ name: 'Khác', value: otherCount, color: '#8b5cf6' });
    }

    return segments.length > 0
      ? segments
      : [{ name: 'Chưa có môn', value: 0, color: '#cbd5e1' }];
  }, [courses]);


  return (
    <div className="space-y-6">
      {/* Hàng 1: 2 biểu đồ chính - Tải bài nộp (Bar) & Phổ điểm (Donut) */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Biểu đồ 1: Biểu đồ cột tải bài nộp & sinh viên từng môn (7 cột) */}
        <Card className="p-5 xl:col-span-7 space-y-4 rounded-2xl border-slate-200 bg-white shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                <BarChartIcon className="size-4 text-indigo-600" />
                Tải Bài nộp &amp; Quy mô Sinh viên theo Môn học
              </h3>
              <p className="text-xs text-slate-500">
                Đối chiếu số lượng bài nộp với tổng số sinh viên đang theo học từng lớp phụ trách
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-indigo-700">
                <span className="size-1.5 rounded-full bg-indigo-600" /> {courses.length} Khóa học
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50/70 p-4 border border-slate-100">
            <BarChart
              data={finalCourseData}
              primaryColor="#4f46e5"
              secondaryColor="#10b981"
              primaryLabel="Bài nộp (Submissions)"
              secondaryLabel="Sinh viên ghi danh"
              height={200}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              Đồng bộ thời gian thực từ cơ sở dữ liệu khóa học
            </span>
            <span className="font-semibold text-indigo-600">
              Học kỳ: Fall 2026
            </span>
          </div>
        </Card>

        {/* Biểu đồ 2: Biểu đồ Donut phổ điểm sinh viên (5 cột) */}
        <Card className="p-5 xl:col-span-5 space-y-4 rounded-2xl border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                <Award className="size-4 text-purple-600" />
                Phân phổ Điểm Sinh viên Toàn khóa
              </h3>
              {pendingCount > 0 ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Dự kiến
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {scoredSubmissions.length > 0
                ? `Thống kê từ ${scoredSubmissions.length} thí sinh nộp bài${pendingCount > 0 ? ' (Điểm máy sơ bộ - Chờ GV duyệt)' : ''}`
                : 'Tỷ lệ điểm số sinh viên theo 4 dải phân loại học lực'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50/70 p-4 border border-slate-100 flex items-center justify-center">
            <DonutChart
              data={hasScoreData ? scoreSpectrumData : gradingProgressData}
              centerLabel={hasScoreData ? (pendingCount > 0 ? 'Điểm TB (Tạm tính)' : 'Điểm TB') : 'Bài nộp'}
              centerValue={
                hasScoreData
                  ? kpiMetrics.averageScore !== null
                    ? `${kpiMetrics.averageScore}`
                    : '—'
                  : totalSubmissions
              }
              size={170}
              strokeWidth={22}
            />
          </div>

          <div className="pt-1 text-xs text-slate-500 flex items-center justify-between">
            <span className="truncate">
              Điểm TB toàn khóa: <strong>{kpiMetrics.averageScore ?? '—'} / 10</strong>{' '}
              {pendingCount > 0 && <span className="text-amber-600 font-semibold">(Tạm tính)</span>}
            </span>
            <span className={`font-semibold ${pendingCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {pendingCount > 0 ? `${pendingCount} bài chờ duyệt` : 'Tất cả đã công bố'}
            </span>
          </div>
        </Card>
      </section>

      {/* Hàng 2: 2 biểu đồ bổ sung - Lưu lượng nộp bài theo ca học (Area) & Phân bổ môi trường thực hành (Donut) */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Biểu đồ 3: Lưu lượng Nộp bài & Nhịp độ Chấm AI (7 cột) */}
        <Card className="p-5 xl:col-span-7 space-y-4 rounded-2xl border-slate-200 bg-white shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                <Activity className="size-4 text-blue-600" />
                Lưu lượng Nộp bài &amp; Tiến độ Chấm AI theo Ca học
              </h3>
              <p className="text-xs text-slate-500">
                Nhịp độ thí sinh nộp bài và tần suất phản hồi của trợ giảng AI theo các mốc thời gian
              </p>
            </div>
            <div className="flex gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="size-2 rounded-full bg-blue-600" /> Bài nộp
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="size-2 rounded-full bg-emerald-600" /> AI Rubric
              </span>
            </div>
          </div>

          {hasHourlyData ? (
            <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-100">
              <AreaChart
                series={[
                  {
                    name: 'AI Rubric call',
                    color: '#059669',
                    values: hourlyAiCalls,
                  },
                  {
                    name: 'Bài nộp',
                    color: '#2563eb',
                    values: hourlySubmissions,
                  },
                ]}
                labels={hourlyLabels}
                height={190}
              />
            </div>
          ) : (
            <div className="flex h-[190px] flex-col items-center justify-center rounded-xl bg-slate-50/70 p-4 border border-dashed border-slate-200 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
                <Activity className="size-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">Chưa ghi nhận lượt nộp bài trong ca học</p>
              <p className="text-[11px] text-slate-400 max-w-sm mt-0.5">
                Biểu đồ sẽ tự động phân tích lưu lượng nộp bài &amp; nhịp độ chấm AI thời gian thực ngay khi sinh viên bắt đầu nộp bài.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-blue-600" />
              {totalSubmissions > 0
                ? `Tổng cộng ${totalSubmissions} lượt nộp bài ghi nhận trong học kỳ`
                : 'Chưa có lượt nộp bài nào được ghi nhận'}
            </span>
            <span className="font-semibold text-slate-700">
              Trạng thái: Tự động chấm thời gian thực
            </span>
          </div>
        </Card>

        {/* Biểu đồ 4: Phân bổ Ngôn ngữ & Môi trường Thực hành (5 cột) */}
        <Card className="p-5 xl:col-span-5 space-y-4 rounded-2xl border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <Code2 className="size-4 text-emerald-600" />
              Phân bổ Môi trường / Ngôn ngữ Giảng dạy
            </h3>
            <p className="text-xs text-slate-500">
              Tỷ lệ phân chia theo môi trường thực thi của các môn học đang phụ trách
            </p>
          </div>

          <div className="rounded-xl bg-slate-50/70 p-4 border border-slate-100 flex items-center justify-center">
            <DonutChart
              data={languageData}
              centerLabel="Môi trường"
              centerValue={`${courses.length} môn`}
              size={170}
              strokeWidth={22}
            />
          </div>

          <div className="pt-1 text-xs text-slate-500 flex items-center justify-between">
            <span className="truncate">
              Khóa học tích cực: <strong>{courses.map((c) => c.code).join(', ')}</strong>
            </span>
            <span className="font-semibold text-indigo-600">
              Chuẩn đầu ra FPT
            </span>
          </div>
        </Card>
      </section>
    </div>
  );
};

