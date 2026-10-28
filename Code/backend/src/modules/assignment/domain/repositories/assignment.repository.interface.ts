import { Assignment } from '../entities/assignment.entity.js';
import {
  AssignmentSolution,
  Prisma,
  RubricRule,
  TestCase,
} from '@prisma/client';
import {
  CreateTestCaseDto,
  SetRubricRulesDto,
  UpsertSolutionDto,
} from '../../application/dtos/assignment.dto.js';

export type AssignmentDetailRecord = Prisma.AssignmentGetPayload<{
  include: {
    course: { select: { id: true; code: true; name: true; semester: true; lecturerId: true } };
    creator: { select: { id: true; fullName: true; email: true } };
    testCases: true;
    rubricRules: true;
    solutions: true;
    _count: { select: { submissions: true; testCases: true } };
  };
}>;

export type AssignmentListRecord = Prisma.AssignmentGetPayload<{
  include: { _count: { select: { submissions: true; testCases: true; rubricRules: true } } };
}>;

export type ProctoringAssignmentRecord = Prisma.AssignmentGetPayload<{
  include: {
    course: { select: {
      id: true; code: true; name: true; semester: true;
      enrollments: { include: { student: { select: {
        id: true; fullName: true; email: true; studentCode: true; avatarUrl: true;
      } } } };
    } };
    creator: { select: { id: true; fullName: true; email: true } };
    testCases: { select: { id: true; label: true; points: true } };
    submissions: { include: {
      user: { select: { id: true; fullName: true; studentCode: true } };
      testResults: { select: { id: true; testCaseId: true; verdict: true; earnedPoints: true } };
    } };
    examAccessGrants: { include: { student: { select: { id: true; fullName: true; studentCode: true } } } };
  };
}>;

export type ProctoringRoomRecord = Prisma.AssignmentGetPayload<{
  include: {
    course: { select: {
      id: true; code: true; name: true; semester: true;
      _count: { select: { enrollments: true } };
    } };
    creator: { select: { id: true; fullName: true; email: true } };
    _count: { select: { submissions: true; testCases: true; examAccessGrants: true } };
  };
}>;

export interface CreateAssignmentData {
  courseId: string;
  title: string;
  description?: string;
  environment: 'C_GCC' | 'JAVA_JDK' | 'REACT_JS';
  submissionType?: 'INDIVIDUAL' | 'GROUP';
  startTime?: Date;
  deadline: Date;
  durationMinutes?: number | null;
  accessCode?: string | null;
  maxFileSizeBytes?: bigint;
  allowGitSubmission?: boolean;
  allowZipSubmission?: boolean;
  status?: 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';
  gradingVersion?: number;
  gradingApprovalMode?: 'LECTURER_REVIEW' | 'AUTO_PUBLISH';
  functionalMaxScore?: number;
  algorithmMaxScore?: number;
  cleanCodeMaxScore?: number;
  pdfFilePath?: string | null;
  starterCodePath?: string | null;
  pausedAt?: Date | null;
  createdBy: string;
}

export interface IAssignmentRepository {
  findById(id: string): Promise<Assignment | null>;
  findDetailedById(id: string, includeHiddenTests?: boolean): Promise<AssignmentDetailRecord | null>;
  findByCourseId(courseId: string): Promise<AssignmentListRecord[]>;
  countSubmissions(assignmentId: string): Promise<number>;
  saveComplete(
    assignmentId: string,
    data: CreateAssignmentData,
    testCases: CreateTestCaseDto[],
    rubricRules: SetRubricRulesDto['rules'],
    solution?: UpsertSolutionDto,
    removeSolution?: boolean
  ): Promise<Assignment>;
  create(data: CreateAssignmentData): Promise<Assignment>;
  update(id: string, data: Partial<CreateAssignmentData>): Promise<Assignment>;
  deleteIfNoSubmissions(id: string): Promise<'DELETED' | 'NOT_FOUND' | 'HAS_SUBMISSIONS'>;

  // Test cases
  addTestCase(assignmentId: string, data: CreateTestCaseDto): Promise<TestCase>;
  updateTestCase(testCaseId: string, data: Partial<CreateTestCaseDto>): Promise<TestCase>;
  deleteTestCase(testCaseId: string): Promise<void>;
  getTestCases(assignmentId: string, includeHidden?: boolean): Promise<TestCase[]>;

  // Rubrics
  setRubricRules(assignmentId: string, rules: SetRubricRulesDto['rules']): Promise<RubricRule[]>;
  getRubricRules(assignmentId: string): Promise<RubricRule[]>;

  // Solutions (RAG)
  upsertSolution(assignmentId: string, data: UpsertSolutionDto): Promise<AssignmentSolution>;
  getSolutions(assignmentId: string): Promise<AssignmentSolution[]>;

  // Proctoring & Live Sessions
  getProctoringAssignment(assignmentId: string): Promise<ProctoringAssignmentRecord | null>;
  getAllAssignmentsForProctoring(lecturerId?: string): Promise<ProctoringRoomRecord[]>;
  unlockExam(assignmentId: string, studentId: string, accessCode: string): Promise<ExamSessionStatus>;
  getExamSessionStatus(assignmentId: string, studentId: string): Promise<ExamSessionStatus>;
  hasStudentExamAccess(assignmentId: string, studentId: string): Promise<boolean>;
  finalizeUnsubmittedStudents(assignmentId: string): Promise<number>;
  clearAutoZeroSubmissions(assignmentId: string): Promise<number>;
  publishAllGrades(assignmentId: string): Promise<{ publishedCount: number; averageScore: number }>;
}

export interface ExamSessionStatus {
  assignmentId: string;
  status: 'UPCOMING' | 'OPEN' | 'PAUSED' | 'ENDED' | 'CLOSED';
  assignmentStatus: 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';
  startTime: Date;
  deadline: Date;
  durationMinutes: number | null;
  pausedAt: Date | null;
}

