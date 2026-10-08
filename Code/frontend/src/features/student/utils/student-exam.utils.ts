import type {
  StudentAssignment,
  StudentCourse,
  StudentExamTemporalStatus,
  StudentExamViewModel,
} from '../types/student.types';

export function getExamTemporalStatus(
  assignment: StudentAssignment,
  now = Date.now(),
): StudentExamTemporalStatus {
  const startTime = Date.parse(assignment.startTime);
  const deadline = Date.parse(assignment.deadline);
  if (!Number.isFinite(startTime) || !Number.isFinite(deadline)) return 'UNKNOWN';
  if (assignment.status === 'CLOSED' || now > deadline) return 'ENDED';
  if (now < startTime) return 'UPCOMING';
  return 'OPEN';
}

export function mapStudentExams(
  assignments: StudentAssignment[],
  courses: StudentCourse[],
  now = Date.now(),
): StudentExamViewModel[] {
  const coursesById = new Map(courses.map((course) => [course.id, course]));

  return assignments
    .filter((assignment) => assignment.status === 'PUBLISHED' || assignment.status === 'CLOSED')
    .map((assignment) => ({
      assignment,
      course: coursesById.get(assignment.courseId) ?? null,
      temporalStatus: getExamTemporalStatus(assignment, now),
    }));
}
