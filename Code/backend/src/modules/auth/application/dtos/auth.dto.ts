import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tài khoản (email hoặc username).'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email('Email không đúng định dạng.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự.').max(100),
  // Chỉ cho phép đăng ký vai trò STUDENT — LECTURER/ADMIN chỉ được tạo bởi ADMIN
  role: z.literal('STUDENT').default('STUDENT'),
  recaptchaToken: z.string().optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

export const SendOtpSchema = z.object({
  email: z.string().email('Email không đúng định dạng.'),
  fullName: z.string().optional(),
  recaptchaToken: z.string().optional(),
});

export type SendOtpDto = z.infer<typeof SendOtpSchema>;

export const VerifyOtpSchema = z.object({
  email: z.string().email('Email không đúng định dạng.'),
  otp: z.string().length(6, 'Mã OTP phải có đúng 6 chữ số.'),
});

export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;

export const GoogleLoginCodeSchema = z.object({
  code: z.string().min(1, 'Vui lòng cung cấp mã code xác thực từ Google.'),
});

export type GoogleLoginCodeDto = z.infer<typeof GoogleLoginCodeSchema>;

export const GoogleIdTokenSchema = z.object({
  idToken: z.string().min(1, 'Vui lòng cung cấp Google ID Token.'),
});

export type GoogleIdTokenDto = z.infer<typeof GoogleIdTokenSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại.'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự.').max(100),
    confirmPassword: z.string().min(1, 'Vui lòng nhập xác nhận mật khẩu mới.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu mới.',
    path: ['confirmPassword'],
  });

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export const AdminResetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự.').max(100),
});

export type AdminResetPasswordDto = z.infer<typeof AdminResetPasswordSchema>;
