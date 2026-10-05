'use client';

import { usePathname } from 'next/navigation';

/** Public marketing chrome. Role consoles (e.g. /admin) bring their own layout, so we skip it there. */
export const SiteShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return <>{children}</>;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow">AI</div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">AITA</span>
              <span className="ml-2 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">SWD392 FPT</span>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <a href="/" className="transition hover:text-indigo-600">Trang chủ</a>
            <a href="#features" className="transition hover:text-indigo-600">Tính năng</a>
            <a href="#system-health" className="transition hover:text-indigo-600">Trạng thái Hệ thống</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </>
  );
};
