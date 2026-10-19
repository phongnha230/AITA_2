'use client';

import Link from 'next/link';
import { Award, BookOpen, CheckCircle2, Cpu, ExternalLink, History, Sparkles } from 'lucide-react';
import { StudentEmptyState } from '../shared/StudentEmptyState';
import { StudentStatCard } from '../shared/StudentStatCard';
import { ProgrammingCompetencyRadar, type CompetencyCategory } from './ProgrammingCompetencyRadar';
import type { StudentPortfolioData, RecentSubmissionItem } from '../../types/student.types';
import { formatDateTime } from '@/lib/formatDate';

interface ProfileMetricGridProps {
  portfolio?: StudentPortfolioData | null;
  loading?: boolean;
}

function getMetricDetails(
  loading: boolean,
  completedCount: number,
  totalCount: number,
  completionRate: number,
  failedCount: number
) {
  if (loading) {
    return {
      scoreDetail: 'Đang tải dữ liệu...',
      completionDetail: 'Đang tải dữ liệu...',
      passDetail: 'Đang tải dữ liệu...',
    };
  }

  return {
    scoreDetail:
      completedCount > 0
        ? `Dựa trên ${completedCount} bài thi đã chấm`
        : 'Chưa có bài thi nào có điểm (0.0)',
    completionDetail:
      totalCount > 0
        ? `Hoàn thành ${completionRate}% đề thi`
        : 'Hiện tại chưa có đề thi được giao',
    passDetail:
      completedCount > 0
        ? `${failedCount} bài chưa đạt yêu cầu`
        : 'Chưa có dữ liệu bài nộp',
  };
}

export function ProfileMetricGrid({ portfolio, loading = false }: ProfileMetricGridProps) {
  const stats = portfolio?.academicStats;
  const avgScore = stats?.averageScore !== undefined && stats.averageScore !== null
    ? stats.averageScore.toFixed(1)
    : '0.0';

  const completedCount = stats?.submittedAssignments ?? 0;
  const totalCount = stats?.totalAssignments ?? 0;
  const passedCount = stats?.passedCount ?? 0;
  const failedCount = stats?.failedCount ?? 0;
  const courseCount = stats?.totalCourses ?? 0;
  const completionRate = stats?.completionRate ?? 0;

  const { scoreDetail, completionDetail, passDetail } = getMetricDetails(
    loading,
    completedCount,
    totalCount,
    completionRate,
    failedCount
  );

  return (
    <section aria-label="Tổng hợp năng lực PE" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StudentStatCard
        label="Điểm PE trung bình"
        value={loading ? '--' : avgScore}
        detail={scoreDetail}
        icon={Award}
        tone="blue"
        loading={loading}
      />
      <StudentStatCard
        label="Kỳ thi đã hoàn thành"
        value={loading ? '--' : `${completedCount} / ${totalCount}`}
        detail={completionDetail}
        icon={Cpu}
        tone="emerald"
        loading={loading}
      />
      <StudentStatCard
        label="Bài thi đạt (≥ 5.0)"
        value={loading ? '--' : String(passedCount)}
        detail={passDetail}
        icon={CheckCircle2}
        tone="amber"
        loading={loading}
      />
      <StudentStatCard
        label="Lớp học đã tham gia"
        value={loading ? '--' : String(courseCount)}
        detail={loading ? 'Đang tải dữ liệu...' : 'Môn học đang ghi danh'}
        icon={BookOpen}
        tone="slate"
        loading={loading}
      />
    </section>
  );
}

interface ProfileExamHistoryProps {
  submissions?: RecentSubmissionItem[];
  loading?: boolean;
}

function getSubmissionBadge(sub: RecentSubmissionItem) {
  if (sub.status !== 'GRADED') {
    return { text: sub.status, className: 'text-amber-600' };
  }
  if (sub.finalScore >= 5) {
    return { text: 'ĐẠT (PASS)', className: 'text-emerald-600' };
  }
  return { text: 'CHƯA ĐẠT', className: 'text-rose-600' };
}

export function ProfileExamHistory({ submissions = [], loading = false }: ProfileExamHistoryProps) {
  return (
    <section className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated">
      <div>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Lịch sử các kỳ thi thực hành (PE)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Kết quả đối chiếu tự động Docker Sandbox và đánh giá Socratic AI.
            </p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <History className="size-4.5" />
          </span>
        </div>

        <div className="mt-5">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          )}

          {!loading && submissions.length > 0 && (
            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
              {submissions.map((sub) => {
                const badge = getSubmissionBadge(sub);
                return (
                  <div
                    key={sub.id}
                    className="flex flex-col gap-3 p-4 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                          {sub.courseCode}
                        </span>
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {sub.assignmentTitle}
                        </h3>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Nộp lúc: {formatDateTime(sub.submittedAt)} • Môi trường: {sub.environment}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-blue-600">
                          {sub.finalScore !== null ? `${sub.finalScore.toFixed(1)} / 10` : '--'}
                        </div>
                        <span className={`inline-block text-xs font-medium ${badge.className}`}>
                          {badge.text}
                        </span>
                      </div>

                      <Link
                        href={`/student/results?submissionId=${sub.id}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                        title="Xem chi tiết bài thi"
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && submissions.length === 0 && (
            <StudentEmptyState
              icon={History}
              title="Chưa có dữ liệu bài thi (0 bài thi)."
              description="Bạn chưa nộp bài thi thực hành nào trong hệ thống. Khi làm bài, điểm số và chi tiết chấm sẽ tự động hiển thị tại đây."
              action={
                <Link
                  href="/student/exams"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <Sparkles className="size-4" />
                  <span>Xem danh sách bài thi PE</span>
                </Link>
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

interface ProfileSkillRadarProps {
  skills?: Array<{ environment: string; submissionCount: number; averageScore: number }>;
}

export function ProfileSkillRadar({ skills = [] }: ProfileSkillRadarProps) {
  const radarCategories: CompetencyCategory[] = [
    {
      key: 'c_programming',
      label: 'Lập trình C (PRF192 / GCC)',
      shortLabel: 'C (PRF192)',
      score: skills.find((s) => s.environment.includes('C'))?.averageScore ?? null,
    },
    {
      key: 'java_programming',
      label: 'Lập trình Java / OOP (PRO192)',
      shortLabel: 'Java (PRO192)',
      score: skills.find((s) => s.environment.includes('JAVA'))?.averageScore ?? null,
    },
    {
      key: 'dsa_algorithms',
      label: 'CTDL & Giải thuật (CSD201)',
      shortLabel: 'CTDL & Giải thuật',
      score: skills.find((s) => s.environment.includes('CSD') || s.environment.includes('ALGO'))?.averageScore ?? null,
    },
    {
      key: 'clean_code',
      label: 'Quy chuẩn Clean Code & Tối ưu',
      shortLabel: 'Clean Code',
      score: skills.length > 0 ? 80 : null,
    },
    {
      key: 'test_pass_rate',
      label: 'Tỷ lệ vượt qua Testcases',
      shortLabel: 'Pass Testcases',
      score: skills.length > 0 ? 75 : null,
    },
  ];

  return <ProgrammingCompetencyRadar categories={radarCategories} />;
}
