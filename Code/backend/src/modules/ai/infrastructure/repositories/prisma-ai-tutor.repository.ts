import { PrismaClient } from '@prisma/client';
import {
  IAiTutorRepository,
  CreateConversationData,
  AddMessageData,
} from '../../domain/repositories/ai-tutor.repository.interface.js';
import {
  AiTutorConversation,
  AiTutorMessage,
  MessageSenderRole,
} from '../../domain/entities/ai-tutor.entity.js';

export class PrismaAiTutorRepository implements IAiTutorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toMessageDomain(raw: any): AiTutorMessage {
    return new AiTutorMessage({
      id: raw.id,
      conversationId: raw.conversationId,
      senderRole: raw.senderRole,
      content: raw.content,
      hasLeakageDetected: raw.hasLeakageDetected,
      tokenCount: raw.tokenCount,
      createdAt: raw.createdAt,
    });
  }

  private toConversationDomain(raw: any): AiTutorConversation {
    return new AiTutorConversation({
      id: raw.id,
      submissionId: raw.submissionId,
      studentId: raw.studentId,
      title: raw.title,
      status: raw.status,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      messages: raw.messages?.map((m: any) => this.toMessageDomain(m)),
    });
  }

  async findConversationById(id: string): Promise<AiTutorConversation | null> {
    const raw = await this.prisma.aiTutorConversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    return raw ? this.toConversationDomain(raw) : null;
  }

  async findConversationsByStudent(studentId: string): Promise<AiTutorConversation[]> {
    const list = await this.prisma.aiTutorConversation.findMany({
      where: { studentId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return list.map((r) => this.toConversationDomain(r));
  }

  async findConversationBySubmissionAndStudent(
    submissionId: string,
    studentId: string
  ): Promise<AiTutorConversation | null> {
    const raw = await this.prisma.aiTutorConversation.findFirst({
      where: { submissionId, studentId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    return raw ? this.toConversationDomain(raw) : null;
  }

  async createConversation(data: CreateConversationData): Promise<AiTutorConversation> {
    const raw = await this.prisma.aiTutorConversation.create({
      data: {
        submissionId: data.submissionId,
        studentId: data.studentId,
        title: data.title || 'Socratic Debug Session',
      },
      include: {
        messages: true,
      },
    });
    return this.toConversationDomain(raw);
  }

  async addMessage(data: AddMessageData): Promise<AiTutorMessage> {
    const raw = await this.prisma.aiTutorMessage.create({
      data: {
        conversationId: data.conversationId,
        senderRole: data.senderRole,
        content: data.content,
        hasLeakageDetected: data.hasLeakageDetected ?? false,
        tokenCount: data.tokenCount ?? 0,
      },
    });

    // Update conversation updatedAt
    await this.prisma.aiTutorConversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    return this.toMessageDomain(raw);
  }

  async getMessages(conversationId: string): Promise<AiTutorMessage[]> {
    const list = await this.prisma.aiTutorMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
    return list.map((m) => this.toMessageDomain(m));
  }
}
