import { describe, expect, it } from 'vitest';
import { buildCourseRosterCsv } from '../../src/features/courses/utils/course-roster-export';
import type { CourseEnrollment } from '../../src/features/courses/types/course.types';

describe('buildCourseRosterCsv', () => {
  it('exports roster fields and escapes quotes for spreadsheet CSV', () => {
    const enrollments: CourseEnrollment[] = [{
      courseId: 'course-1',
      studentId: 'student-1',
      joinedAt: '2026-10-16T08:30:00.000Z',
      status: 'VERIFIED',
      student: {
        id: 'student-1',
        studentCode: 'SE190001',
        fullName: 'Nguyễn "An" Bình',
        email: 'an@example.test',
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    }];

    const csv = buildCourseRosterCsv(enrollments);

    expect(csv).toContain('\uFEFF"Mã số sinh viên","Họ tên"');
    expect(csv).toContain('"SE190001","Nguyễn ""An"" Bình","an@example.test"');
    expect(csv).toContain('"Đã xác thực","2026-10-16T08:30:00.000Z"');
  });

  it('exports a header row when the filtered roster is empty', () => {
    const csv = buildCourseRosterCsv([]);

    expect(csv.split('\r\n')).toHaveLength(1);
    expect(csv).toContain('"Thời gian tham gia"');
  });
});
