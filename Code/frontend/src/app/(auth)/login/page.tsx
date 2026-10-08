'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student/dashboard');
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F6F8FC] p-4 text-center">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />
        <span>Đang chuyển hướng vào hệ thống...</span>
      </div>
    </main>
  );
}
