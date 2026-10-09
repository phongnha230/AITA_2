import {
  FileCode2,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

export interface StudentNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const STUDENT_NAV_ITEMS = [
  {
    href: '/student/dashboard',
    label: 'Tổng quan & Lớp học',
    icon: LayoutDashboard,
  },
  {
    href: '/student/courses',
    label: 'Khám phá lớp học',
    icon: GraduationCap,
  },
  {
    href: '/student/exams',
    label: 'Bài thi PE của tôi',
    icon: FileCode2,
  },
  {
    href: '/student/results',
    label: 'Kết quả & Đánh giá AI',
    icon: Sparkles,
  },
  {
    href: '/student/profile',
    label: 'Hồ sơ cá nhân',
    icon: UserRound,
  },
] satisfies readonly StudentNavItem[];
