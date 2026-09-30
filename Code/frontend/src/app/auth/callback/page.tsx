'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const role = searchParams.get('role');
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';
    const err = searchParams.get('error');

    if (err) {
      setError(err);
      setTimeout(() => {
        router.replace(`/login?error=${encodeURIComponent(err)}`);
      }, 2000);
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (role) localStorage.setItem('user_role', role);

      // Fetch user profile or redirect directly
      router.replace(redirectTo);
    } else {
      router.replace('/login?error=invalid_callback');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl max-w-md text-center">
          <p className="text-red-400 font-semibold mb-2">Đăng nhập không thành công</p>
          <p className="text-sm text-slate-400">{error}</p>
          <p className="text-xs text-slate-500 mt-4">Đang chuyển hướng về trang đăng nhập...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <h2 className="text-xl font-bold">Đang xác thực Google OAuth...</h2>
          <p className="text-sm text-slate-400">Vui lòng chờ trong giây lát trong khi hệ thống đồng bộ dữ liệu.</p>
        </div>
      )}
    </div>
  );
}
