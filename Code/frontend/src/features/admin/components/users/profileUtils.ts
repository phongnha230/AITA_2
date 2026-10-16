import type { AdminUser } from '../../types/admin.types';

export const lecturerClasses = (user: AdminUser, detailedUser?: any) => {
  if (detailedUser?.coursesTaught && Array.isArray(detailedUser.coursesTaught)) {
    return detailedUser.coursesTaught.map((c: any) => ({
      code: c.code,
      title: c.name,
      students: c.enrollments?.length || 0,
    }));
  }
  if (Array.isArray(user.assignedClasses)) return user.assignedClasses.map((code: string) => ({ code, title: code, students: 0 }));
  return [];
};
