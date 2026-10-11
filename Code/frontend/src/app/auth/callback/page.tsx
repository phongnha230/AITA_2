'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { authService } from '@/features/auth/services/auth.service';

function AuthCallbackLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <h2 className="text-xl font-bold">Đang xác thực Google OAuth...</h2>
        <p className="text-sm text-slate-400">Vui lòng chờ trong giây lát trong khi hệ thống đồng bộ dữ liệu.</p>
      </div>
    </div>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const role = searchParams.get('role');
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';
    const err = searchParams.get('error');

    let errTimer: ReturnType<typeof setTimeout> | undefined;

    if (err) {
      setError(err);
      errTimer = setTimeout(() => {
        router.replace(`/login?error=${encodeURIComponent(err)}`);
      }, 2000);
      return () => {
        if (errTimer) clearTimeout(errTimer);
      };
    }

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('aita_token', token);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    // Verify session using HttpOnly Cookie
    authService
      .getCurrentUser()
      .then((user) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          if (user.role) localStorage.setItem('user_role', user.role);

          const targetRole = user.role || role;
          let destination = '/student/dashboard';
          if (targetRole === 'ADMIN') {
            destination = '/admin/dashboard';
          } else if (targetRole === 'LECTURER') {
            destination = '/dashboard';
          } else if (targetRole === 'STUDENT') {
            destination = '/student/dashboard';
          } else if (redirectTo && !redirectTo.includes('lecturer/courses')) {
            destination = redirectTo;
          }

          router.replace(destination);
        } else {
          router.replace('/login');
        }
      })
      .catch(() => {
        router.replace('/login');
      });
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
        <AuthCallbackLoading />
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
