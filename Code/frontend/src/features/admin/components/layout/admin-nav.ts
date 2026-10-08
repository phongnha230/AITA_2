import { Activity, KeyRound, Layers, Server, ShieldCheck, type LucideIcon } from 'lucide-react';

export interface AdminNavItem {
  href: string;
  label: string;
  breadcrumb: string;
  icon: LucideIcon;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: '/admin/dashboard', label: 'Tổng quan hệ thống', breadcrumb: 'Tổng quan', icon: Activity },
  { href: '/admin/users', label: 'Người dùng & Phân quyền RBAC', breadcrumb: 'Người dùng & RBAC', icon: ShieldCheck },
  { href: '/admin/ai-keys', label: 'Kho AI Keys & Rate Limit', breadcrumb: 'Kho AI Keys', icon: KeyRound },
  { href: '/admin/queue', label: 'Hàng đợi BullMQ & Redis', breadcrumb: 'Hàng đợi BullMQ', icon: Layers },
  { href: '/admin/docker', label: 'Giám sát Hạ tầng Docker', breadcrumb: 'Hạ tầng Docker', icon: Server },
];
