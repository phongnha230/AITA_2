'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { useStudentCourses } from '../../hooks/useStudentCourses';
import { studentService } from '../../services/student.service';
import type { StudentProfileUpdate, StudentPortfolioData } from '../../types/student.types';
import { StudentPageHeading } from '../shared/StudentPageHeading';
import { ProfileEditModal } from './ProfileEditModal';
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal';
import { ProfileCourses } from './ProfileCourses';
import { ProfileExamHistory, ProfileMetricGrid, ProfileSkillRadar } from './ProfileCompetencyPanel';
import { ProfileIdentityCard } from './ProfileIdentityCard';

export function StudentProfile() {
  const { profile, status, error, retry, updateProfile } = useStudentProfile();
  const academic = useStudentCourses();
  const [editOpen, setEditOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Lấy dữ liệu Portfolio thực tế từ backend
  const [portfolio, setPortfolio] = useState<StudentPortfolioData | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  const fetchPortfolio = useCallback(() => {
    setPortfolioLoading(true);
    studentService
      .getPortfolio()
      .then((data) => {
        setPortfolio(data);
      })
      .catch((err) => {
        console.warn('Chưa thể tải dữ liệu portfolio cá nhân:', err);
      })
      .finally(() => {
        setPortfolioLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const closeEdit = useCallback(() => setEditOpen(false), []);

  const saveProfile = useCallback(
    async (data: StudentProfileUpdate) => {
      const updated = await updateProfile(data);
      // Tải lại portfolio để đồng bộ số liệu và avatar
      fetchPortfolio();
      return updated;
    },
    [updateProfile, fetchPortfolio],
  );

  const handleAvatarUpdated = useCallback(
    (avatarUrl: string) => {
      saveProfile({ avatarUrl });
    },
    [saveProfile]
  );

  return (
    <div className="space-y-6">
      <StudentPageHeading
        eyebrow="Tài khoản học tập"
        title="Hồ sơ Sinh viên & Báo cáo Năng lực PE"
        description="Thông tin hồ sơ, chứng chỉ học tập và các chỉ số đánh giá thực tế từ hệ thống."
      />

      {status === 'error' && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-elevated-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5 text-sm text-amber-900">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error || 'Không thể tải thông tin hồ sơ.'}</p>
          </div>
          <button
            type="button"
            onClick={retry}
            className="min-h-9 shrink-0 rounded-xl border border-amber-300 bg-white px-3.5 text-xs font-semibold text-amber-900 shadow-sm transition-colors hover:bg-amber-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Thử lại
          </button>
        </div>
      )}

      {status === 'loading' && (
        <section role="status" aria-label="Đang tải hồ sơ" className="flex items-center gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated sm:p-7">
          <span className="h-20 w-20 shrink-0 animate-pulse rounded-2xl bg-slate-100" />
          <div className="w-full space-y-3">
            <span className="block h-6 w-56 max-w-full animate-pulse rounded-lg bg-slate-100" />
            <span className="block h-4 w-72 max-w-full animate-pulse rounded-lg bg-slate-100" />
            <span className="block h-3 w-80 max-w-full animate-pulse rounded-lg bg-slate-100" />
          </div>
        </section>
      )}

      {status === 'success' && profile && (
        <ProfileIdentityCard
          profile={profile}
          onEdit={() => setEditOpen(true)}
          onChangePassword={() => setChangePasswordOpen(true)}
          onAvatarUpdated={handleAvatarUpdated}
        />
      )}

      {/* Hiển thị số liệu thống kê thực tế kết nối từ API /users/portfolio */}
      <ProfileMetricGrid portfolio={portfolio} loading={portfolioLoading} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <ProfileExamHistory
            submissions={portfolio?.recentSubmissions ?? []}
            loading={portfolioLoading}
          />
        </div>
        <aside aria-label="Báo cáo năng lực" className="min-w-0 lg:col-span-5">
          <ProfileSkillRadar skills={portfolio?.skillsBreakdown ?? []} />
        </aside>
      </div>

      <div className="w-full">
        <ProfileCourses
          state={academic.courses}
          onRetry={academic.retryCourses}
          profileFailed={status === 'error'}
        />
      </div>

      {profile && editOpen && (
        <ProfileEditModal
          open
          profile={profile}
          onClose={closeEdit}
          onSave={saveProfile}
        />
      )}

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
}
