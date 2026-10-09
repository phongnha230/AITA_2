'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, LogOut, Menu, User as UserIcon } from 'lucide-react';
import { USE_MOCK } from '../../../../config/mock';
import { authService, type User } from '../../../auth/services/auth.service';
import { ADMIN_NAV } from './admin-nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '../ui/Badge';

interface AdminTopbarProps {
  user: User;
  onMenuClick: () => void;
}

const HealthPill: React.FC<{ label: string; value: string; tone: string }> = ({ label, value, tone }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
    <span className={`h-1.5 w-1.5 rounded-full bg-current ${tone}`} />
    {label}
    <span className={`font-semibold ${tone}`}>{value}</span>
  </span>
);

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ user, onMenuClick }) => {
  const pathname = usePathname();
  const current = ADMIN_NAV.find((n) => n.href === pathname);

  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl lg:left-72">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button type="button" onClick={onMenuClick} aria-label="Mở menu" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <nav className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-500" aria-label="Breadcrumb">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Quản trị</span>
            <ChevronRight className="hidden h-3.5 w-3.5 sm:inline" />
            <span className="font-semibold text-slate-900">{current?.breadcrumb ?? 'Bảng quản trị'}</span>
          </nav>
          <div className="hidden items-center gap-2 border-l border-slate-200 pl-4 xl:flex">
            <HealthPill label="Docker:" value="Healthy" tone="text-emerald-600" />
            <HealthPill label="BullMQ:" value="Active" tone="text-emerald-600" />
            <HealthPill label="AI Key Pool:" value="98% Quota" tone="text-blue-600" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right leading-tight md:block">
            <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
            <p className="text-[11px] text-slate-500">{user.email}</p>
          </div>
          <Badge tone="admin" className="hidden sm:inline-flex uppercase text-[10px]">
            Quản trị viên / Admin
          </Badge>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => {
              if (USE_MOCK) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
              } else {
                authService.logout();
              }
            }}
            title="Đăng xuất"
            aria-label="Đăng xuất"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
