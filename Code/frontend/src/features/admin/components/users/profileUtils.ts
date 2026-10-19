import type { AdminUser, AdminUserDetails } from '../../types/admin.types';

export interface LecturerClassSummary {
  code: string;
  title: string;
  students: number;
}

export const lecturerClasses = (user: AdminUser, detailedUser?: AdminUserDetails): LecturerClassSummary[] => {
  if (detailedUser?.coursesTaught && Array.isArray(detailedUser.coursesTaught)) {
    return detailedUser.coursesTaught.map((c) => ({
      code: c.code,
      title: c.name,
      students: c.enrollments?.length || 0,
    }));
  }
  if (Array.isArray(user.assignedClasses)) return user.assignedClasses.map((code: string) => ({ code, title: code, students: 0 }));
  return [];
};
