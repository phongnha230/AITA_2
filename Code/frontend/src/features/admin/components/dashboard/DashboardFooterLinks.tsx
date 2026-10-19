'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, KeyRound, Layers, Server, Users } from 'lucide-react';

const QUICK_LINKS = [
  { href: '/admin/users', icon: Users, title: 'Người dùng & RBAC', sub: 'Phân quyền toàn hệ thống' },
  { href: '/admin/ai-keys', icon: KeyRound, title: 'Kho AI Keys & Limits', sub: 'Quản lý khóa API' },
  { href: '/admin/queue', icon: Layers, title: 'Hàng đợi chấm bài', sub: 'Jobs và thao tác backend' },
  { href: '/admin/docker', icon: Server, title: 'Docker Sandbox', sub: 'Trạng thái từ Sandbox API' },
];

export const DashboardFooterLinks: React.FC = () => {
  return (
    <footer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {QUICK_LINKS.map(({ href, icon: Icon, title, sub }) => (
        <Link
          key={href}
          href={href}
          className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:shadow-md"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-slate-900">{title}</span>
              <span className="block truncate text-xs text-slate-500">{sub}</span>
            </span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-slate-400 transition-colors group-hover:translate-x-1 group-hover:text-blue-600" />
        </Link>
      ))}
    </footer>
  );
};
