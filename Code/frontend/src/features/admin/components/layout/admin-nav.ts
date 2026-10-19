import {
  Activity,
  BookOpen,
  ClipboardCheck,
  KeyRound,
  Layers,
  Server,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';

export interface AdminNavItem {
  href: string;
  label: string;
  breadcrumb: string;
  icon: LucideIcon;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: ROUTES.ADMIN.DASHBOARD, label: 'Tổng quan hệ thống', breadcrumb: 'Tổng quan', icon: Activity },
  { href: ROUTES.ADMIN.USERS, label: 'Người dùng & Phân quyền RBAC', breadcrumb: 'Người dùng & RBAC', icon: ShieldCheck },
  { href: ROUTES.ADMIN.COURSES, label: 'Quản lý Khóa học & Lớp học', breadcrumb: 'Khóa học & Lớp', icon: BookOpen },
  { href: ROUTES.ADMIN.SUBMISSIONS, label: 'Giám sát Bài thi & Chấm bài', breadcrumb: 'Bài thi & Chấm bài', icon: ClipboardCheck },
  { href: ROUTES.ADMIN.AI_KEYS, label: 'Kho AI Keys & Rate Limit', breadcrumb: 'Kho AI Keys', icon: KeyRound },
  { href: ROUTES.ADMIN.QUEUE, label: 'Hàng đợi BullMQ & Redis', breadcrumb: 'Hàng đợi BullMQ', icon: Layers },
  { href: ROUTES.ADMIN.DOCKER, label: 'Giám sát Hạ tầng Docker', breadcrumb: 'Hạ tầng Docker', icon: Server },
];
