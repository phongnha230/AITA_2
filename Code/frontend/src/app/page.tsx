'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="font-semibold">Đang chuyển hướng tới Cổng Giảng viên (AITA Exam Workspace)...</span>
      </div>
    </div>
  );
}
