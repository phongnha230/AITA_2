import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự').max(100).optional(),
  avatarUrl: z.string().url('URL ảnh đại diện không hợp lệ').optional().nullable(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

export const QueryUsersSchema = z.object({
  role: z.enum(['ADMIN', 'LECTURER', 'STUDENT']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_ACTIVATION']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type QueryUsersDto = z.infer<typeof QueryUsersSchema>;

export const AdminCreateUserSchema = z.object({
  email: z.string().email('Email không đúng định dạng.'),
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự.').max(100),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự.').default('password123'),
  role: z.enum(['ADMIN', 'LECTURER', 'STUDENT'], {
    required_error: 'Vui lòng chọn vai trò: ADMIN, LECTURER hoặc STUDENT',
  }),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_ACTIVATION']).default('ACTIVE'),
  avatarUrl: z.string().url().optional().nullable(),
});

export type AdminCreateUserDto = z.infer<typeof AdminCreateUserSchema>;

export const AdminCreateBatchUsersSchema = z.object({
  users: z.array(AdminCreateUserSchema).min(1, 'Danh sách tạo người dùng không được rỗng.'),
});

export type AdminCreateBatchUsersDto = z.infer<typeof AdminCreateBatchUsersSchema>;

export const AdminUpdateUserSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  role: z.enum(['ADMIN', 'LECTURER', 'STUDENT']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_ACTIVATION']).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type AdminUpdateUserDto = z.infer<typeof AdminUpdateUserSchema>;
