import { Assignment } from '../entities/assignment.entity.js';

export interface CreateAssignmentData {
  courseId: string;
  title: string;
  description?: string;
  environment: 'C_GCC' | 'JAVA_JDK';
  submissionType?: 'INDIVIDUAL' | 'GROUP';
  startTime?: Date;
  deadline: Date;
  maxFileSizeBytes?: bigint;
  allowGitSubmission?: boolean;
  allowZipSubmission?: boolean;
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  createdBy: string;
}

export interface IAssignmentRepository {
  findById(id: string): Promise<Assignment | null>;
  findDetailedById(id: string, includeHiddenTests?: boolean): Promise<any | null>;
  findByCourseId(courseId: string): Promise<any[]>;
  create(data: CreateAssignmentData): Promise<Assignment>;
  update(id: string, data: Partial<CreateAssignmentData>): Promise<Assignment>;
  delete(id: string): Promise<void>;

  // Test cases
  addTestCase(assignmentId: string, data: any): Promise<any>;
  updateTestCase(testCaseId: string, data: any): Promise<any>;
  deleteTestCase(testCaseId: string): Promise<void>;
  getTestCases(assignmentId: string, includeHidden?: boolean): Promise<any[]>;

  // Rubrics
  setRubricRules(assignmentId: string, rules: any[]): Promise<any[]>;
  getRubricRules(assignmentId: string): Promise<any[]>;

  // Solutions (RAG)
  upsertSolution(assignmentId: string, data: any): Promise<any>;
  getSolutions(assignmentId: string): Promise<any[]>;
}
