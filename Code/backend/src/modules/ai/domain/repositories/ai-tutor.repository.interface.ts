import {
  AiTutorConversation,
  AiTutorMessage,
  MessageSenderRole,
} from '../entities/ai-tutor.entity.js';
import { AiTutorConfig, SocraticMode } from '../ai-tutor-config.js';

export interface TutorAssignmentContext {
  title: string;
  description: string | null;
  rubricRules: Array<{ criterionName: string; description: string; maxPoints: number }>;
}

export interface SaveAiTutorConfigData {
  courseId: string;
  socraticMode: SocraticMode;
  customPrompt: string;
  temperature: number;
  enableContext: boolean;
  updatedById: string;
}

export interface CreateConversationData {
  submissionId: string;
  studentId: string;
  title?: string;
}

export interface AddMessageData {
  conversationId: string;
  senderRole: MessageSenderRole;
  content: string;
  hasLeakageDetected?: boolean;
  tokenCount?: number;
}

export interface AddMessagePairData {
  conversationId: string;
  userContent: string;
  modelContent: string;
  hasLeakageDetected: boolean;
  modelTokenCount: number;
}

export interface IAiTutorRepository {
  getCourseLecturerId(courseId: string): Promise<string | null>;
  getCourseTutorConfig(courseId: string): Promise<AiTutorConfig | null>;
  saveCourseTutorConfig(data: SaveAiTutorConfigData): Promise<AiTutorConfig>;
  getTutorAssignmentContext(assignmentId: string, courseId: string): Promise<TutorAssignmentContext | null>;
  findConversationById(id: string): Promise<AiTutorConversation | null>;
  findConversationsByStudent(studentId: string): Promise<AiTutorConversation[]>;
  findConversationBySubmissionAndStudent(
    submissionId: string,
    studentId: string
  ): Promise<AiTutorConversation | null>;
  createConversation(data: CreateConversationData): Promise<AiTutorConversation>;
  addMessage(data: AddMessageData): Promise<AiTutorMessage>;
  addMessagePair(data: AddMessagePairData): Promise<{
    userMessage: AiTutorMessage;
    modelMessage: AiTutorMessage;
  }>;
  getMessages(conversationId: string): Promise<AiTutorMessage[]>;
}
