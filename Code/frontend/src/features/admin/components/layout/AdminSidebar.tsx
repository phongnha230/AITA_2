'use client';

import { useState, type RefObject } from 'react';
import Link from 'next/link';
import { Modal } from '../ui/Modal';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { ADMIN_NAV } from './admin-nav';

interface AdminSidebarProps {
  open: boolean;
  onNavigate: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}

function AdminSidebarContent({ onNavigate, onHelpClick }: {
  onNavigate: () => void;
  onHelpClick: () => void;
}) {
  const pathname = usePathname();
  return (
    <>
      <div>
          <div className="flex h-16 items-center gap-3 px-6">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">AI</div>
            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight text-blue-700">AITA EXAM</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Admin Console</p>
            </div>
          </div>
          <nav className="space-y-1 px-4 py-2" aria-label="Điều hướng quản trị">
            <p className="px-3 pb-1 pt-3 text-xs font-bold text-slate-400">Quản trị hệ thống</p>
            {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    active ? 'bg-blue-600 font-semibold text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  <span className="min-w-0">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="m-4 space-y-2 rounded-xl bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Node-Alpha Master</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
              <span className="size-2 animate-pulse rounded-full bg-emerald-600" />
              99.98%
            </span>
          </div>
          <p className="text-xs text-slate-500">Hạ tầng đồng bộ chuẩn kiểm thử phân tán</p>
          <button type="button" onClick={onHelpClick} className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-blue-600 hover:underline">
            <BookOpen className="size-3.5" />
            Tài liệu &amp; Hỗ trợ kỹ thuật
          </button>
        </div>
    </>
  );
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ open, onNavigate, menuButtonRef }) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const openHelp = () => {
    onNavigate();
    setHelpOpen(true);
  };

  return (
    <>
      <Modal open={helpOpen} title="Tài liệu & Hỗ trợ kỹ thuật" onClose={() => setHelpOpen(false)}>
        <ul className="space-y-3 text-sm text-slate-700">
          <li><strong>SRS &amp; RBAC:</strong> <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Document_project/02_Requirements_SRS</code></li>
          <li><strong>Hướng dẫn chạy dự án:</strong> <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Code/RUN_GUIDE.md</code></li>
          <li><strong>Quy chuẩn kết nối:</strong> Toàn bộ dữ liệu được đồng bộ trực tiếp với Backend API (MySQL/Prisma).</li>
          <li><strong>Phím tắt:</strong> <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Ctrl/⌘ + K</kbd> focus ô tìm kiếm ở trang Người dùng.</li>
        </ul>
      </Modal>
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-72 flex-col justify-between border-r border-slate-200 bg-white lg:flex">
        <AdminSidebarContent onNavigate={onNavigate} onHelpClick={openHelp} />
      </aside>
      <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onNavigate(); }}>
        <SheetContent
          side="left"
          className="h-full w-72 border-slate-200 bg-white p-0 lg:hidden"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            menuButtonRef.current?.focus();
          }}
        >
          <SheetTitle className="sr-only">Điều hướng quản trị</SheetTitle>
          <div className="flex h-full flex-col justify-between">
            <AdminSidebarContent onNavigate={onNavigate} onHelpClick={openHelp} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
