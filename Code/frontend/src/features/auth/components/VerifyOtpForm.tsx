'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound, LoaderCircle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '../services/auth.service';
import { isAxiosError } from 'axios';

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of multiple characters
      const pastedChars = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pastedChars.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(pastedChars.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setCountdown(60);
    setCanResend(false);
    setErrorMessage(null);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pending_otp', '123456');
    }
    setSuccessMessage('Mã xác thực mới đã được gửi lại!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleVerify = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setErrorMessage('Vui lòng nhập đầy đủ 6 chữ số OTP.');
      return;
    }

    const storedOtp = typeof window !== 'undefined' ? sessionStorage.getItem('pending_otp') || '123456' : '123456';
    if (enteredOtp !== storedOtp && enteredOtp !== '123456') {
      setErrorMessage('Mã OTP không chính xác hoặc đã hết hạn.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Đọc thông tin đăng ký lưu tạm từ sessionStorage
      const rawPending = typeof window !== 'undefined' ? sessionStorage.getItem('pending_registration') : null;
      if (rawPending) {
        const pendingData = JSON.parse(rawPending);
        try {
          await authService.register({
            fullName: pendingData.fullName,
            email: pendingData.email,
            password: pendingData.password,
            role: 'STUDENT',
          });
        } catch (regError) {
          if (isAxiosError<{ message?: string }>(regError)) {
            const msg = regError.response?.data?.message;
            if (msg && msg.includes('đã được đăng ký')) {
              // User already exists, try logging in
              await authService.login(pendingData.email, pendingData.password);
            } else {
              throw regError;
            }
          } else {
            throw regError;
          }
        }
      }

      setSuccessMessage('Xác thực thành công! Đang chuyển hướng...');
      setTimeout(() => {
        router.replace('/student/dashboard');
      }, 1000);
    } catch (error) {
      if (isAxiosError<{ message?: string }>(error)) {
        if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else if (!error.response) {
          setErrorMessage('Không thể kết nối đến máy chủ Backend (http://localhost:5000). Hãy đảm bảo Backend đang chạy!');
        } else {
          setErrorMessage('Xác thực thất bại. Vui lòng thử lại.');
        }
      } else {
        setErrorMessage('Không thể hoàn tất đăng ký lúc này. Vui lòng thử lại.');
      }
      setIsSubmitting(false);
    }
  }, [otp, router]);

  return (
    <form className="space-y-6" onSubmit={handleVerify}>
      <div className="text-center">
        <p className="text-sm text-slate-600">
          Mã xác thực 6 chữ số đã được gửi đến:
        </p>
        <p className="mt-1 font-semibold text-slate-800">
          {emailParam || 'email của bạn'}
        </p>
      </div>

      {/* 6 Digit Input */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className="h-12 w-11 sm:h-14 sm:w-12 rounded-xl border border-slate-200 bg-white text-center text-xl font-bold text-slate-800 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        ))}
      </div>

      {/* Test Code Tip */}
      <div className="rounded-lg bg-indigo-50/70 p-2.5 text-center text-xs text-indigo-700 border border-indigo-100">
        💡 Mã OTP thử nghiệm: <span className="font-mono font-bold text-indigo-900">123456</span>
      </div>

      {/* Status messages */}
      {errorMessage && (
        <div role="alert" className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div role="status" className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || otp.join('').length !== 6}
        className="h-11 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-all"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            <span>Đang hoàn tất đăng ký...</span>
          </>
        ) : (
          <>
            <span>Xác nhận &amp; Đăng nhập</span>
            <ArrowRight size={16} className="ml-2" />
          </>
        )}
      </Button>

      {/* Resend and back */}
      <div className="space-y-3 pt-2 text-center text-sm">
        <p className="text-slate-500">
          Không nhận được mã?{' '}
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              <RotateCw size={13} />
              Gửi lại mã
            </button>
          ) : (
            <span className="font-medium text-slate-400">
              Gửi lại sau {countdown}s
            </span>
          )}
        </p>

        <div>
          <Link href="/login" className="text-xs text-slate-500 hover:text-slate-700 hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </form>
  );
}
