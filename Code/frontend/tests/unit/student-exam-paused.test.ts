import { describe, expect, it } from 'vitest';
import { getExamTemporalStatus, mapStudentExams } from '../../src/features/student/utils/student-exam.utils';
import type { StudentAssignment } from '../../src/features/student/types/student.types';

const pausedAssignment: StudentAssignment = {
  id: 'assignment-paused',
  courseId: 'course-1',
  title: 'Bài kiểm tra',
  description: null,
  environment: 'C_GCC',
  startTime: '2026-10-16T08:00:00.000Z',
  deadline: '2026-10-16T10:00:00.000Z',
  status: 'PAUSED',
  submissionType: 'INDIVIDUAL',
  allowZipSubmission: true,
  allowGitSubmission: false,
  createdBy: 'lecturer-1',
  createdAt: '2026-10-15T08:00:00.000Z',
  updatedAt: '2026-10-16T08:30:00.000Z',
};

describe('student paused assignment state', () => {
  it('keeps a paused assignment out of the open state regardless of its schedule', () => {
    expect(getExamTemporalStatus(pausedAssignment, Date.parse('2026-10-16T09:00:00.000Z'))).toBe('PAUSED');
  });

  it('includes paused assignments in the combined student list', () => {
    const exams = mapStudentExams([pausedAssignment], [], Date.parse('2026-10-16T09:00:00.000Z'));
    expect(exams).toHaveLength(1);
    expect(exams[0]?.temporalStatus).toBe('PAUSED');
  });
});
