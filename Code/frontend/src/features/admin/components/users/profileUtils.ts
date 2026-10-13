import type { AdminUser } from '../../types/admin.types';
import { CLASS_CATALOG } from '../../mocks/ops.mock';

export const lecturerClasses = (user: AdminUser, detailedUser?: any) => {
  if (detailedUser?.coursesTaught && Array.isArray(detailedUser.coursesTaught)) {
    return detailedUser.coursesTaught.map((c: any) => ({
      code: c.code,
      title: c.name,
      students: c.enrollments?.length || 0,
    }));
  }
  if (Array.isArray(user.assignedClasses) && user.assignedClasses.length > 0) {
    return user.assignedClasses.map((code: string) => {
      const match = CLASS_CATALOG.find((c: { code: string }) => c.code === code);
      return match || { code, title: code, students: 0 };
    });
  }
  return [];
};
