import type { CourseEnrollment } from '../types/course.types';

const escapeCsvCell = (value: string): string => `"${value.replace(/"/g, '""')}"`;

export const buildCourseRosterCsv = (enrollments: CourseEnrollment[]): string => {
  const rows: string[][] = [
    ['Mã số sinh viên', 'Họ tên', 'Email', 'Trạng thái tài khoản', 'Trạng thái ghi danh', 'Thời gian tham gia'],
    ...enrollments.map(({ student, status, joinedAt }) => [
      student.studentCode ?? '',
      student.fullName,
      student.email,
      student.status,
      status === 'VERIFIED' || student.status === 'ACTIVE' ? 'Đã xác thực' : 'Chờ duyệt',
      joinedAt,
    ]),
  ];

  return `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')}`;
};
