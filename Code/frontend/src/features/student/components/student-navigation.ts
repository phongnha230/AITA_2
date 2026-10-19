import {
  FileCode2,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';

export interface StudentNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const STUDENT_NAV_ITEMS = [
  {
    href: ROUTES.STUDENT.DASHBOARD,
    label: 'Tổng quan & Lớp học',
    icon: LayoutDashboard,
  },
  {
    href: ROUTES.STUDENT.COURSES,
    label: 'Khám phá lớp học',
    icon: GraduationCap,
  },
  {
    href: ROUTES.STUDENT.EXAMS,
    label: 'Bài thi PE của tôi',
    icon: FileCode2,
  },
  {
    href: ROUTES.STUDENT.RESULTS,
    label: 'Kết quả & Đánh giá AI',
    icon: Sparkles,
  },
  {
    href: ROUTES.STUDENT.PROFILE,
    label: 'Hồ sơ cá nhân',
    icon: UserRound,
  },
] satisfies readonly StudentNavItem[];
