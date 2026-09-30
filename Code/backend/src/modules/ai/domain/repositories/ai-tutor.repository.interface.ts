import {
  AiTutorConversation,
  AiTutorMessage,
  MessageSenderRole,
} from '../entities/ai-tutor.entity.js';

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

export interface IAiTutorRepository {
  findConversationById(id: string): Promise<AiTutorConversation | null>;
  findConversationsByStudent(studentId: string): Promise<AiTutorConversation[]>;
  findConversationBySubmissionAndStudent(
    submissionId: string,
    studentId: string
  ): Promise<AiTutorConversation | null>;
  createConversation(data: CreateConversationData): Promise<AiTutorConversation>;
  addMessage(data: AddMessageData): Promise<AiTutorMessage>;
  getMessages(conversationId: string): Promise<AiTutorMessage[]>;
}
