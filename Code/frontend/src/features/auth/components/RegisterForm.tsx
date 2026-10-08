'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Eye, EyeOff, LoaderCircle, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CaptchaBox from './CaptchaBox';
import { authService } from '../services/auth.service';

export default function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [currentCaptchaCode, setCurrentCaptchaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate Form
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Họ và tên cần có ít nhất 2 ký tự.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Vui lòng nhập định dạng email hợp lệ.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    // 2. Validate Captcha
    if (captchaInput.trim().toUpperCase() !== currentCaptchaCode.toUpperCase()) {
      setErrorMessage('Mã Captcha không chính xác. Vui lòng kiểm tra lại.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Gọi backend để sinh OTP và gửi email
      await authService.sendOtp(email.trim(), fullName.trim());

      // 2. Lưu thông tin đăng ký tạm thời để xác thực ở bước OTP
      const pendingData = {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: 'STUDENT',
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_registration', JSON.stringify(pendingData));
      }

      // 3. Điều hướng sang trang OTP
      router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Họ và tên */}
      <div className="space-y-1.5">
        <label htmlFor="reg-fullname" className="text-sm font-medium text-slate-700">
          Họ và tên
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            id="reg-fullname"
            autoComplete="name"
            className="h-11 rounded-lg bg-white pl-10 pr-3 text-sm border-slate-200 focus-visible:ring-indigo-500"
            placeholder="VD: Nguyễn Văn A"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="reg-email" className="text-sm font-medium text-slate-700">
          Địa chỉ Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            className="h-11 rounded-lg bg-white pl-10 pr-3 text-sm border-slate-200 focus-visible:ring-indigo-500"
            placeholder="VD: sinhvien@fpt.edu.vn"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Mật khẩu */}
      <div className="space-y-1.5">
        <label htmlFor="reg-password" className="text-sm font-medium text-slate-700">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            id="reg-password"
            autoComplete="new-password"
            className="h-11 rounded-lg bg-white pl-10 pr-11 text-sm border-slate-200 focus-visible:ring-indigo-500"
            placeholder="Tối thiểu 6 ký tự"
            required
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Xác nhận mật khẩu */}
      <div className="space-y-1.5">
        <label htmlFor="reg-confirm-password" className="text-sm font-medium text-slate-700">
          Xác nhận mật khẩu
        </label>
        <div className="relative">
          <ShieldCheck className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            id="reg-confirm-password"
            autoComplete="new-password"
            className="h-11 rounded-lg bg-white pl-10 pr-3 text-sm border-slate-200 focus-visible:ring-indigo-500"
            placeholder="Nhập lại mật khẩu"
            required
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      {/* Mã Captcha */}
      <div className="space-y-1.5">
        <label htmlFor="reg-captcha" className="text-sm font-medium text-slate-700">
          Mã xác nhận Captcha
        </label>
        <div className="flex items-center gap-3">
          <Input
            id="reg-captcha"
            autoComplete="off"
            className="h-11 rounded-lg bg-white px-3 text-sm font-mono tracking-wider uppercase border-slate-200 focus-visible:ring-indigo-500"
            placeholder="Nhập mã"
            maxLength={6}
            required
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
          />
          <CaptchaBox onCodeChange={setCurrentCaptchaCode} />
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div role="alert" className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-3 h-11 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-all"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            <span>Đang chuyển đến xác thực OTP...</span>
          </>
        ) : (
          <>
            <span>Tiếp tục xác thực OTP</span>
            <ArrowRight size={16} className="ml-2" />
          </>
        )}
      </Button>

      {/* Back to Login Link */}
      <div className="pt-2 text-center text-sm text-slate-600">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </form>
  );
}
