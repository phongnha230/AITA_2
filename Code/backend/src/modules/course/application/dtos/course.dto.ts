import { z } from 'zod';

export const CreateCourseSchema = z.object({
  code: z.string().min(2, 'Mã môn học tối thiểu 2 ký tự').max(50),
  name: z.string().min(2, 'Tên môn học tối thiểu 2 ký tự').max(200),
  semester: z.string().min(2, 'Học kỳ tối thiểu 2 ký tự').max(20),
  lecturerId: z.string().uuid('ID Giảng viên phải là UUID hợp lệ').optional(),
});

export type CreateCourseDto = z.infer<typeof CreateCourseSchema>;

export const UpdateCourseSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  semester: z.string().min(2).max(20).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCourseDto = z.infer<typeof UpdateCourseSchema>;

export const EnrollStudentsSchema = z.object({
  studentIds: z.array(z.string().uuid('ID sinh viên phải là UUID')).min(1, 'Danh sách sinh viên không được rỗng'),
});

export type EnrollStudentsDto = z.infer<typeof EnrollStudentsSchema>;

export const QueryCoursesSchema = z.object({
  lecturerId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  search: z.string().optional(),
  scope: z.enum(['all', 'catalog', 'enrolled']).optional(),
});

export type QueryCoursesDto = z.infer<typeof QueryCoursesSchema>;

export const GenerateJoinCodeSchema = z.object({
  expiresInMinutes: z.coerce.number().int().min(1, 'Thời gian sống tối thiểu 1 phút').max(1440, 'Thời gian sống tối đa 24 giờ (1440 phút)').default(30),
});

export type GenerateJoinCodeDto = z.infer<typeof GenerateJoinCodeSchema>;

export const JoinCourseByCodeSchema = z.object({
  code: z.string().min(4, 'Mã tham gia tối thiểu 4 ký tự').max(20, 'Mã tham gia tối đa 20 ký tự'),
});

export type JoinCourseByCodeDto = z.infer<typeof JoinCourseByCodeSchema>;
