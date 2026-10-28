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
    await this.assignmentRepository.finalizeUnsubmittedStudents(assignmentId);
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
      compileOutput: submission.compileOutput ?? null,
    }));

    const unlockedStudents = assignment.examAccessGrants.map((grant) => ({
      studentId: grant.student.id,
      studentName: grant.student.fullName,
      studentCode: grant.student.studentCode,
      unlockedAt: grant.unlockedAt,
    }));

    // Build unified roster
    const enrolledStudents = assignment.course.enrollments.map((enr) => enr.student);
    const accessMap = new Map<string, Date>();
    for (const grant of assignment.examAccessGrants) {
      accessMap.set(grant.studentId, grant.unlockedAt);
    }
    const submissionMap = new Map<string, typeof assignment.submissions[0]>();
    for (const sub of assignment.submissions) {
      if (!submissionMap.has(sub.userId)) {
        submissionMap.set(sub.userId, sub);
      }
    }

    const allStudentIds = new Set<string>();
    const studentInfoMap = new Map<string, { id: string; fullName: string; studentCode: string | null; email: string; avatarUrl: string | null }>();

    for (const s of enrolledStudents) {
      allStudentIds.add(s.id);
      studentInfoMap.set(s.id, s);
    }
    for (const grant of assignment.examAccessGrants) {
      allStudentIds.add(grant.student.id);
      if (!studentInfoMap.has(grant.student.id)) {
        studentInfoMap.set(grant.student.id, {
          id: grant.student.id,
          fullName: grant.student.fullName,
          studentCode: grant.student.studentCode,
          email: '',
          avatarUrl: null,
        });
      }
    }
    for (const sub of assignment.submissions) {
      allStudentIds.add(sub.user.id);
      if (!studentInfoMap.has(sub.user.id)) {
        studentInfoMap.set(sub.user.id, {
          id: sub.user.id,
          fullName: sub.user.fullName,
          studentCode: sub.user.studentCode,
          email: '',
          avatarUrl: null,
        });
      }
    }

    const roster = Array.from(allStudentIds).map((studentId) => {
      const student = studentInfoMap.get(studentId)!;
      const unlockedAt = accessMap.get(studentId) ?? null;
      const sub = submissionMap.get(studentId) ?? null;

      let roomStatus: 'NOT_JOINED' | 'IN_ROOM' | 'SUBMITTED' | 'EXPIRED_ZERO' = 'NOT_JOINED';
      if (sub) {
        const isUnsubmittedZero = (sub.finalScore !== null && Number(sub.finalScore) === 0 && (sub.compileOutput?.includes('Không nộp bài') ?? false));
        roomStatus = isUnsubmittedZero ? 'EXPIRED_ZERO' : 'SUBMITTED';
      } else if (unlockedAt) {
        roomStatus = 'IN_ROOM';
      }

      const passedTestCases = sub?.testResults?.filter((tr) => tr.verdict === 'PASSED').length ?? 0;
      const totalTestCases = assignment.testCases.length;

      return {
        studentId: student.id,
        studentName: student.fullName,
        studentCode: student.studentCode,
        email: student.email,
        avatarUrl: student.avatarUrl,
        unlockedAt,
        roomStatus,
        submission: sub ? {
          id: sub.id,
          status: sub.status,
          submittedAt: sub.submittedAt,
          sandboxScore: sub.sandboxScore !== null ? Number(sub.sandboxScore) : null,
          aiScore: sub.aiScore !== null ? Number(sub.aiScore) : null,
          finalScore: sub.finalScore !== null ? Number(sub.finalScore) : null,
          compileSuccess: sub.compileSuccess,
          compileOutput: sub.compileOutput,
          passedTestCases,
          totalTestCases,
        } : null,
      };
    });

    roster.sort((a, b) => {
      const statusWeight: Record<string, number> = { SUBMITTED: 1, IN_ROOM: 2, EXPIRED_ZERO: 3, NOT_JOINED: 4 };
      const diff = (statusWeight[a.roomStatus] || 99) - (statusWeight[b.roomStatus] || 99);
      if (diff !== 0) return diff;
      return (a.studentCode || a.studentName).localeCompare(b.studentCode || b.studentName);
    });

    return { session, submissions, unlockedStudents, roster, testCases: assignment.testCases };
  }
}
