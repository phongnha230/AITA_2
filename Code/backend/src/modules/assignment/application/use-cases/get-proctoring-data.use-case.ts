import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

function formatHHmm(date: Date): string {
  const d = new Date(date);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatHHmmss(date: Date): string {
  const d = new Date(date);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatSessionTime(startTime: Date, deadline: Date): string {
  return `Ca thi: ${formatHHmm(startTime)} - ${formatHHmm(deadline)}`;
}

function getInitials(fullName: string): string {
  if (!fullName) return 'SV';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function deriveRoomStatus(
  assignmentStatus: string,
  startTime: Date,
  deadline: Date
): 'LIVE' | 'UPCOMING' | 'COMPLETED' {
  const now = Date.now();
  if (assignmentStatus === 'CLOSED' || assignmentStatus === 'ARCHIVED') return 'COMPLETED';
  if (assignmentStatus === 'DRAFT') return 'UPCOMING';
  if (now < new Date(startTime).getTime()) return 'UPCOMING';
  if (now > new Date(deadline).getTime()) return 'COMPLETED';
  return 'LIVE';
}

export class GetProctoringDataUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async getAllRooms(actor: { userId: string; role: string }) {
    const assignments = await this.assignmentRepository.getAllAssignmentsForProctoring(
      actor.role === 'ADMIN' ? undefined : actor.userId
    );

    return assignments.map((a: any) => {
      const startTime = new Date(a.startTime);
      const deadline = new Date(a.deadline);
      const totalStudents = a.course._count?.enrollments || 0;
      const submittedStudents = a._count?.submissions || 0;
      const workingStudents = Math.max(0, totalStudents - submittedStudents);
      const durationSeconds = a.durationMinutes
        ? a.durationMinutes * 60
        : Math.max(3600, Math.round((deadline.getTime() - startTime.getTime()) / 1000));
      const secondsLeft = Math.max(0, Math.round((deadline.getTime() - Date.now()) / 1000));
      const status = deriveRoomStatus(a.status, startTime, deadline);

      return {
        id: a.id,
        name: `Phòng Lab - ${a.course.code.split('_')[0]}`,
        building: 'Tòa Alpha (Tầng 3)',
        capacity: Math.max(totalStudents, 24),
        courseCode: a.course.code.split('_')[0],
        courseName: a.course.name,
        examTitle: a.title,
        assignmentId: a.id,
        sessionTime: formatSessionTime(startTime, deadline),
        proctorName: a.creator?.fullName || 'TS. Giám thị',
        status,
        durationSeconds,
        secondsLeft,
        totalStudents,
        submittedStudents,
        workingStudents,
        kioskLockEnabled: true,
      };
    });
  }

  async execute(assignmentId: string) {
    const assignment = await this.assignmentRepository.getProctoringAssignment(assignmentId);
    if (!assignment) {
      throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);
    }

    const startTime = new Date(assignment.startTime);
    const deadline = new Date(assignment.deadline);
    const enrollments = assignment.course.enrollments || [];
    const submissions = assignment.submissions || [];
    const totalTestCases = assignment.testCases?.length || 0;

    // Map each enrolled student to a PC station
    const stations = enrollments.map((enr: any, index: number) => {
      const student = enr.student;
      const pcNumber = `PC-${String(index + 1).padStart(2, '0')}`;
      const submission = submissions.find((s: any) => s.userId === student.id);

      if (submission) {
        const isCompiling =
          submission.status === 'RUNNING_SANDBOX' || submission.status === 'RUNNING_AI';
        const passedCases = Array.isArray(submission.testResults)
          ? submission.testResults.filter((tr: any) => tr.verdict === 'PASSED').length
          : 0;
        const totalCases = Math.max(totalTestCases, submission.testResults?.length || 0);
        const score =
          submission.finalScore !== null && submission.finalScore !== undefined
            ? Number(submission.finalScore)
            : submission.sandboxScore !== null && submission.sandboxScore !== undefined
            ? Number(submission.sandboxScore)
            : 0;

        return {
          id: student.id,
          pcNumber,
          studentName: student.fullName,
          studentCode: student.studentCode || `SE19${String(index + 10).padStart(3, '0')}`,
          initials: getInitials(student.fullName),
          status: isCompiling ? ('compiling' as const) : ('submitted' as const),
          startTime: formatHHmm(startTime),
          submittedAt: formatHHmmss(submission.submittedAt),
          score: Number(score.toFixed(1)),
          passedCases,
          totalCases,
          testAttempts: 1,
          maxAttempts: 3,
          currentProblem: assignment.title,
        };
      }

      return {
        id: student.id,
        pcNumber,
        studentName: student.fullName,
        studentCode: student.studentCode || `SE19${String(index + 10).padStart(3, '0')}`,
        initials: getInitials(student.fullName),
        status: 'working' as const,
        startTime: formatHHmm(startTime),
        passedCases: 0,
        totalCases: totalTestCases,
        testAttempts: 0,
        maxAttempts: 3,
        currentProblem: assignment.title,
      };
    });

    const submittedCount = stations.filter((s: any) => s.status === 'submitted').length;
    const workingCount = stations.filter(
      (s: any) => s.status === 'working' || s.status === 'compiling'
    ).length;
    const submittedWithScores = stations.filter(
      (s: any) => s.status === 'submitted' && s.score !== undefined
    );
    const averageScore =
      submittedWithScores.length > 0
        ? Number(
            (
              submittedWithScores.reduce((acc: number, cur: any) => acc + (cur.score || 0), 0) /
              submittedWithScores.length
            ).toFixed(1)
          )
        : 0;

    const durationSeconds = assignment.durationMinutes
      ? assignment.durationMinutes * 60
      : Math.max(3600, Math.round((deadline.getTime() - startTime.getTime()) / 1000));
    const secondsLeft = Math.max(0, Math.round((deadline.getTime() - Date.now()) / 1000));
    const status = deriveRoomStatus(assignment.status, startTime, deadline);

    const room = {
      id: assignment.id,
      name: `Phòng Lab - ${assignment.course.code.split('_')[0]}`,
      building: 'Tòa Alpha (Tầng 3)',
      capacity: Math.max(enrollments.length, 24),
      courseCode: assignment.course.code.split('_')[0],
      courseName: assignment.course.name,
      examTitle: assignment.title,
      assignmentId: assignment.id,
      sessionTime: formatSessionTime(startTime, deadline),
      proctorName: assignment.creator?.fullName || 'TS. Giám thị',
      status,
      durationSeconds,
      secondsLeft,
      totalStudents: enrollments.length,
      submittedStudents: submittedCount,
      workingStudents: workingCount,
      averageScore,
      kioskLockEnabled: true,
    };

    return {
      room,
      stations,
      assignment: {
        id: assignment.id,
        title: assignment.title,
        status: assignment.status,
        startTime: assignment.startTime,
        deadline: assignment.deadline,
        durationMinutes: assignment.durationMinutes,
        accessCode: assignment.accessCode,
      },
    };
  }
}
