import { z } from 'zod';

export const createTeamSchema = z.object({
  courseId: z.string().uuid('ID môn học không hợp lệ'),
  name: z.string().min(2, 'Tên nhóm phải có ít nhất 2 ký tự').max(100),
  projectTitle: z.string().max(255).optional(),
  gitRepoUrl: z.string().url('URL GitHub không hợp lệ').optional().or(z.literal('')),
  deployedUrl: z.string().url('URL Web Deploy không hợp lệ').optional().or(z.literal('')),
});

export const addTeamMemberSchema = z.object({
  studentEmail: z.string().email('Email sinh viên không hợp lệ'),
  role: z.enum(['LEADER', 'MEMBER']).default('MEMBER'),
});

export const updateTeamSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  projectTitle: z.string().max(255).optional(),
  gitRepoUrl: z.string().url().optional().or(z.literal('')),
  deployedUrl: z.string().url().optional().or(z.literal('')),
});

export const updateGitIdentitySchema = z.object({
  gitAuthorEmail: z.string().trim().email('Git author email không hợp lệ').nullable(),
  githubUsername: z.string().trim().regex(/^[A-Za-z0-9-]{1,39}$/, 'GitHub username không hợp lệ').nullable(),
}).refine((value) => value.gitAuthorEmail !== null || value.githubUsername !== null, {
  message: 'Cần cung cấp ít nhất Git author email hoặc GitHub username.',
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type UpdateGitIdentityInput = z.infer<typeof updateGitIdentitySchema>;
