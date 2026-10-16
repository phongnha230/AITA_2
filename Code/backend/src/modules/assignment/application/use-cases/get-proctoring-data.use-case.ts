import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export type ExamSessionState = 'LIVE' | 'UPCOMING' | 'PAUSED' | 'COMPLETED';

function deriveStatus(status: string, startTime: Date, deadline: Date): ExamSessionState {
  if (status === 'PAUSED') return 'PAUSED';
  if (status === 'CLOSED' || status === 'ARCHIVED' || Date.now() > deadline.getTime()) return 'COMPLETED';
  if (status === 'DRAFT' || Date.now() < startTime.getTime()) return 'UPCOMING';
  return 'LIVE';
}

function toSession(assignment: {
  id: string;
  title: string;
  status: string;
  startTime: Date;
  deadline: Date;
  durationMinutes: number | null;
  pausedAt?: Date | null;
  course: { id: string; code: string; name: string; semester: string; _count?: { enrollments: number } };
  _count?: { submissions: number; examAccessGrants: number };
}) {
  const state = deriveStatus(assignment.status, assignment.startTime, assignment.deadline);
  return {
    id: assignment.id,
    assignmentId: assignment.id,
    title: assignment.title,
    courseId: assignment.course.id,
    courseCode: assignment.course.code,
    courseName: assignment.course.name,
    semester: assignment.course.semester,
    status: state,
    assignmentStatus: assignment.status,
    startTime: assignment.startTime,
    deadline: assignment.deadline,
    durationMinutes: assignment.durationMinutes,
    pausedAt: assignment.pausedAt ?? null,
    secondsLeft: state === 'PAUSED' ? null : Math.max(0, Math.round((assignment.deadline.getTime() - Date.now()) / 1000)),
    enrolledStudents: assignment.course._count?.enrollments ?? 0,
    unlockedStudents: assignment._count?.examAccessGrants ?? 0,
    submittedStudents: assignment._count?.submissions ?? 0,
  };
}

export class GetProctoringDataUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async getAllRooms(actor: { userId: string; role: string }) {
    const assignments = await this.assignmentRepository.getAllAssignmentsForProctoring(
      actor.role === 'ADMIN' ? undefined : actor.userId
    );
    return assignments.map((assignment) => toSession(assignment));
  }

  async execute(assignmentId: string) {
    const assignment = await this.assignmentRepository.getProctoringAssignment(assignmentId);
    if (!assignment) throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);
    const session = toSession(assignment);
    const submissions = assignment.submissions.map((submission) => ({
      id: submission.id,
      studentId: submission.userId,
      studentName: submission.user.fullName,
      studentCode: submission.user.studentCode,
      status: submission.status,
      submittedAt: submission.submittedAt,
      score: submission.finalScore === null ? null : Number(submission.finalScore),
    }));
    const unlockedStudents = assignment.examAccessGrants.map((grant) => ({
      studentId: grant.student.id,
      studentName: grant.student.fullName,
      studentCode: grant.student.studentCode,
      unlockedAt: grant.unlockedAt,
    }));
    return { session, submissions, unlockedStudents };
  }
}
